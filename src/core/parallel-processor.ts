import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';
import { fileURLToPath } from 'url';
import path from 'path';
import { TranslationCache } from './translation-cache.js';
import { MCPCacheWrapper } from './mcp-cache-wrapper.js';
import { FileScanResult } from './batch-processor.js';

export interface ProcessingTask {
  id: string;
  filePath: string;
  priority: 'high' | 'medium' | 'low';
  options?: any;
}

export interface ProcessingResult {
  taskId: string;
  filePath: string;
  success: boolean;
  result?: any;
  error?: string;
  duration: number;
}

export interface ParallelProcessingOptions {
  maxWorkers?: number;
  maxConcurrency?: number;
  timeoutMs?: number;
  useWorkers?: boolean;
}

export class ParallelProcessor {
  private translationCache: TranslationCache;
  private mcpCache: MCPCacheWrapper;
  private options: Required<ParallelProcessingOptions>;
  private activeWorkers: Set<Worker> = new Set();
  private taskQueue: ProcessingTask[] = [];
  private activeTasks: Map<string, ProcessingTask> = new Map();
  private results: ProcessingResult[] = [];

  constructor(
    cacheDir?: string, 
    options: ParallelProcessingOptions = {}
  ) {
    this.translationCache = new TranslationCache(cacheDir);
    this.mcpCache = new MCPCacheWrapper({ cacheDir });
    
    this.options = {
      maxWorkers: options.maxWorkers || Math.max(1, Math.floor(require('os').cpus().length / 2)),
      maxConcurrency: options.maxConcurrency || 3,
      timeoutMs: options.timeoutMs || 300000, // 5 minutes
      useWorkers: options.useWorkers ?? false // Disabled by default due to MCP complexity
    };
  }

  /**
   * Process files in parallel using Promise-based concurrency
   */
  async processFilesInParallel(
    files: FileScanResult[],
    processingFn: (filePath: string, options?: any) => Promise<any>,
    options?: { onProgress?: (result: ProcessingResult) => void }
  ): Promise<ProcessingResult[]> {
    const tasks: ProcessingTask[] = files.map((file, index) => ({
      id: `task_${index}`,
      filePath: file.filePath,
      priority: file.priority
    }));

    if (this.options.useWorkers) {
      return this.processWithWorkers(tasks, options);
    } else {
      return this.processWithPromises(tasks, processingFn, options);
    }
  }

  /**
   * Process tasks using Promise-based concurrency (recommended)
   */
  private async processWithPromises(
    tasks: ProcessingTask[],
    processingFn: (filePath: string, options?: any) => Promise<any>,
    options?: { onProgress?: (result: ProcessingResult) => void }
  ): Promise<ProcessingResult[]> {
    const results: ProcessingResult[] = [];
    const semaphore = new Semaphore(this.options.maxConcurrency);

    // Group tasks by priority for ordered processing
    const taskGroups = this.groupTasksByPriority(tasks);
    
    for (const [priority, priorityTasks] of Object.entries(taskGroups)) {
      console.log(`🚀 Processing ${priorityTasks.length} ${priority} priority files`);
      
      const promises = priorityTasks.map(async (task) => {
        const permit = await semaphore.acquire();
        
        try {
          return await this.processTaskWithPromise(task, processingFn, options);
        } finally {
          permit();
        }
      });

      const batchResults = await Promise.allSettled(promises);
      
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          // Handle rejected promises
          const task = priorityTasks[index];
          const errorResult: ProcessingResult = {
            taskId: task.id,
            filePath: task.filePath,
            success: false,
            error: result.reason?.message || 'Unknown error',
            duration: 0
          };
          results.push(errorResult);
          
          if (options?.onProgress) {
            options.onProgress(errorResult);
          }
        }
      });
    }

    return results;
  }

  /**
   * Process a single task with caching and timeout
   */
  private async processTaskWithPromise(
    task: ProcessingTask,
    processingFn: (filePath: string, options?: any) => Promise<any>,
    options?: { onProgress?: (result: ProcessingResult) => void }
  ): Promise<ProcessingResult> {
    const startTime = Date.now();
    
    try {
      // Check if file needs translation
      if (!this.translationCache.needsTranslation(task.filePath)) {
        console.log(`⏭️  Skipping ${path.basename(task.filePath)} (cached)`);
        
        const result: ProcessingResult = {
          taskId: task.id,
          filePath: task.filePath,
          success: true,
          result: 'skipped_cached',
          duration: Date.now() - startTime
        };
        
        if (options?.onProgress) {
          options.onProgress(result);
        }
        
        return result;
      }

      // Add timeout wrapper
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Processing timeout')), this.options.timeoutMs);
      });

      const processingPromise = processingFn(task.filePath, task.options);
      const taskResult = await Promise.race([processingPromise, timeoutPromise]);

      const result: ProcessingResult = {
        taskId: task.id,
        filePath: task.filePath,
        success: true,
        result: taskResult,
        duration: Date.now() - startTime
      };

      if (options?.onProgress) {
        options.onProgress(result);
      }

      return result;

    } catch (error) {
      const result: ProcessingResult = {
        taskId: task.id,
        filePath: task.filePath,
        success: false,
        error: (error as Error).message,
        duration: Date.now() - startTime
      };

      if (options?.onProgress) {
        options.onProgress(result);
      }

      return result;
    }
  }

  /**
   * Group tasks by priority for ordered processing
   */
  private groupTasksByPriority(tasks: ProcessingTask[]): Record<string, ProcessingTask[]> {
    const groups: Record<string, ProcessingTask[]> = {
      high: [],
      medium: [],
      low: []
    };

    tasks.forEach(task => {
      groups[task.priority].push(task);
    });

    return groups;
  }

  /**
   * Process tasks using worker threads (experimental)
   */
  private async processWithWorkers(
    tasks: ProcessingTask[],
    options?: { onProgress?: (result: ProcessingResult) => void }
  ): Promise<ProcessingResult[]> {
    return new Promise((resolve, reject) => {
      const results: ProcessingResult[] = [];
      let completedTasks = 0;
      let workersCreated = 0;

      const processNextBatch = () => {
        const batch = tasks.splice(0, this.options.maxWorkers);
        if (batch.length === 0) return;

        batch.forEach(task => {
          const worker = this.createWorker(task);
          workersCreated++;

          worker.on('message', (result: ProcessingResult) => {
            results.push(result);
            completedTasks++;

            if (options?.onProgress) {
              options.onProgress(result);
            }

            this.activeWorkers.delete(worker);
            worker.terminate();

            if (completedTasks === tasks.length + batch.length) {
              resolve(results);
            } else if (tasks.length > 0) {
              processNextBatch();
            }
          });

          worker.on('error', (error) => {
            const errorResult: ProcessingResult = {
              taskId: task.id,
              filePath: task.filePath,
              success: false,
              error: error.message,
              duration: 0
            };
            
            results.push(errorResult);
            completedTasks++;

            this.activeWorkers.delete(worker);
            worker.terminate();

            if (completedTasks === tasks.length + batch.length) {
              resolve(results);
            }
          });
        });
      };

      processNextBatch();

      // Timeout for the entire operation
      setTimeout(() => {
        this.terminateAllWorkers();
        reject(new Error('Parallel processing timeout'));
      }, this.options.timeoutMs * 2);
    });
  }

  /**
   * Create a worker for processing a task
   */
  private createWorker(task: ProcessingTask): Worker {
    const worker = new Worker(__filename, {
      workerData: { task, options: this.options }
    });

    this.activeWorkers.add(worker);
    return worker;
  }

  /**
   * Terminate all active workers
   */
  private terminateAllWorkers(): void {
    this.activeWorkers.forEach(worker => {
      worker.terminate();
    });
    this.activeWorkers.clear();
  }

  /**
   * Process files with intelligent batching and caching
   */
  async processWithIntelligentBatching(
    files: FileScanResult[],
    processingFn: (filePath: string) => Promise<any>
  ): Promise<{
    results: ProcessingResult[];
    summary: {
      totalFiles: number;
      processed: number;
      skipped: number;
      failed: number;
      totalTime: number;
      averageTime: number;
    };
  }> {
    const startTime = Date.now();
    
    // Filter files that need translation
    const filesToProcess = files.filter(file => 
      this.translationCache.needsTranslation(file.filePath)
    );
    
    console.log(`📊 Processing ${filesToProcess.length} files (${files.length - filesToProcess.length} skipped from cache)`);
    
    const results = await this.processFilesInParallel(filesToProcess, processingFn);
    
    const totalTime = Date.now() - startTime;
    const processed = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    const skipped = files.length - filesToProcess.length;
    
    const summary = {
      totalFiles: files.length,
      processed,
      skipped,
      failed,
      totalTime,
      averageTime: processed > 0 ? totalTime / processed : 0
    };

    return { results, summary };
  }
}

/**
 * Semaphore for controlling concurrency
 */
class Semaphore {
  private permits: number;
  private tasks: Array<() => void> = [];

  constructor(permits: number) {
    this.permits = permits;
  }

  async acquire(): Promise<() => void> {
    return new Promise((resolve) => {
      const task = () => resolve(() => this.release());
      
      if (this.permits > 0) {
        this.permits--;
        task();
      } else {
        this.tasks.push(task);
      }
    });
  }

  release(): void {
    this.permits++;
    
    if (this.tasks.length > 0) {
      this.permits--;
      const task = this.tasks.shift()!;
      task();
    }
  }
}

// Worker thread code (if using workers)
if (!isMainThread && parentPort) {
  const { task, options } = workerData as { task: ProcessingTask; options: any };
  
  // Worker implementation would go here
  // This is a simplified placeholder
  parentPort.postMessage({
    taskId: task.id,
    filePath: task.filePath,
    success: true,
    result: 'worker_processed',
    duration: 1000
  } as ProcessingResult);
}