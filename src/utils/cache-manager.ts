import fs from 'fs';
import path from 'path';
import { TranslationCache } from '../core/translation-cache.js';
import { MCPCacheWrapper } from '../core/mcp-cache-wrapper.js';
import chalk from 'chalk';

export interface CacheStats {
  translation: {
    fileCount: number;
    stringCount: number;
    totalSize: string;
    oldestCache: string | null;
    newestCache: string | null;
  };
  mcp: {
    totalEntries: number;
    expiredEntries: number;
    totalSize: string;
    oldestEntry?: string;
    newestEntry?: string;
  };
  overall: {
    totalSize: string;
    lastCleanup?: string;
    cacheHitRate?: number;
  };
}

export interface CleanupOptions {
  maxAgeInDays?: number;
  removeCorrupted?: boolean;
  removeExpired?: boolean;
  compactCache?: boolean;
  verbose?: boolean;
}

export class CacheManager {
  private translationCache: TranslationCache;
  private mcpCache: MCPCacheWrapper;
  private cacheDir: string;

  constructor(cacheDir: string = '.translation-cache') {
    this.cacheDir = cacheDir;
    this.translationCache = new TranslationCache(cacheDir);
    this.mcpCache = new MCPCacheWrapper({ cacheDir });
  }

  /**
   * Get comprehensive cache statistics
   */
  async getCacheStats(): Promise<CacheStats> {
    const translationStats = this.translationCache.getCacheStats();
    const mcpStats = this.mcpCache.getCacheStats();
    
    // Calculate total size
    let totalSizeBytes = 0;
    try {
      const files = await fs.promises.readdir(this.cacheDir);
      for (const file of files) {
        const filePath = path.join(this.cacheDir, file);
        const stat = await fs.promises.stat(filePath);
        if (stat.isFile()) {
          totalSizeBytes += stat.size;
        }
      }
    } catch (error) {
      console.warn('Error calculating total cache size:', (error as Error).message);
    }

    const lastCleanupFile = path.join(this.cacheDir, '.last-cleanup');
    let lastCleanup: string | undefined;
    try {
      if (fs.existsSync(lastCleanupFile)) {
        const timestamp = fs.readFileSync(lastCleanupFile, 'utf8').trim();
        lastCleanup = new Date(parseInt(timestamp)).toLocaleString();
      }
    } catch {
      // Ignore errors
    }

    return {
      translation: translationStats,
      mcp: mcpStats,
      overall: {
        totalSize: `${(totalSizeBytes / 1024).toFixed(2)} KB`,
        lastCleanup
      }
    };
  }

  /**
   * Display detailed cache statistics
   */
  async displayStats(): Promise<void> {
    const stats = await this.getCacheStats();

    console.log(chalk.blue('\n📊 Translation Cache Statistics'));
    console.log(chalk.blue('=' .repeat(50)));
    
    console.log(chalk.white('Translation Cache:'));
    console.log(`  📁 Files cached: ${stats.translation.fileCount}`);
    console.log(`  🔤 Strings cached: ${stats.translation.stringCount}`);
    console.log(`  💾 Size: ${stats.translation.totalSize}`);
    console.log(`  📅 Oldest: ${stats.translation.oldestCache || 'N/A'}`);
    console.log(`  📅 Newest: ${stats.translation.newestCache || 'N/A'}`);

    console.log(chalk.white('\nMCP Response Cache:'));
    console.log(`  📦 Entries: ${stats.mcp.totalEntries}`);
    console.log(`  ⏰ Expired: ${stats.mcp.expiredEntries}`);
    console.log(`  💾 Size: ${stats.mcp.totalSize}`);
    console.log(`  📅 Oldest: ${stats.mcp.oldestEntry || 'N/A'}`);
    console.log(`  📅 Newest: ${stats.mcp.newestEntry || 'N/A'}`);

    console.log(chalk.white('\nOverall:'));
    console.log(`  💾 Total size: ${stats.overall.totalSize}`);
    console.log(`  🧹 Last cleanup: ${stats.overall.lastCleanup || 'Never'}`);

    if (stats.overall.cacheHitRate !== undefined) {
      console.log(`  📈 Hit rate: ${stats.overall.cacheHitRate.toFixed(1)}%`);
    }

    console.log(chalk.blue('=' .repeat(50)));
  }

  /**
   * Clean up cache with various options
   */
  async cleanup(options: CleanupOptions = {}): Promise<{
    filesRemoved: number;
    spaceSaved: string;
    errors: string[];
  }> {
    const {
      maxAgeInDays = 30,
      removeCorrupted = true,
      removeExpired = true,
      compactCache = true,
      verbose = false
    } = options;

    const results = {
      filesRemoved: 0,
      spaceSaved: '0 KB',
      errors: [] as string[]
    };

    let totalSpaceSaved = 0;

    if (verbose) {
      console.log(chalk.yellow(`🧹 Starting cache cleanup (max age: ${maxAgeInDays} days)`));
    }

    try {
      // Clean old translation cache files
      if (verbose) console.log('Cleaning translation cache...');
      this.translationCache.cleanOldCache(maxAgeInDays);

      // Clean expired MCP responses
      if (removeExpired) {
        if (verbose) console.log('Cleaning expired MCP responses...');
        // Note: MCPCacheWrapper handles this automatically
      }

      // Validate and remove corrupted files
      if (removeCorrupted) {
        if (verbose) console.log('Validating cache integrity...');
        const validation = this.translationCache.validateCache();
        results.filesRemoved += validation.corrupted;
        
        if (verbose && validation.corrupted > 0) {
          console.log(`Removed ${validation.corrupted} corrupted files`);
        }
      }

      // Clean up orphaned or temporary files
      const files = await fs.promises.readdir(this.cacheDir);
      for (const file of files) {
        const filePath = path.join(this.cacheDir, file);
        
        try {
          const stat = await fs.promises.stat(filePath);
          
          // Remove temporary files
          if (file.startsWith('.tmp') || file.endsWith('.tmp')) {
            totalSpaceSaved += stat.size;
            await fs.promises.unlink(filePath);
            results.filesRemoved++;
            
            if (verbose) {
              console.log(`Removed temporary file: ${file}`);
            }
          }
          
          // Remove old log files
          if (file.endsWith('.log') && this.isOlderThan(stat.mtime, maxAgeInDays)) {
            totalSpaceSaved += stat.size;
            await fs.promises.unlink(filePath);
            results.filesRemoved++;
            
            if (verbose) {
              console.log(`Removed old log file: ${file}`);
            }
          }
        } catch (error) {
          results.errors.push(`Failed to process ${file}: ${(error as Error).message}`);
        }
      }

      // Compact cache if requested
      if (compactCache) {
        if (verbose) console.log('Compacting cache...');
        // This would involve rewriting cache files to remove fragmentation
        // For now, we'll just ensure the cache is optimized
      }

      results.spaceSaved = `${(totalSpaceSaved / 1024).toFixed(2)} KB`;

      // Record cleanup timestamp
      const lastCleanupFile = path.join(this.cacheDir, '.last-cleanup');
      await fs.promises.writeFile(lastCleanupFile, Date.now().toString());

      if (verbose) {
        console.log(chalk.green(`✅ Cleanup complete: ${results.filesRemoved} files removed, ${results.spaceSaved} saved`));
      }

    } catch (error) {
      results.errors.push(`Cleanup error: ${(error as Error).message}`);
    }

    return results;
  }

  /**
   * Verify cache integrity and repair if necessary
   */
  async verify(fix: boolean = false): Promise<{
    valid: number;
    corrupted: number;
    repaired: number;
    errors: string[];
  }> {
    console.log(chalk.yellow('🔍 Verifying cache integrity...'));
    
    const results = {
      valid: 0,
      corrupted: 0,
      repaired: 0,
      errors: [] as string[]
    };

    try {
      // Verify translation cache
      const translationValidation = this.translationCache.validateCache();
      results.valid += translationValidation.valid;
      results.corrupted += translationValidation.corrupted;
      results.repaired += translationValidation.repaired;

      // Verify MCP cache
      // MCPCacheWrapper doesn't have a validate method, so we'll check manually
      const mcpCacheFile = path.join(this.cacheDir, 'mcp-responses.json');
      if (fs.existsSync(mcpCacheFile)) {
        try {
          JSON.parse(fs.readFileSync(mcpCacheFile, 'utf8'));
          results.valid++;
        } catch {
          results.corrupted++;
          
          if (fix) {
            // Backup corrupted file and recreate
            const backupFile = `${mcpCacheFile}.backup.${Date.now()}`;
            fs.copyFileSync(mcpCacheFile, backupFile);
            fs.writeFileSync(mcpCacheFile, '{}');
            results.repaired++;
            
            console.log(chalk.yellow(`⚠️  Repaired corrupted MCP cache (backup saved to ${path.basename(backupFile)})`));
          }
        }
      }

      // Verify directory structure
      const requiredFiles = ['.gitignore'];
      for (const file of requiredFiles) {
        const filePath = path.join(this.cacheDir, file);
        if (!fs.existsSync(filePath)) {
          if (fix) {
            if (file === '.gitignore') {
              fs.writeFileSync(filePath, '# Translation cache files\n*.cache\n*.json\n*.log\n');
              results.repaired++;
            }
          }
        }
      }

    } catch (error) {
      results.errors.push(`Verification error: ${(error as Error).message}`);
    }

    console.log(chalk.green(`✅ Verification complete: ${results.valid} valid, ${results.corrupted} corrupted, ${results.repaired} repaired`));
    
    if (results.errors.length > 0) {
      console.log(chalk.red('❌ Errors encountered:'));
      results.errors.forEach(error => console.log(chalk.red(`   ${error}`)));
    }

    return results;
  }

  /**
   * Export cache data for backup
   */
  async exportCache(outputFile: string): Promise<void> {
    console.log(chalk.yellow(`📦 Exporting cache to ${outputFile}...`));

    try {
      const exportData = {
        timestamp: new Date().toISOString(),
        version: '1.0',
        translation: {
          strings: {},
          files: [] as Array<{ file: string; data: any }>
        },
        mcp: {},
        stats: await this.getCacheStats()
      };

      // Export translation cache
      const stringCacheFile = path.join(this.cacheDir, 'translation-strings.json');
      if (fs.existsSync(stringCacheFile)) {
        exportData.translation.strings = JSON.parse(fs.readFileSync(stringCacheFile, 'utf8'));
      }

      // Export file caches
      const files = await fs.promises.readdir(this.cacheDir);
      for (const file of files) {
        if (file.endsWith('.cache')) {
          const cachePath = path.join(this.cacheDir, file);
          const cacheData = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
          exportData.translation.files.push({ file, data: cacheData });
        }
      }

      // Export MCP cache
      const mcpCacheFile = path.join(this.cacheDir, 'mcp-responses.json');
      if (fs.existsSync(mcpCacheFile)) {
        exportData.mcp = JSON.parse(fs.readFileSync(mcpCacheFile, 'utf8'));
      }

      await fs.promises.writeFile(outputFile, JSON.stringify(exportData, null, 2));
      
      console.log(chalk.green(`✅ Cache exported successfully to ${outputFile}`));
    } catch (error) {
      console.error(chalk.red(`❌ Export failed: ${(error as Error).message}`));
      throw error;
    }
  }

  /**
   * Import cache data from backup
   */
  async importCache(inputFile: string, merge: boolean = true): Promise<void> {
    console.log(chalk.yellow(`📥 Importing cache from ${inputFile}...`));

    try {
      const importData = JSON.parse(fs.readFileSync(inputFile, 'utf8'));

      if (!merge) {
        // Clear existing cache
        await this.clearCache();
      }

      // Import translation strings
      if (importData.translation?.strings) {
        const stringCacheFile = path.join(this.cacheDir, 'translation-strings.json');
        let existingStrings = {};
        
        if (merge && fs.existsSync(stringCacheFile)) {
          existingStrings = JSON.parse(fs.readFileSync(stringCacheFile, 'utf8'));
        }

        const mergedStrings = merge ? 
          { ...existingStrings, ...importData.translation.strings } : 
          importData.translation.strings;

        fs.writeFileSync(stringCacheFile, JSON.stringify(mergedStrings, null, 2));
      }

      // Import file caches
      if (importData.translation?.files) {
        for (const fileData of importData.translation.files) {
          const { file, data } = fileData as { file: string; data: any };
          const cachePath = path.join(this.cacheDir, file);
          fs.writeFileSync(cachePath, JSON.stringify(data, null, 2));
        }
      }

      // Import MCP cache
      if (importData.mcp) {
        const mcpCacheFile = path.join(this.cacheDir, 'mcp-responses.json');
        let existingMcp = {};
        
        if (merge && fs.existsSync(mcpCacheFile)) {
          existingMcp = JSON.parse(fs.readFileSync(mcpCacheFile, 'utf8'));
        }

        const mergedMcp = merge ? { ...existingMcp, ...importData.mcp } : importData.mcp;
        fs.writeFileSync(mcpCacheFile, JSON.stringify(mergedMcp, null, 2));
      }

      console.log(chalk.green(`✅ Cache imported successfully from ${inputFile}`));
    } catch (error) {
      console.error(chalk.red(`❌ Import failed: ${(error as Error).message}`));
      throw error;
    }
  }

  /**
   * Clear all cache data
   */
  async clearCache(): Promise<void> {
    console.log(chalk.yellow('🧹 Clearing all cache data...'));

    try {
      const files = await fs.promises.readdir(this.cacheDir);
      
      for (const file of files) {
        if (file.startsWith('.') && !file.startsWith('.git')) {
          continue; // Skip hidden files except git files
        }
        
        const filePath = path.join(this.cacheDir, file);
        const stat = await fs.promises.stat(filePath);
        
        if (stat.isFile()) {
          await fs.promises.unlink(filePath);
        }
      }

      // Clear in-memory caches
      this.mcpCache.clearCache();

      console.log(chalk.green('✅ All cache data cleared'));
    } catch (error) {
      console.error(chalk.red(`❌ Clear cache failed: ${(error as Error).message}`));
      throw error;
    }
  }

  /**
   * Check if a file is older than specified days
   */
  private isOlderThan(date: Date, days: number): boolean {
    const ageMs = Date.now() - date.getTime();
    return ageMs > (days * 24 * 60 * 60 * 1000);
  }
}