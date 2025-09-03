import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { TranslationCache } from './translation-cache.js';

export interface FileScanResult {
  filePath: string;
  chineseTextCount: number;
  fileSize: number;
  needsTranslation: boolean;
  priority: 'high' | 'medium' | 'low';
}

export interface BatchProcessingOptions {
  srcDir: string;
  filePatterns: string[];
  maxConcurrency?: number;
  prioritizeBy?: 'size' | 'count' | 'modified';
  skipCache?: boolean;
}

export class BatchProcessor {
  private cache: TranslationCache;
  private chineseRegex = /[\u4e00-\u9fff]/g;

  constructor(cacheDir?: string) {
    this.cache = new TranslationCache(cacheDir);
  }

  /**
   * Scan directory for files containing Chinese text
   */
  async scanFilesWithChinese(options: BatchProcessingOptions): Promise<FileScanResult[]> {
    const { srcDir, filePatterns, skipCache = false } = options;
    const results: FileScanResult[] = [];

    for (const pattern of filePatterns) {
      const globPattern = path.join(srcDir, pattern);
      const files = await glob(globPattern, { 
        ignore: ['**/node_modules/**', '**/build/**', '**/dist/**']
      });

      for (const file of files) {
        try {
          const scanResult = this.scanFile(file, skipCache);
          if (scanResult.chineseTextCount > 0) {
            results.push(scanResult);
          }
        } catch (error) {
          console.warn(`Failed to scan ${file}:`, (error as Error).message);
        }
      }
    }

    return this.prioritizeFiles(results, options.prioritizeBy);
  }

  /**
   * Scan a single file for Chinese text
   */
  private scanFile(filePath: string, skipCache: boolean): FileScanResult {
    const stats = fs.statSync(filePath);
    const content = fs.readFileSync(filePath, 'utf8');
    const matches = content.match(this.chineseRegex) || [];
    const chineseTextCount = this.countUniqueChineseStrings(content);
    
    // Check if file needs translation (unless skipping cache)
    const needsTranslation = skipCache || this.cache.needsTranslation(filePath);

    // Determine priority based on file characteristics
    const priority = this.determinePriority(filePath, chineseTextCount, stats.size);

    return {
      filePath,
      chineseTextCount,
      fileSize: stats.size,
      needsTranslation,
      priority
    };
  }

  /**
   * Count unique Chinese strings in file content
   */
  private countUniqueChineseStrings(content: string): number {
    const stringLiterals = this.extractStringLiterals(content);
    const chineseStrings = new Set<string>();

    stringLiterals.forEach(str => {
      if (this.chineseRegex.test(str)) {
        chineseStrings.add(str);
      }
    });

    return chineseStrings.size;
  }

  /**
   * Extract string literals from JavaScript/TypeScript content
   */
  private extractStringLiterals(content: string): string[] {
    const strings: string[] = [];
    const patterns = [
      // Single quotes
      /'([^'\\]|\\.)*'/g,
      // Double quotes  
      /"([^"\\]|\\.)*"/g,
      // Template literals
      /`([^`\\]|\\.)*`/g
    ];

    patterns.forEach(pattern => {
      const matches = content.match(pattern) || [];
      strings.push(...matches.map(match => match.slice(1, -1))); // Remove quotes
    });

    return strings;
  }

  /**
   * Determine file processing priority
   */
  private determinePriority(filePath: string, chineseCount: number, fileSize: number): 'high' | 'medium' | 'low' {
    // High priority: Core components, error handlers, small files with many strings
    if (
      filePath.includes('error') || 
      filePath.includes('Error') ||
      filePath.includes('core') ||
      filePath.includes('hook') ||
      (chineseCount > 10 && fileSize < 10000)
    ) {
      return 'high';
    }

    // Medium priority: UI components, forms, medium complexity
    if (
      filePath.includes('component') ||
      filePath.includes('Component') ||
      filePath.includes('form') ||
      filePath.includes('Form') ||
      filePath.includes('modal') ||
      filePath.includes('Modal') ||
      (chineseCount >= 5 && chineseCount <= 10)
    ) {
      return 'medium';
    }

    // Low priority: Config files, utilities, large files
    return 'low';
  }

  /**
   * Prioritize files for processing
   */
  private prioritizeFiles(results: FileScanResult[], prioritizeBy: string = 'count'): FileScanResult[] {
    return results.sort((a, b) => {
      // First priority: processing priority (high > medium > low)
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;

      // Second priority: based on option
      switch (prioritizeBy) {
        case 'size':
          return a.fileSize - b.fileSize; // Smaller files first
        case 'count':
          return b.chineseTextCount - a.chineseTextCount; // More strings first
        case 'modified':
          try {
            const statA = fs.statSync(a.filePath);
            const statB = fs.statSync(b.filePath);
            return statB.mtime.getTime() - statA.mtime.getTime(); // Recently modified first
          } catch {
            return 0;
          }
        default:
          return b.chineseTextCount - a.chineseTextCount;
      }
    });
  }

  /**
   * Group files for batch processing
   */
  groupFilesForBatching(files: FileScanResult[], maxConcurrency: number = 3): FileScanResult[][] {
    const groups: FileScanResult[][] = [];
    const smallFiles = files.filter(f => f.chineseTextCount <= 5);
    const mediumFiles = files.filter(f => f.chineseTextCount > 5 && f.chineseTextCount <= 15);
    const largeFiles = files.filter(f => f.chineseTextCount > 15);

    // Process small files in parallel batches
    for (let i = 0; i < smallFiles.length; i += maxConcurrency) {
      groups.push(smallFiles.slice(i, i + maxConcurrency));
    }

    // Process medium files in smaller batches
    for (let i = 0; i < mediumFiles.length; i += Math.max(1, Math.floor(maxConcurrency / 2))) {
      groups.push(mediumFiles.slice(i, i + Math.max(1, Math.floor(maxConcurrency / 2))));
    }

    // Process large files one at a time
    largeFiles.forEach(file => {
      groups.push([file]);
    });

    return groups;
  }

  /**
   * Generate processing report
   */
  generateScanReport(files: FileScanResult[]): {
    totalFiles: number;
    needTranslation: number;
    totalStrings: number;
    byPriority: Record<string, number>;
    estimatedTime: string;
  } {
    const needTranslation = files.filter(f => f.needsTranslation);
    const totalStrings = needTranslation.reduce((sum, f) => sum + f.chineseTextCount, 0);
    
    const byPriority = files.reduce((acc, file) => {
      if (file.needsTranslation) {
        acc[file.priority] = (acc[file.priority] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    // Estimate time: ~30 seconds per string (with caching improvements)
    const estimatedSeconds = totalStrings * 30;
    const estimatedTime = this.formatDuration(estimatedSeconds);

    return {
      totalFiles: files.length,
      needTranslation: needTranslation.length,
      totalStrings,
      byPriority,
      estimatedTime
    };
  }

  private formatDuration(seconds: number): string {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m ${seconds % 60}s`;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }

  /**
   * Quick scan for files with Chinese text (fast grep-like operation)
   */
  async quickScan(srcDir: string, patterns: string[]): Promise<string[]> {
    const filesWithChinese: string[] = [];

    for (const pattern of patterns) {
      const globPattern = path.join(srcDir, pattern);
      const files = await glob(globPattern, { 
        ignore: ['**/node_modules/**', '**/build/**', '**/dist/**']
      });

      for (const file of files) {
        try {
          const content = fs.readFileSync(file, 'utf8');
          if (this.chineseRegex.test(content)) {
            filesWithChinese.push(file);
          }
        } catch (error) {
          console.warn(`Failed to scan ${file}:`, (error as Error).message);
        }
      }
    }

    return filesWithChinese;
  }
}