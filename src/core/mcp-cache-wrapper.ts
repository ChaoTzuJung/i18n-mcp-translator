import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface MCPResponse {
    // 實際快取的響應資料，可以是任何類型。
    response: any;
    // 快取回應的時間戳記。
    timestamp: number;
    // 可選的過期時間戳記。如果存在，則表示此快取項目會過期。
    expiresAt?: number;
}

export interface MCPCacheOptions {
    // 可選的字串，指定快取檔案存放的目錄。
    cacheDir?: string;
    // 可選的數字，表示預設的快取存活時間（以毫秒為單位）。
    defaultTTL?: number;
    // 可選的數字，表示快取中可以儲存的最大響應數量。
    maxCacheSize?: number;
}

/**
 * MCPCacheWrapper 類別提供了一個可配置且持久化的快取系統，用於儲存外部服務的回應。
 * 它具有自動過期清理、大小限制、基於雜湊的鍵生成以及用於檔案和文字翻譯的便捷包裝器功能，有助於提高性能並減少對外部 API 的調用。
 */
export class MCPCacheWrapper {
    // 一個 Map 用於儲存快取的回應。鍵是快取鍵（字串），值是 MCPResponse 物件。
    private responseCache: Map<string, MCPResponse> = new Map();
    // 儲存快取檔案的完整路徑
    private cacheFile: string;
    // 儲存配置選項，Required 表示所有選項都必須存在（在建構函式中會提供預設值）。
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

    // 確保快取目錄存在
    private ensureCacheDir(): void {
        // 檢查快取目錄是否存在
        if (!fs.existsSync(this.options.cacheDir)) {
            // 如果目錄不存在，則創建它。recursive: true 確保如果父目錄也不存在，也會一併創建
            fs.mkdirSync(this.options.cacheDir, { recursive: true });
        }
    }

    // 從檔案中載入現有的快取回應。
    private loadResponseCache(): void {
        try {
            // 檢查快取檔案是否存在
            if (fs.existsSync(this.cacheFile)) {
                // 讀取檔案內容並將其解析為 JSON 物件。
                const data = JSON.parse(fs.readFileSync(this.cacheFile, 'utf8'));
                // 將解析後的物件轉換回 Map，同時對每個值進行類型斷言為 MCPResponse。
                this.responseCache = new Map(
                    Object.entries(data).map(([key, value]) => [key, value as MCPResponse])
                );

                // 載入後立即呼叫 cleanExpiredEntries 方法，清除所有已過期的快取項目。
                this.cleanExpiredEntries();
            }
        } catch (error) {
            console.warn('Failed to load MCP response cache:', (error as Error).message);
            this.responseCache = new Map();
        }
    }

    // 將快取回應保存到檔案中。
    private saveResponseCache(): void {
        try {
            // 在保存之前，如果快取大小超過最大限制，則呼叫 trimCache 方法削減快取。
            if (this.responseCache.size > this.options.maxCacheSize) {
                this.trimCache();
            }

            // 將 responseCache Map 轉換為一個普通的 JavaScript 物件。
            const data = Object.fromEntries(this.responseCache);
            // 將物件序列化為 JSON 字串（格式化為兩空格縮排）並寫入檔案。
            fs.writeFileSync(this.cacheFile, JSON.stringify(data, null, 2));
        } catch (error) {
            console.warn('Failed to save MCP response cache:', (error as Error).message);
        }
    }

    // 削減快取大小，移除最舊的項目
    private trimCache(): void {
        // 將 responseCache 的所有項目轉換為陣列，然後按照它們的時間戳記（timestamp）升序排序，即最舊的項目排在前面。
        const entries = Array.from(this.responseCache.entries()).sort(
            (a, b) => a[1].timestamp - b[1].timestamp
        );

        // 計算需要移除的項目數量。目標是將快取大小削減到 maxCacheSize 的 80%
        const toRemove = entries.length - Math.floor(this.options.maxCacheSize * 0.8);
        // 遍歷並從 responseCache 中刪除 toRemove 數量最舊的項目
        for (let i = 0; i < toRemove; i++) {
            this.responseCache.delete(entries[i][0]);
        }
    }

    private cleanExpiredEntries(): void {
        const now = Date.now();
        // 初始化清理計數器
        let cleaned = 0;

        // 遍歷 responseCache 中的所有項目。
        for (const [key, value] of this.responseCache.entries()) {
            // 檢查當前項目的 expiresAt 是否存在且已過期。
            if (value.expiresAt && value.expiresAt < now) {
                // 如果過期，則從快取中刪除該項目。
                this.responseCache.delete(key);
                cleaned++;
            }
        }

        // 如果清除了任何項目，則輸出日誌並呼叫 saveResponseCache 保存變更。
        if (cleaned > 0) {
            console.log(`🧹 Cleaned ${cleaned} expired MCP cache entries`);
            this.saveResponseCache();
        }
    }

    // 為檔案路徑和內容組合生成一個唯一的快取鍵
    generateCacheKey(
        filePath: string,
        fileContent: string,
        operation: string = 'translate'
    ): string {
        // 計算檔案內容的 MD5 雜湊值。
        const contentHash = crypto.createHash('md5').update(fileContent).digest('hex');
        // 計算檔案路徑的 MD5 雜湊值。
        const pathHash = crypto.createHash('md5').update(filePath).digest('hex');
        // 路徑雜湊和內容雜湊組合成一個快取鍵字串。
        return `${operation}:${pathHash}:${contentHash}`;
    }

    // 為特定文字內容生成一個唯一的快取鍵
    generateTextCacheKey(text: string, operation: string = 'translate', context?: string): string {
        // 計算文字內容的 MD5 雜湊值。
        const textHash = crypto.createHash('md5').update(text).digest('hex');
        // 如果提供了 context（上下文），則計算其 MD5 雜湊值，否則為空字串。
        const contextHash = context ? crypto.createHash('md5').update(context).digest('hex') : '';
        // 將操作類型、一個文字標識符、文字雜湊和可選的上下文雜湊組合成一個快取鍵字串。
        return `${operation}:text:${textHash}${contextHash ? ':' + contextHash : ''}`;
    }

    // 檢查是否存在有效的快取回應。
    getCachedResponse(cacheKey: string): any | null {
        // 從 responseCache 中獲取與 cacheKey 匹配的項目。
        const cached = this.responseCache.get(cacheKey);
        // 如果沒有找到匹配的項目，則返回 null。
        if (!cached) {
            return null;
        }

        //檢查快取項目是否已過期。
        if (cached.expiresAt && cached.expiresAt < Date.now()) {
            // 如果過期，則從快取中刪除該項目
            this.responseCache.delete(cacheKey);
            return null;
        }

        return cached.response;
    }

    // 將 MCP 回應快取起來。
    cacheResponse(cacheKey: string, response: any, ttl?: number): void {
        // 計算快取的過期時間。如果提供了 ttl（存活時間），則使用它，否則使用 defaultTTL。
        const expiresAt = ttl ? Date.now() + ttl : Date.now() + this.options.defaultTTL;

        // 將新的快取項目添加到 responseCache 中，包含回應、時間戳記和過期時間。
        this.responseCache.set(cacheKey, {
            response,
            timestamp: Date.now(),
            expiresAt
        });

        this.saveResponseCache();
    }

    // 一個快取包裝器，用於檔案翻譯
    async cachedFileTranslation<T>(
        filePath: string,
        fileContent: string,
        translationFn: () => Promise<T>,
        ttl?: number
    ): Promise<T> {
        // 生成檔案翻譯的快取鍵。
        const cacheKey = this.generateCacheKey(filePath, fileContent);

        // 檢查快取中是否存在此鍵的有效回應。
        const cached = this.getCachedResponse(cacheKey);
        // 如果快取命中，則輸出日誌並返回快取的回應。
        if (cached) {
            console.log(`📦 Using cached translation for ${path.basename(filePath)}`);
            return cached as T;
        }

        // Execute translation and cache result
        console.log(`🔄 Translating ${path.basename(filePath)} (not cached)`);
        // 執行實際的檔案翻譯函數（translationFn）
        const result = await translationFn();
        // 將翻譯結果快取起來
        this.cacheResponse(cacheKey, result, ttl);

        return result;
    }

    // 一個快取包裝器，用於單個文字的翻譯。
    async cachedTextTranslation<T>(
        text: string,
        translationFn: () => Promise<T>,
        context?: string,
        ttl?: number
    ): Promise<T> {
        // 生成文字翻譯的快取鍵，包含上下文（如果提供）。
        const cacheKey = this.generateTextCacheKey(text, 'translate', context);

        // 如果快取命中，則輸出日誌並返回快取的回應。
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

    // 批量檢查多個快取鍵是否存在有效的快取回應
    batchCheckCache(cacheKeys: string[]): Map<string, any> {
        const results = new Map<string, any>();

        // 遍歷所有要檢查的快取鍵
        cacheKeys.forEach(key => {
            // 對於每個鍵，嘗試獲取其快取回應。
            const cached = this.getCachedResponse(key);
            // 如果找到有效的快取回應，則將其添加到 results Map 中。
            if (cached) {
                results.set(key, cached);
            }
        });

        return results;
    }

    // 根據給定的正規表達式模式使快取項目失效。
    invalidateByPattern(pattern: string): number {
        // 從傳入的模式字串創建一個正規表達式。
        const regex = new RegExp(pattern);
        // 初始化一個計數器，用於記錄失效的項目數量。
        let invalidated = 0;

        // 遍歷 responseCache 中的所有快取鍵。`
        for (const key of this.responseCache.keys()) {
            // 如果快取鍵匹配給定的正規表達式模式
            if (regex.test(key)) {
                // 刪除匹配的快取項目。
                this.responseCache.delete(key);
                // 增加失效計數。
                invalidated++;
            }
        }

        // 如果清除了任何項目，則呼叫 saveResponseCache 保存變更。
        if (invalidated > 0) {
            this.saveResponseCache();
        }

        // 返回失效的項目數量。
        return invalidated;
    }

    // 清除所有快取項目。
    clearCache(): void {
        // 清空 responseCache Map。
        this.responseCache.clear();
        // 將空快取保存到檔案中
        this.saveResponseCache();
        console.log('🧹 MCP response cache cleared');
    }

    // 獲取快取的統計資訊。
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

        // 遍歷 responseCache 中的所有值。
        for (const entry of this.responseCache.values()) {
            // 統計過期的項目數量。
            if (entry.expiresAt && entry.expiresAt < now) {
                expiredCount++;
            }

            // 統計最早的項目時間戳記。
            if (entry.timestamp < oldestTimestamp) {
                oldestTimestamp = entry.timestamp;
            }

            // 更新最新的快取項目時間戳記。
            if (entry.timestamp > newestTimestamp) {
                newestTimestamp = entry.timestamp;
            }
        }

        // 嘗試獲取快取檔案的總大小
        let totalSize = 0;
        try {
            if (fs.existsSync(this.cacheFile)) {
                totalSize = fs.statSync(this.cacheFile).size;
            }
        } catch {
            // Ignore errors
        }

        // 返回包含各項統計數據的物件，包括總條目數、過期條目數、總大小、最早和最新的條目時間。hitRate 在這裡未實現，因為需要額外追蹤命中和未命中次數。
        return {
            totalEntries: this.responseCache.size,
            expiredEntries: expiredCount,
            totalSize: `${(totalSize / 1024).toFixed(2)} KB`,
            oldestEntry:
                oldestTimestamp !== Number.MAX_SAFE_INTEGER
                    ? new Date(oldestTimestamp).toLocaleString()
                    : undefined,
            newestEntry:
                newestTimestamp > 0 ? new Date(newestTimestamp).toLocaleString() : undefined
        };
    }

    // 從外部提供的檔案翻譯結果中預載入快取。
    preloadFromFileTranslations(
        translationResults: Array<{
            filePath: string;
            fileContent: string;
            result: any;
        }>
    ): void {
        // 初始化已載入計數器
        let loaded = 0;

        // 遍歷提供的每個翻譯結果。
        translationResults.forEach(({ filePath, fileContent, result }) => {
            // 為每個結果生成一個快取鍵。
            const cacheKey = this.generateCacheKey(filePath, fileContent);
            // 如果快取中不存在此鍵，則將其添加到快取中。
            if (!this.responseCache.has(cacheKey)) {
                // 將翻譯結果快取起來。
                this.cacheResponse(cacheKey, result);
                loaded++;
            }
        });

        if (loaded > 0) {
            console.log(`📦 Preloaded ${loaded} translation results into MCP cache`);
        }
    }
}
