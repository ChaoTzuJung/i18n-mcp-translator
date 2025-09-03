import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

export interface TranslationProgress {
  taskId: string;
  fileName: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'skipped';
  progress: number; // 0-100
  startTime?: number;
  endTime?: number;
  error?: string;
  translatedStrings?: number;
  totalStrings?: number;
}

export interface MonitoringSession {
  sessionId: string;
  startTime: number;
  endTime?: number;
  totalFiles: number;
  completed: number;
  failed: number;
  skipped: number;
  totalStrings: number;
  translatedStrings: number;
  estimatedTimeRemaining?: number;
  averageTimePerFile?: number;
}

export interface PerformanceMetrics {
  totalTime: number;
  averageTimePerFile: number;
  averageTimePerString: number;
  cacheHitRate: number;
  successRate: number;
  throughput: number; // files per minute
}

export class TranslationMonitor {
  private session: MonitoringSession;
  private tasks: Map<string, TranslationProgress> = new Map();
  private sessionFile: string;
  private metricsHistory: PerformanceMetrics[] = [];
  private refreshInterval?: NodeJS.Timeout;

  constructor(
    totalFiles: number,
    cacheDir: string = '.translation-cache'
  ) {
    this.session = {
      sessionId: `session_${Date.now()}`,
      startTime: Date.now(),
      totalFiles,
      completed: 0,
      failed: 0,
      skipped: 0,
      totalStrings: 0,
      translatedStrings: 0
    };

    this.sessionFile = path.join(cacheDir, 'translation-session.json');
    this.loadPreviousMetrics(cacheDir);
  }

  private loadPreviousMetrics(cacheDir: string): void {
    const metricsFile = path.join(cacheDir, 'performance-metrics.json');
    
    try {
      if (fs.existsSync(metricsFile)) {
        const data = JSON.parse(fs.readFileSync(metricsFile, 'utf8'));
        this.metricsHistory = data.metrics || [];
      }
    } catch (error) {
      console.warn('Failed to load performance metrics:', (error as Error).message);
    }
  }

  private saveMetrics(cacheDir: string): void {
    const metricsFile = path.join(cacheDir, 'performance-metrics.json');
    
    try {
      const data = {
        metrics: this.metricsHistory,
        lastUpdated: new Date().toISOString()
      };
      
      fs.writeFileSync(metricsFile, JSON.stringify(data, null, 2));
    } catch (error) {
      console.warn('Failed to save performance metrics:', (error as Error).message);
    }
  }

  /**
   * Start monitoring a file translation task
   */
  startTask(taskId: string, fileName: string, totalStrings: number = 0): void {
    const task: TranslationProgress = {
      taskId,
      fileName: path.basename(fileName),
      status: 'processing',
      progress: 0,
      startTime: Date.now(),
      totalStrings,
      translatedStrings: 0
    };

    this.tasks.set(taskId, task);
    this.session.totalStrings += totalStrings;
    this.saveSession();
    
    console.log(chalk.blue(`🔄 Starting: ${task.fileName} (${totalStrings} strings)`));
  }

  /**
   * Update task progress
   */
  updateTaskProgress(
    taskId: string, 
    progress: number, 
    translatedStrings?: number
  ): void {
    const task = this.tasks.get(taskId);
    if (!task) return;

    task.progress = Math.min(100, Math.max(0, progress));
    
    if (translatedStrings !== undefined) {
      const newlyTranslated = translatedStrings - (task.translatedStrings || 0);
      task.translatedStrings = translatedStrings;
      this.session.translatedStrings += newlyTranslated;
    }

    this.tasks.set(taskId, task);
    this.updateEstimates();
  }

  /**
   * Complete a task successfully
   */
  completeTask(
    taskId: string, 
    translatedStrings: number = 0, 
    skipped: boolean = false
  ): void {
    const task = this.tasks.get(taskId);
    if (!task) return;

    task.status = skipped ? 'skipped' : 'completed';
    task.progress = 100;
    task.endTime = Date.now();
    task.translatedStrings = translatedStrings;

    if (skipped) {
      this.session.skipped++;
      console.log(chalk.yellow(`⏭️  Skipped: ${task.fileName} (cached)`));
    } else {
      this.session.completed++;
      this.session.translatedStrings += translatedStrings;
      
      const duration = (task.endTime - (task.startTime || 0)) / 1000;
      console.log(chalk.green(`✅ Completed: ${task.fileName} (${translatedStrings} strings, ${duration.toFixed(1)}s)`));
    }

    this.tasks.set(taskId, task);
    this.updateEstimates();
    this.saveSession();
  }

  /**
   * Mark a task as failed
   */
  failTask(taskId: string, error: string): void {
    const task = this.tasks.get(taskId);
    if (!task) return;

    task.status = 'failed';
    task.endTime = Date.now();
    task.error = error;

    this.session.failed++;
    this.tasks.set(taskId, task);
    this.saveSession();

    console.log(chalk.red(`❌ Failed: ${task.fileName} - ${error}`));
  }

  /**
   * Update time estimates based on current progress
   */
  private updateEstimates(): void {
    const completedTasks = Array.from(this.tasks.values()).filter(
      t => t.status === 'completed' && t.startTime && t.endTime
    );

    if (completedTasks.length === 0) return;

    const totalDuration = completedTasks.reduce(
      (sum, task) => sum + ((task.endTime || 0) - (task.startTime || 0)), 
      0
    );

    this.session.averageTimePerFile = totalDuration / completedTasks.length;

    const remainingFiles = this.session.totalFiles - this.session.completed - this.session.failed - this.session.skipped;
    this.session.estimatedTimeRemaining = remainingFiles * this.session.averageTimePerFile;
  }

  /**
   * Get current session summary
   */
  getSessionSummary(): MonitoringSession {
    return { ...this.session };
  }

  /**
   * Display real-time progress
   */
  displayProgress(): void {
    const completed = this.session.completed + this.session.skipped;
    const total = this.session.totalFiles;
    const percentage = total > 0 ? ((completed / total) * 100).toFixed(1) : '0.0';
    
    const elapsed = (Date.now() - this.session.startTime) / 1000;
    const eta = this.session.estimatedTimeRemaining ? 
      (this.session.estimatedTimeRemaining / 1000).toFixed(0) : '?';

    console.log(chalk.cyan(`\n📊 Progress: ${percentage}% (${completed}/${total})`));
    console.log(chalk.cyan(`⏱️  Elapsed: ${elapsed.toFixed(1)}s | ETA: ${eta}s`));
    console.log(chalk.cyan(`✅ Completed: ${this.session.completed} | ⏭️  Skipped: ${this.session.skipped} | ❌ Failed: ${this.session.failed}`));
    console.log(chalk.cyan(`🔤 Strings: ${this.session.translatedStrings}/${this.session.totalStrings}`));
    
    // Show active tasks
    const activeTasks = Array.from(this.tasks.values()).filter(t => t.status === 'processing');
    if (activeTasks.length > 0) {
      console.log(chalk.cyan(`\n🔄 Currently processing:`));
      activeTasks.forEach(task => {
        console.log(chalk.cyan(`   ${task.fileName} (${task.progress.toFixed(1)}%)`));
      });
    }
    
    console.log(''); // Add spacing
  }

  /**
   * Start automatic progress updates
   */
  startProgressUpdates(intervalMs: number = 10000): void {
    this.refreshInterval = setInterval(() => {
      this.displayProgress();
    }, intervalMs);
  }

  /**
   * Stop automatic progress updates
   */
  stopProgressUpdates(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = undefined;
    }
  }

  /**
   * Complete the monitoring session
   */
  completeSession(): PerformanceMetrics {
    this.session.endTime = Date.now();
    this.stopProgressUpdates();

    const metrics = this.calculateMetrics();
    this.metricsHistory.push(metrics);
    this.saveMetrics('.translation-cache');

    // Display final summary
    this.displayFinalSummary(metrics);

    return metrics;
  }

  /**
   * Calculate performance metrics
   */
  private calculateMetrics(): PerformanceMetrics {
    const totalTime = (this.session.endTime || Date.now()) - this.session.startTime;
    const completedFiles = this.session.completed + this.session.skipped;
    const successRate = this.session.totalFiles > 0 ? 
      (completedFiles / this.session.totalFiles) * 100 : 0;
    
    const cacheHitRate = this.session.totalFiles > 0 ?
      (this.session.skipped / this.session.totalFiles) * 100 : 0;

    return {
      totalTime,
      averageTimePerFile: this.session.averageTimePerFile || 0,
      averageTimePerString: this.session.translatedStrings > 0 ?
        totalTime / this.session.translatedStrings : 0,
      cacheHitRate,
      successRate,
      throughput: totalTime > 0 ? (completedFiles / (totalTime / 60000)) : 0 // files per minute
    };
  }

  /**
   * Display final summary with performance metrics
   */
  private displayFinalSummary(metrics: PerformanceMetrics): void {
    console.log(chalk.green('\n🎉 Translation Session Complete!'));
    console.log(chalk.green('=' .repeat(50)));
    
    console.log(chalk.white(`📁 Files: ${this.session.completed + this.session.skipped}/${this.session.totalFiles}`));
    console.log(chalk.green(`✅ Completed: ${this.session.completed}`));
    console.log(chalk.yellow(`⏭️  Skipped (cached): ${this.session.skipped}`));
    console.log(chalk.red(`❌ Failed: ${this.session.failed}`));
    
    console.log(chalk.white(`🔤 Strings translated: ${this.session.translatedStrings}`));
    console.log(chalk.white(`⏱️  Total time: ${(metrics.totalTime / 1000).toFixed(1)}s`));
    console.log(chalk.white(`📈 Success rate: ${metrics.successRate.toFixed(1)}%`));
    console.log(chalk.white(`💾 Cache hit rate: ${metrics.cacheHitRate.toFixed(1)}%`));
    console.log(chalk.white(`🚀 Throughput: ${metrics.throughput.toFixed(1)} files/min`));

    if (metrics.averageTimePerFile > 0) {
      console.log(chalk.white(`⚡ Avg time per file: ${(metrics.averageTimePerFile / 1000).toFixed(1)}s`));
    }

    // Show time savings from cache
    if (this.session.skipped > 0) {
      const estimatedSavedTime = this.session.skipped * (metrics.averageTimePerFile || 60000);
      console.log(chalk.cyan(`💰 Time saved by cache: ${(estimatedSavedTime / 1000).toFixed(0)}s`));
    }

    console.log(chalk.green('=' .repeat(50)));
  }

  /**
   * Save session data
   */
  private saveSession(): void {
    try {
      const sessionData = {
        session: this.session,
        tasks: Array.from(this.tasks.entries()),
        timestamp: new Date().toISOString()
      };
      
      fs.writeFileSync(this.sessionFile, JSON.stringify(sessionData, null, 2));
    } catch (error) {
      console.warn('Failed to save session data:', (error as Error).message);
    }
  }

  /**
   * Get performance comparison with previous sessions
   */
  getPerformanceComparison(): {
    current: PerformanceMetrics;
    average: Partial<PerformanceMetrics>;
    improvement: Partial<PerformanceMetrics>;
  } | null {
    if (this.metricsHistory.length === 0) return null;

    const current = this.calculateMetrics();
    const previous = this.metricsHistory.slice(-5); // Last 5 sessions
    
    const average = {
      totalTime: previous.reduce((sum, m) => sum + m.totalTime, 0) / previous.length,
      averageTimePerFile: previous.reduce((sum, m) => sum + m.averageTimePerFile, 0) / previous.length,
      successRate: previous.reduce((sum, m) => sum + m.successRate, 0) / previous.length,
      throughput: previous.reduce((sum, m) => sum + m.throughput, 0) / previous.length
    };

    const improvement = {
      throughput: ((current.throughput - average.throughput!) / average.throughput!) * 100,
      successRate: current.successRate - average.successRate!,
      averageTimePerFile: ((average.averageTimePerFile! - current.averageTimePerFile) / average.averageTimePerFile!) * 100
    };

    return { current, average, improvement };
  }
}