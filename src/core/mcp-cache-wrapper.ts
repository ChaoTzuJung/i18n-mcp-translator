import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface MCPResponse {
  response: any;
  timestamp: number;
  expiresAt?: number;
}

export interface MCPCacheOptions {
  cacheDir?: string;
  defaultTTL?: number; // Time to live in milliseconds
  maxCacheSize?: number; // Maximum number of cached responses
}

export class MCPCacheWrapper {
  private responseCache: Map<string, MCPResponse> = new Map();
  private cacheFile: string;
  private options: Required<MCPCacheOptions>;

  constructor(options: MCPCacheOptions = {}) {
    this.options = {
      cacheDir: options.cacheDir || '.translation-cache',
      defaultTTL: options.defaultTTL || 7 * 24 * 60 * 60 * 1000, // 7 days
      maxCacheSize: options.maxCacheSize || 1000
    };

    this.cacheFile = path.join(this.options.cacheDir, 'mcp-responses.json');
    this.ensureCacheDir();
    this.loadResponseCache();
  }

  private ensureCacheDir(): void {
    if (!fs.existsSync(this.options.cacheDir)) {
      fs.mkdirSync(this.options.cacheDir, { recursive: true });
    }
  }

  private loadResponseCache(): void {
    try {
      if (fs.existsSync(this.cacheFile)) {
        const data = JSON.parse(fs.readFileSync(this.cacheFile, 'utf8'));
        this.responseCache = new Map(Object.entries(data).map(([key, value]) => [key, value as MCPResponse]));
        
        // Clean expired entries on load
        this.cleanExpiredEntries();
      }
    } catch (error) {
      console.warn('Failed to load MCP response cache:', (error as Error).message);
      this.responseCache = new Map();
    }
  }

  private saveResponseCache(): void {
    try {
      // Limit cache size
      if (this.responseCache.size > this.options.maxCacheSize) {
        this.trimCache();
      }

      const data = Object.fromEntries(this.responseCache);
      fs.writeFileSync(this.cacheFile, JSON.stringify(data, null, 2));
    } catch (error) {
      console.warn('Failed to save MCP response cache:', (error as Error).message);
    }
  }

  private trimCache(): void {
    // Sort by timestamp and remove oldest entries
    const entries = Array.from(this.responseCache.entries()).sort(
      (a, b) => a[1].timestamp - b[1].timestamp
    );

    const toRemove = entries.length - Math.floor(this.options.maxCacheSize * 0.8);
    for (let i = 0; i < toRemove; i++) {
      this.responseCache.delete(entries[i][0]);
    }
  }

  private cleanExpiredEntries(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, value] of this.responseCache.entries()) {
      if (value.expiresAt && value.expiresAt < now) {
        this.responseCache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`🧹 Cleaned ${cleaned} expired MCP cache entries`);
      this.saveResponseCache();
    }
  }

  /**
   * Generate cache key for file and content combination
   */
  generateCacheKey(filePath: string, fileContent: string, operation: string = 'translate'): string {
    const contentHash = crypto.createHash('md5').update(fileContent).digest('hex');
    const pathHash = crypto.createHash('md5').update(filePath).digest('hex');
    return `${operation}:${pathHash}:${contentHash}`;
  }

  /**
   * Generate cache key for specific text content
   */
  generateTextCacheKey(text: string, operation: string = 'translate', context?: string): string {
    const textHash = crypto.createHash('md5').update(text).digest('hex');
    const contextHash = context ? crypto.createHash('md5').update(context).digest('hex') : '';
    return `${operation}:text:${textHash}${contextHash ? ':' + contextHash : ''}`;
  }

  /**
   * Check if cached response exists and is still valid
   */
  getCachedResponse(cacheKey: string): any | null {
    const cached = this.responseCache.get(cacheKey);
    
    if (!cached) {
      return null;
    }

    // Check expiration
    if (cached.expiresAt && cached.expiresAt < Date.now()) {
      this.responseCache.delete(cacheKey);
      return null;
    }

    return cached.response;
  }

  /**
   * Cache MCP response
   */
  cacheResponse(cacheKey: string, response: any, ttl?: number): void {
    const expiresAt = ttl ? Date.now() + ttl : Date.now() + this.options.defaultTTL;
    
    this.responseCache.set(cacheKey, {
      response,
      timestamp: Date.now(),
      expiresAt
    });

    this.saveResponseCache();
  }

  /**
   * Cached wrapper for file translation
   */
  async cachedFileTranslation<T>(
    filePath: string,
    fileContent: string,
    translationFn: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cacheKey = this.generateCacheKey(filePath, fileContent);
    
    // Check cache first
    const cached = this.getCachedResponse(cacheKey);
    if (cached) {
      console.log(`📦 Using cached translation for ${path.basename(filePath)}`);
      return cached as T;
    }

    // Execute translation and cache result
    console.log(`🔄 Translating ${path.basename(filePath)} (not cached)`);
    const result = await translationFn();
    this.cacheResponse(cacheKey, result, ttl);
    
    return result;
  }

  /**
   * Cached wrapper for text translation
   */
  async cachedTextTranslation<T>(
    text: string,
    translationFn: () => Promise<T>,
    context?: string,
    ttl?: number
  ): Promise<T> {
    const cacheKey = this.generateTextCacheKey(text, 'translate', context);
    
    // Check cache first
    const cached = this.getCachedResponse(cacheKey);
    if (cached) {
      console.log(`📦 Using cached translation for text: "${text.substring(0, 30)}..."`);
      return cached as T;
    }

    // Execute translation and cache result
    console.log(`🔄 Translating text: "${text.substring(0, 30)}..." (not cached)`);
    const result = await translationFn();
    this.cacheResponse(cacheKey, result, ttl);
    
    return result;
  }

  /**
   * Batch check for cached translations
   */
  batchCheckCache(cacheKeys: string[]): Map<string, any> {
    const results = new Map<string, any>();
    
    cacheKeys.forEach(key => {
      const cached = this.getCachedResponse(key);
      if (cached) {
        results.set(key, cached);
      }
    });
    
    return results;
  }

  /**
   * Invalidate cache entries by pattern
   */
  invalidateByPattern(pattern: string): number {
    const regex = new RegExp(pattern);
    let invalidated = 0;

    for (const key of this.responseCache.keys()) {
      if (regex.test(key)) {
        this.responseCache.delete(key);
        invalidated++;
      }
    }

    if (invalidated > 0) {
      this.saveResponseCache();
    }

    return invalidated;
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    this.responseCache.clear();
    this.saveResponseCache();
    console.log('🧹 MCP response cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    totalEntries: number;
    expiredEntries: number;
    hitRate?: number;
    totalSize: string;
    oldestEntry?: string;
    newestEntry?: string;
  } {
    const now = Date.now();
    let expiredCount = 0;
    let oldestTimestamp = Number.MAX_SAFE_INTEGER;
    let newestTimestamp = 0;

    for (const entry of this.responseCache.values()) {
      if (entry.expiresAt && entry.expiresAt < now) {
        expiredCount++;
      }
      
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
      }
      
      if (entry.timestamp > newestTimestamp) {
        newestTimestamp = entry.timestamp;
      }
    }

    let totalSize = 0;
    try {
      if (fs.existsSync(this.cacheFile)) {
        totalSize = fs.statSync(this.cacheFile).size;
      }
    } catch {
      // Ignore errors
    }

    return {
      totalEntries: this.responseCache.size,
      expiredEntries: expiredCount,
      totalSize: `${(totalSize / 1024).toFixed(2)} KB`,
      oldestEntry: oldestTimestamp !== Number.MAX_SAFE_INTEGER 
        ? new Date(oldestTimestamp).toLocaleString() 
        : undefined,
      newestEntry: newestTimestamp > 0 
        ? new Date(newestTimestamp).toLocaleString() 
        : undefined
    };
  }

  /**
   * Preload cache from file translations
   */
  preloadFromFileTranslations(translationResults: Array<{
    filePath: string;
    fileContent: string;
    result: any;
  }>): void {
    let loaded = 0;

    translationResults.forEach(({ filePath, fileContent, result }) => {
      const cacheKey = this.generateCacheKey(filePath, fileContent);
      if (!this.responseCache.has(cacheKey)) {
        this.cacheResponse(cacheKey, result);
        loaded++;
      }
    });

    if (loaded > 0) {
      console.log(`📦 Preloaded ${loaded} translation results into MCP cache`);
    }
  }
}