import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execSync } from 'child_process';

export interface CachedTranslation {
  original: string;
  key: string;
  translation: string;
  timestamp: number;
}

export interface FileCacheData {
  hash: string;
  timestamp: number;
  filePath: string;
  translatedStrings: CachedTranslation[];
  gitCommit?: string;
}

export class TranslationCache {
  private cacheDir: string;
  private stringCache: Map<string, CachedTranslation> = new Map();
  private stringCacheFile: string;

  constructor(cacheDir = '.translation-cache') {
    this.cacheDir = cacheDir;
    this.stringCacheFile = path.join(cacheDir, 'translation-strings.json');
    this.ensureCacheDir();
    this.loadStringCache();
  }

  private ensureCacheDir(): void {
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  private loadStringCache(): void {
    try {
      if (fs.existsSync(this.stringCacheFile)) {
        const data = JSON.parse(fs.readFileSync(this.stringCacheFile, 'utf8'));
        this.stringCache = new Map(Object.entries(data));
      }
    } catch (error) {
      console.warn('Failed to load string cache:', (error as Error).message);
    }
  }

  private saveStringCache(): void {
    try {
      const data = Object.fromEntries(this.stringCache);
      fs.writeFileSync(this.stringCacheFile, JSON.stringify(data, null, 2));
    } catch (error) {
      console.warn('Failed to save string cache:', (error as Error).message);
    }
  }

  generateFileHash(filePath: string): string {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      return crypto.createHash('md5').update(content).digest('hex');
    } catch (error) {
      throw new Error(`Failed to generate hash for ${filePath}: ${(error as Error).message}`);
    }
  }

  getGitCommitHash(filePath: string): string | null {
    try {
      return execSync(`git log -1 --format="%H" -- "${filePath}"`, { 
        encoding: 'utf8',
        stdio: 'pipe'
      }).trim();
    } catch {
      return null;
    }
  }

  needsTranslation(filePath: string): boolean {
    const cacheFile = this.getFileCacheFile(filePath);
    
    if (!fs.existsSync(cacheFile)) {
      return true;
    }

    try {
      const cachedData: FileCacheData = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
      const currentHash = this.generateFileHash(filePath);
      
      // Check file content hash
      if (cachedData.hash !== currentHash) {
        return true;
      }

      // Optional: Check git commit hash for more precise tracking
      if (cachedData.gitCommit) {
        const currentCommit = this.getGitCommitHash(filePath);
        if (currentCommit && cachedData.gitCommit !== currentCommit) {
          return true;
        }
      }

      return false;
    } catch (error) {
      console.warn(`Error checking cache for ${filePath}:`, (error as Error).message);
      return true;
    }
  }

  private getFileCacheFile(filePath: string): string {
    const safePath = filePath.replace(/[\/\\]/g, '_').replace(/[^a-zA-Z0-9_.-]/g, '');
    return path.join(this.cacheDir, `${safePath}.cache`);
  }

  saveFileCache(filePath: string, translatedStrings: CachedTranslation[] = []): void {
    try {
      const hash = this.generateFileHash(filePath);
      const gitCommit = this.getGitCommitHash(filePath);
      const cacheFile = this.getFileCacheFile(filePath);
      
      const cacheData: FileCacheData = {
        hash,
        timestamp: Date.now(),
        filePath,
        translatedStrings,
        ...(gitCommit && { gitCommit })
      };

      fs.writeFileSync(cacheFile, JSON.stringify(cacheData, null, 2));

      // Also save string translations to global cache
      translatedStrings.forEach(translation => {
        this.saveTranslation(translation.original, translation.key, translation.translation);
      });
    } catch (error) {
      console.error(`Failed to save cache for ${filePath}:`, (error as Error).message);
    }
  }

  getFileCache(filePath: string): FileCacheData | null {
    const cacheFile = this.getFileCacheFile(filePath);
    
    if (!fs.existsSync(cacheFile)) {
      return null;
    }

    try {
      return JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
    } catch (error) {
      console.warn(`Error reading cache for ${filePath}:`, (error as Error).message);
      return null;
    }
  }

  getTranslation(chineseText: string): CachedTranslation | null {
    const textHash = crypto.createHash('md5').update(chineseText).digest('hex');
    return this.stringCache.get(textHash) || null;
  }

  saveTranslation(chineseText: string, translationKey: string, englishText: string): void {
    const textHash = crypto.createHash('md5').update(chineseText).digest('hex');
    const translation: CachedTranslation = {
      original: chineseText,
      key: translationKey,
      translation: englishText,
      timestamp: Date.now()
    };
    
    this.stringCache.set(textHash, translation);
    this.saveStringCache();
  }

  batchCheckTranslations(chineseTexts: string[]): Map<string, CachedTranslation> {
    const results = new Map<string, CachedTranslation>();
    
    chineseTexts.forEach(text => {
      const cached = this.getTranslation(text);
      if (cached) {
        results.set(text, cached);
      }
    });
    
    return results;
  }

  cleanOldCache(maxAgeInDays: number = 30): void {
    const maxAge = Date.now() - (maxAgeInDays * 24 * 60 * 60 * 1000);
    let cleaned = 0;

    try {
      const cacheFiles = fs.readdirSync(this.cacheDir);
      
      for (const file of cacheFiles) {
        if (file.endsWith('.cache')) {
          const cachePath = path.join(this.cacheDir, file);
          const cacheData = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
          
          if (cacheData.timestamp < maxAge) {
            fs.unlinkSync(cachePath);
            cleaned++;
          }
        }
      }

      console.log(`🧹 Cleaned ${cleaned} old cache files`);
    } catch (error) {
      console.warn('Failed to clean old cache:', (error as Error).message);
    }
  }

  validateCache(): { valid: number; corrupted: number; repaired: number } {
    let valid = 0;
    let corrupted = 0;
    let repaired = 0;

    try {
      const cacheFiles = fs.readdirSync(this.cacheDir);
      
      for (const file of cacheFiles) {
        if (file.endsWith('.cache')) {
          const cachePath = path.join(this.cacheDir, file);
          
          try {
            JSON.parse(fs.readFileSync(cachePath, 'utf8'));
            valid++;
          } catch {
            console.warn(`❌ Corrupted cache file: ${file}`);
            fs.unlinkSync(cachePath);
            corrupted++;
          }
        }
      }

      // Validate and repair string cache
      try {
        this.loadStringCache();
        repaired++;
      } catch {
        console.warn('❌ Corrupted string cache, recreating...');
        this.stringCache = new Map();
        this.saveStringCache();
        repaired++;
      }
    } catch (error) {
      console.warn('Failed to validate cache:', (error as Error).message);
    }

    return { valid, corrupted, repaired };
  }

  getCacheStats(): { 
    fileCount: number; 
    stringCount: number; 
    totalSize: string; 
    oldestCache: string | null; 
    newestCache: string | null;
  } {
    try {
      const cacheFiles = fs.readdirSync(this.cacheDir).filter(f => f.endsWith('.cache'));
      let totalSize = 0;
      let oldestTimestamp = Number.MAX_SAFE_INTEGER;
      let newestTimestamp = 0;
      let oldestFile = null;
      let newestFile = null;

      for (const file of cacheFiles) {
        const cachePath = path.join(this.cacheDir, file);
        const stats = fs.statSync(cachePath);
        totalSize += stats.size;

        try {
          const cacheData = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
          if (cacheData.timestamp < oldestTimestamp) {
            oldestTimestamp = cacheData.timestamp;
            oldestFile = new Date(cacheData.timestamp).toLocaleString();
          }
          if (cacheData.timestamp > newestTimestamp) {
            newestTimestamp = cacheData.timestamp;
            newestFile = new Date(cacheData.timestamp).toLocaleString();
          }
        } catch {
          // Skip corrupted files
        }
      }

      return {
        fileCount: cacheFiles.length,
        stringCount: this.stringCache.size,
        totalSize: `${(totalSize / 1024).toFixed(2)} KB`,
        oldestCache: oldestFile,
        newestCache: newestFile
      };
    } catch {
      return {
        fileCount: 0,
        stringCount: 0,
        totalSize: '0 KB',
        oldestCache: null,
        newestCache: null
      };
    }
  }
}