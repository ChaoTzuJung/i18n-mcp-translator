#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import path from 'path';
import { BatchProcessor } from '../src/core/batch-processor.js';
import { ParallelProcessor } from '../src/core/parallel-processor.js';
import { TranslationMonitor } from '../src/core/translation-monitor.js';
import { CacheManager } from '../src/utils/cache-manager.js';
import { TranslationCache } from '../src/core/translation-cache.js';

const program = new Command();

program
  .name('i18n-batch-translate')
  .description('Batch translation tool with caching and parallel processing')
  .version('1.0.0');

program
  .command('scan')
  .description('Scan for files containing Chinese text')
  .option('-s, --src-dir <dir>', 'Source directory', 'src')
  .option('-p, --patterns <patterns>', 'File patterns (comma-separated)', '**/*.{js,ts,jsx,tsx}')
  .option('--skip-cache', 'Skip cache check', false)
  .option('--priority-by <method>', 'Prioritize by: size|count|modified', 'count')
  .action(async (options) => {
    try {
      const batchProcessor = new BatchProcessor();
      const patterns = options.patterns.split(',');
      
      console.log(chalk.blue('🔍 Scanning files for Chinese text...'));
      
      const files = await batchProcessor.scanFilesWithChinese({
        srcDir: options.srcDir,
        filePatterns: patterns,
        skipCache: options.skipCache,
        prioritizeBy: options.priorityBy
      });
      
      if (files.length === 0) {
        console.log(chalk.yellow('No files with Chinese text found.'));
        return;
      }
      
      const report = batchProcessor.generateScanReport(files);
      
      console.log(chalk.green('\n📊 Scan Results:'));
      console.log(`Total files found: ${report.totalFiles}`);
      console.log(`Files needing translation: ${report.needTranslation}`);
      console.log(`Total strings to translate: ${report.totalStrings}`);
      console.log(`Estimated time: ${report.estimatedTime}`);
      
      console.log(chalk.cyan('\nBy Priority:'));
      Object.entries(report.byPriority).forEach(([priority, count]) => {
        console.log(`  ${priority}: ${count} files`);
      });
      
      console.log(chalk.cyan('\nFiles to process:'));
      files.slice(0, 10).forEach(file => {
        const status = file.needsTranslation ? 
          chalk.red('needs translation') : 
          chalk.green('cached');
        const priority = file.priority === 'high' ? 
          chalk.red(file.priority) :
          file.priority === 'medium' ?
          chalk.yellow(file.priority) :
          chalk.green(file.priority);
        
        console.log(`  ${path.relative(process.cwd(), file.filePath)} [${priority}] (${file.chineseTextCount} strings) - ${status}`);
      });
      
      if (files.length > 10) {
        console.log(`  ... and ${files.length - 10} more files`);
      }
      
    } catch (error) {
      console.error(chalk.red('❌ Scan failed:'), (error as Error).message);
      process.exit(1);
    }
  });

program
  .command('translate')
  .description('Translate files with parallel processing and caching')
  .option('-s, --src-dir <dir>', 'Source directory', 'src')
  .option('-p, --patterns <patterns>', 'File patterns (comma-separated)', '**/*.{js,ts,jsx,tsx}')
  .option('-c, --concurrency <num>', 'Max concurrent translations', '3')
  .option('--cache-dir <dir>', 'Cache directory', '.translation-cache')
  .option('--dry-run', 'Show what would be translated without doing it', false)
  .option('--force', 'Force translation even if cached', false)
  .action(async (options) => {
    try {
      const batchProcessor = new BatchProcessor(options.cacheDir);
      const parallelProcessor = new ParallelProcessor(options.cacheDir, {
        maxConcurrency: parseInt(options.concurrency)
      });
      
      const patterns = options.patterns.split(',');
      
      console.log(chalk.blue('🔍 Scanning files...'));
      const files = await batchProcessor.scanFilesWithChinese({
        srcDir: options.srcDir,
        filePatterns: patterns,
        skipCache: options.force
      });
      
      const filesToProcess = files.filter(f => f.needsTranslation || options.force);
      
      if (filesToProcess.length === 0) {
        console.log(chalk.green('✅ All files are up to date (cached)'));
        return;
      }
      
      if (options.dryRun) {
        console.log(chalk.yellow(`\n🎯 Would translate ${filesToProcess.length} files:`));
        filesToProcess.forEach(file => {
          console.log(`  ${path.relative(process.cwd(), file.filePath)} (${file.chineseTextCount} strings)`);
        });
        return;
      }
      
      const monitor = new TranslationMonitor(filesToProcess.length, options.cacheDir);
      monitor.startProgressUpdates();
      
      console.log(chalk.blue(`🚀 Starting parallel translation of ${filesToProcess.length} files...`));
      
      // Mock translation function - replace with actual MCP call
      const translateFile = async (filePath: string): Promise<any> => {
        const taskId = path.basename(filePath);
        monitor.startTask(taskId, filePath, 5); // Assuming 5 strings on average
        
        // Simulate translation work
        await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));
        
        monitor.completeTask(taskId, 5);
        return { translated: true, strings: 5 };
      };
      
      const { results, summary } = await parallelProcessor.processWithIntelligentBatching(
        filesToProcess,
        translateFile
      );
      
      const metrics = monitor.completeSession();
      
      if (summary.failed > 0) {
        console.log(chalk.red('\n❌ Some files failed to translate:'));
        results.filter(r => !r.success).forEach(result => {
          console.log(chalk.red(`  ${result.filePath}: ${result.error}`));
        });
      }
      
    } catch (error) {
      console.error(chalk.red('❌ Translation failed:'), (error as Error).message);
      process.exit(1);
    }
  });

program
  .command('cache')
  .description('Manage translation cache')
  .option('--stats', 'Show cache statistics')
  .option('--clean', 'Clean old cache entries')
  .option('--verify', 'Verify cache integrity')
  .option('--clear', 'Clear all cache')
  .option('--export <file>', 'Export cache to file')
  .option('--import <file>', 'Import cache from file')
  .option('--cache-dir <dir>', 'Cache directory', '.translation-cache')
  .option('--max-age <days>', 'Maximum age for cleanup (days)', '30')
  .action(async (options) => {
    try {
      const cacheManager = new CacheManager(options.cacheDir);
      
      if (options.stats) {
        await cacheManager.displayStats();
      }
      
      if (options.clean) {
        const result = await cacheManager.cleanup({
          maxAgeInDays: parseInt(options.maxAge),
          verbose: true
        });
        
        console.log(chalk.green(`✅ Cleanup complete: ${result.filesRemoved} files removed, ${result.spaceSaved} saved`));
        
        if (result.errors.length > 0) {
          console.log(chalk.red('Errors encountered:'));
          result.errors.forEach(error => console.log(chalk.red(`  ${error}`)));
        }
      }
      
      if (options.verify) {
        await cacheManager.verify(true);
      }
      
      if (options.clear) {
        await cacheManager.clearCache();
      }
      
      if (options.export) {
        await cacheManager.exportCache(options.export);
      }
      
      if (options.import) {
        await cacheManager.importCache(options.import);
      }
      
      if (!options.stats && !options.clean && !options.verify && !options.clear && !options.export && !options.import) {
        console.log(chalk.yellow('Use --help to see available cache management options'));
      }
      
    } catch (error) {
      console.error(chalk.red('❌ Cache operation failed:'), (error as Error).message);
      process.exit(1);
    }
  });

program
  .command('quick-scan')
  .description('Quick scan for files with Chinese text (grep-like)')
  .option('-s, --src-dir <dir>', 'Source directory', 'src')
  .option('-p, --patterns <patterns>', 'File patterns (comma-separated)', '**/*.{js,ts,jsx,tsx}')
  .action(async (options) => {
    try {
      const batchProcessor = new BatchProcessor();
      const patterns = options.patterns.split(',');
      
      console.log(chalk.blue('⚡ Quick scanning files...'));
      const startTime = Date.now();
      
      const files = await batchProcessor.quickScan(options.srcDir, patterns);
      
      const duration = Date.now() - startTime;
      
      console.log(chalk.green(`\n⚡ Quick scan complete in ${duration}ms`));
      console.log(`Found ${files.length} files with Chinese text:`);
      
      files.forEach(file => {
        console.log(`  ${path.relative(process.cwd(), file)}`);
      });
      
    } catch (error) {
      console.error(chalk.red('❌ Quick scan failed:'), (error as Error).message);
      process.exit(1);
    }
  });

// Add help examples
program.addHelpText('after', `
Examples:
  $ i18n-batch-translate scan --src-dir src --patterns "**/*.js,**/*.tsx"
  $ i18n-batch-translate translate --concurrency 5 --cache-dir .cache
  $ i18n-batch-translate cache --stats --clean --max-age 7
  $ i18n-batch-translate quick-scan --src-dir components
`);

if (process.argv.length === 2) {
  program.help();
}

program.parse();