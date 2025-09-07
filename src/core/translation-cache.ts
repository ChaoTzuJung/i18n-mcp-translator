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

/**
 * 類別提供了一個全面的解決方案來管理應用程式中的翻譯快取。它能夠：
 * - 管理檔案快取：根據檔案內容和 Git commit 雜湊值判斷檔案是否已修改，從而決定是否需要重新翻譯。
 * - 管理字串快取：儲存和檢索單個原始字串及其翻譯，以避免重複翻譯。
 * - 清理和驗證：定期清理過期的快取檔案，並驗證快取檔案的完整性。
 * - 提供統計資訊：提供快取的相關統計數據，方便監控。
 */
export class TranslationCache {
    private cacheDir: string;
    private stringCache: Map<string, CachedTranslation> = new Map();
    private stringCacheFile: string;

    constructor(cacheDir = '.translation-cache') {
        this.cacheDir = cacheDir;
        this.stringCacheFile = path.join(cacheDir, 'translation-strings.json');
        // 確保快取目錄存在
        this.ensureCacheDir();
        // 從檔案中載入現有的字串快取
        this.loadStringCache();
    }

    private ensureCacheDir(): void {
        // 檢查快取目錄是否存在
        if (!fs.existsSync(this.cacheDir)) {
            // 如果目錄不存在，則創建它。確保如果父目錄也不存在，也會一併創建。
            fs.mkdirSync(this.cacheDir, { recursive: true });
        }
    }

    private loadStringCache(): void {
        try {
            // 檢查全局字串快取檔案是否存在
            if (fs.existsSync(this.stringCacheFile)) {
                // 讀取檔案內容並將其解析為 JSON 物件。
                const data = JSON.parse(fs.readFileSync(this.stringCacheFile, 'utf8'));
                // 將解析後的物件轉換回 Map 並賦值給 stringCache 屬性。
                this.stringCache = new Map(Object.entries(data));
            }
        } catch (error) {
            console.warn('Failed to load string cache:', (error as Error).message);
        }
    }

    private saveStringCache(): void {
        try {
            // 將 stringCache Map 轉換為一個普通的 JavaScript 物件。
            const data = Object.fromEntries(this.stringCache);
            // 將物件序列化為 JSON 字串（格式化為兩空格縮排）並寫入檔案。
            fs.writeFileSync(this.stringCacheFile, JSON.stringify(data, null, 2));
        } catch (error) {
            console.warn('Failed to save string cache:', (error as Error).message);
        }
    }

    private getFileCacheFile(filePath: string): string {
        // 將檔案路徑轉換為一個安全的字串，用於作為快取檔案的名稱。它會替換掉路徑分隔符並移除其他非法字元
        const safePath = filePath.replace(/[\/\\]/g, '_').replace(/[^a-zA-Z0-9_.-]/g, '');
        // 在快取目錄中生成該檔案對應的快取檔案路徑。
        return path.join(this.cacheDir, `${safePath}.cache`);
    }

    generateFileHash(filePath: string): string {
        try {
            // 讀取指定檔案的內容。
            const content = fs.readFileSync(filePath, 'utf8');
            // 使用 MD5 演算法計算檔案內容的雜湊值，並以十六進制字串返回。
            return crypto.createHash('md5').update(content).digest('hex');
        } catch (error) {
            throw new Error(`Failed to generate hash for ${filePath}: ${(error as Error).message}`);
        }
    }

    getGitCommitHash(filePath: string): string | null {
        try {
            // 執行 Git 命令來獲取指定檔案的最新 commit 雜湊值。
            return execSync(`git log -1 --format="%H" -- "${filePath}"`, {
                encoding: 'utf8',
                stdio: 'pipe'
            }).trim();
        } catch {
            // 如果 Git 命令失敗（例如檔案不在 Git 倉庫中），則返回 null。
            return null;
        }
    }

    needsTranslation(filePath: string): boolean {
        // 獲取該檔案對應的快取檔案路徑。
        const cacheFile = this.getFileCacheFile(filePath);

        if (!fs.existsSync(cacheFile)) {
            // 如果沒有快取檔案，則認為需要翻譯。
            return true;
        }

        try {
            // 讀取快取檔案的內容並將其解析為 FileCacheData 物件。
            const cachedData: FileCacheData = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
            // 計算當前檔案的雜湊值
            const currentHash = this.generateFileHash(filePath);

            // 如果快取中的雜湊值與當前檔案的雜湊值不同，表示檔案內容已更改，需要翻譯。
            if (cachedData.hash !== currentHash) {
                return true;
            }

            // 如果快取中包含 Git commit 雜湊值（可選功能）
            if (cachedData.gitCommit) {
                // 獲取當前檔案的 Git commit 雜湊值。
                const currentCommit = this.getGitCommitHash(filePath);
                // 如果 Git commit 雜湊值已更改，也表示需要翻譯
                if (currentCommit && cachedData.gitCommit !== currentCommit) {
                    return true;
                }
            }
            // 如果所有檢查都通過，表示檔案未更改，不需要翻譯。
            return false;
        } catch (error) {
            console.warn(`Error checking cache for ${filePath}:`, (error as Error).message);
            return true;
        }
    }

    // 保存指定檔案的快取資料
    saveFileCache(filePath: string, translatedStrings: CachedTranslation[] = []): void {
        try {
            // 計算檔案內容的雜湊值
            const hash = this.generateFileHash(filePath);
            // 獲取檔案的 Git commit 雜湊值
            const gitCommit = this.getGitCommitHash(filePath);
            // 獲取該檔案對應的快取檔案路徑。
            const cacheFile = this.getFileCacheFile(filePath);

            // 創建一個 FileCacheData 物件，包含檔案的雜湊值、時間戳、檔案路徑、翻譯結果和 Git commit 雜湊值（如果有的話）。
            const cacheData: FileCacheData = {
                hash,
                timestamp: Date.now(),
                filePath,
                translatedStrings,
                ...(gitCommit && { gitCommit })
            };

            // 將快取資料寫入對應的快取檔案。
            fs.writeFileSync(cacheFile, JSON.stringify(cacheData, null, 2));

            // 遍歷該檔案中的所有已翻譯字串。
            translatedStrings.forEach(translation => {
                // 將每個已翻譯字串保存到全局字串快取。
                this.saveTranslation(
                    translation.original,
                    translation.key,
                    translation.translation
                );
            });
        } catch (error) {
            console.error(`Failed to save cache for ${filePath}:`, (error as Error).message);
        }
    }

    // 獲取指定檔案的快取資料。
    getFileCache(filePath: string): FileCacheData | null {
        // 獲取該檔案對應的快取檔案路徑。
        const cacheFile = this.getFileCacheFile(filePath);

        // 如果快取檔案不存在，則返回 null。
        if (!fs.existsSync(cacheFile)) {
            return null;
        }

        try {
            // 讀取快取檔案的內容並將其解析為 FileCacheData 物件。
            return JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
        } catch (error) {
            console.warn(`Error reading cache for ${filePath}:`, (error as Error).message);
            return null;
        }
    }

    // 獲取指定原始文字的翻譯快取
    getTranslation(chineseText: string): CachedTranslation | null {
        // 計算原始文字的 MD5 雜湊值
        const textHash = crypto.createHash('md5').update(chineseText).digest('hex');
        // 從 stringCache Map 中使用雜湊值查找翻譯。如果找到則返回，否則返回 null。
        return this.stringCache.get(textHash) || null;
    }

    // 保存一個新的翻譯到全局字串快取中
    saveTranslation(chineseText: string, translationKey: string, englishText: string): void {
        // 計算原始文字的 MD5 雜湊值
        const textHash = crypto.createHash('md5').update(chineseText).digest('hex');
        // 創建一個 CachedTranslation 物件，包含原始文字、翻譯鍵、翻譯結果和時間戳。
        const translation: CachedTranslation = {
            original: chineseText,
            key: translationKey,
            translation: englishText,
            timestamp: Date.now()
        };

        // 將翻譯添加到 stringCache Map 中
        this.stringCache.set(textHash, translation);
        // 將更新後的全局字串快取保存到檔案中
        this.saveStringCache();
    }

    // 批量檢查多個原始文字是否有快取翻譯
    batchCheckTranslations(chineseTexts: string[]): Map<string, CachedTranslation> {
        const results = new Map<string, CachedTranslation>();

        // 遍歷所有要檢查的原始文字
        chineseTexts.forEach(text => {
            const cached = this.getTranslation(text);
            if (cached) {
                results.set(text, cached);
            }
        });

        return results;
    }

    // 清理過期的快取文件
    cleanOldCache(maxAgeInDays: number = 30): void {
        // 計算快取的最大有效期（預設 30 天）。
        const maxAge = Date.now() - maxAgeInDays * 24 * 60 * 60 * 1000;
        // 初始化清理計數器
        let cleaned = 0;

        try {
            // 讀取快取目錄中的所有檔案
            const cacheFiles = fs.readdirSync(this.cacheDir);

            // 遍歷所有檔案
            for (const file of cacheFiles) {
                // 只處理以 .cache 結尾的檔案（即檔案快取）。
                if (file.endsWith('.cache')) {
                    // 獲取快取檔案的路徑
                    const cachePath = path.join(this.cacheDir, file);
                    // 讀取並解析快取檔案的內容。
                    const cacheData = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
                    // 果快取的時間戳記早於 maxAge，則表示已過期。
                    if (cacheData.timestamp < maxAge) {
                        // 刪除過期的快取檔案
                        fs.unlinkSync(cachePath);
                        // 增加清理計數器
                        cleaned++;
                    }
                }
            }

            console.log(`🧹 Cleaned ${cleaned} old cache files`);
        } catch (error) {
            console.warn('Failed to clean old cache:', (error as Error).message);
        }
    }

    // 驗證快取檔案的完整性並修復損壞的快取
    validateCache(): { valid: number; corrupted: number; repaired: number } {
        // 初始化計數器
        let valid = 0;
        let corrupted = 0;
        let repaired = 0;

        try {
            //  讀取快取目錄中的所有檔案
            const cacheFiles = fs.readdirSync(this.cacheDir);

            for (const file of cacheFiles) {
                if (file.endsWith('.cache')) {
                    const cachePath = path.join(this.cacheDir, file);

                    try {
                        // 嘗試解析快取檔案。如果成功，valid 增加。
                        JSON.parse(fs.readFileSync(cachePath, 'utf8'));
                        valid++;
                    } catch {
                        // 如果解析失敗，表示檔案已損壞
                        console.warn(`❌ Corrupted cache file: ${file}`);
                        // 刪除損壞的快取檔案
                        fs.unlinkSync(cachePath);
                        corrupted++;
                    }
                }
            }

            // Validate and repair string cache
            try {
                // 嘗試重新載入全局字串快取。如果成功，增加修復計數器
                this.loadStringCache();
                repaired++;
            } catch {
                // 如果字串快取損壞
                console.warn('❌ Corrupted string cache, recreating...');
                // 重置 stringCache 為空 Map
                this.stringCache = new Map();
                // 保存空的 stringCache，從而修復它
                this.saveStringCache();
                repaired++;
            }
        } catch (error) {
            console.warn('Failed to validate cache:', (error as Error).message);
        }

        // 返回包含驗證結果的物件
        return { valid, corrupted, repaired };
    }

    // 獲取快取的統計資訊
    getCacheStats(): {
        fileCount: number;
        stringCount: number;
        totalSize: string;
        oldestCache: string | null;
        newestCache: string | null;
    } {
        try {
            // 讀取並過濾出所有檔案快取
            const cacheFiles = fs.readdirSync(this.cacheDir).filter(f => f.endsWith('.cache'));
            // 初始化統計變數
            let totalSize = 0;
            let oldestTimestamp = Number.MAX_SAFE_INTEGER;
            let newestTimestamp = 0;
            let oldestFile = null;
            let newestFile = null;

            for (const file of cacheFiles) {
                // 構造快取檔案的完整路徑
                const cachePath = path.join(this.cacheDir, file);
                // 獲取檔案的統計資訊（例如大小）
                const stats = fs.statSync(cachePath);
                // 將檔案大小加到 totalSize 中
                totalSize += stats.size;

                try {
                    const cacheData = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
                    // 更新最早的快取時間戳記
                    if (cacheData.timestamp < oldestTimestamp) {
                        oldestTimestamp = cacheData.timestamp;
                        oldestFile = new Date(cacheData.timestamp).toLocaleString();
                    }
                    // 更新最新的快取時間戳記
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
