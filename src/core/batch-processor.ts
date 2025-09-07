import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { TranslationCache } from './translation-cache.js';

export interface FileScanResult {
    // 檔案的完整路徑
    filePath: string;
    // 檔案中包含的唯一中文字串數量
    chineseTextCount: number;
    // 檔案的大小（位元組）
    fileSize: number;
    // 一個布林值，表示該檔案是否需要翻譯（根據快取判斷）。
    needsTranslation: boolean;
    // 一個表示檔案處理優先級的字串，可以是 'high'、'medium' 或 'low'。
    priority: 'high' | 'medium' | 'low';
}

export interface BatchProcessingOptions {
    // 源目錄，掃描將從此目錄開始
    srcDir: string;
    // 一個字串陣列，包含用於匹配要掃描檔案的 glob 模式（例如 ['**/*.js', '**/*.ts']）。
    filePatterns: string[];
    // 可選的數字，表示最大並行處理的檔案數量。
    maxConcurrency?: number;
    // 可選的字串，用於指定檔案的優先級排序方式，可以是 'size'、'count' 或 'modified'。
    prioritizeBy?: 'size' | 'count' | 'modified';
    // 可選的布林值，如果為 true，則在判斷 needsTranslation 時會跳過快取檢查，強制認為所有檔案都需要翻譯。
    skipCache?: boolean;
}

export class BatchProcessor {
    // 一個 TranslationCache 實例，用於管理翻譯快取。
    private cache: TranslationCache;
    // 用於匹配任何中文字元（Unicode 範圍 U+4E00 到 U+9FFF）。g 標誌表示全局匹配
    private chineseRegex = /[\u4e00-\u9fff]/g;

    constructor(cacheDir?: string) {
        this.cache = new TranslationCache(cacheDir);
    }

    // 掃描單個檔案以查找中文字串
    private scanFile(filePath: string, skipCache: boolean): FileScanResult {
        // 獲取檔案的統計資訊，例如大小
        const stats = fs.statSync(filePath);
        // 讀取檔案的全部內容
        const content = fs.readFileSync(filePath, 'utf8');
        // 使用中文字元正規表達式在內容中查找所有匹配項。|| [] 確保如果沒有匹配項，則返回空陣列
        const matches = content.match(this.chineseRegex) || [];
        // 呼叫 countUniqueChineseStrings 方法計算檔案中唯一中文字串的數量。
        const chineseTextCount = this.countUniqueChineseStrings(content);

        // 根據 skipCache 參數和 TranslationCache 的判斷來確定檔案是否需要翻譯。如果 skipCache 為 true，則直接為 true。
        const needsTranslation = skipCache || this.cache.needsTranslation(filePath);

        // 呼叫 determinePriority 方法確定檔案的處理優先級
        const priority = this.determinePriority(filePath, chineseTextCount, stats.size);

        return {
            filePath,
            chineseTextCount,
            fileSize: stats.size,
            needsTranslation,
            priority
        };
    }

    // 對掃描結果進行優先級排序
    private prioritizeFiles(
        results: FileScanResult[],
        prioritizeBy: string = 'count'
    ): FileScanResult[] {
        return results.sort((a, b) => {
            // 將優先級字串映射為數字，以便進行比較。
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            // 計算兩個檔案優先級的差異。b - a 會使高優先級的排在前面。
            const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
            // 如果優先級不同，則直接根據優先級排序。
            // 0 -> 位置不變，1 -> 位置交換 ， -1 -> 位置交換
            if (priorityDiff !== 0) return priorityDiff;

            // 根據 prioritizeBy 參數的值進行排序。
            switch (prioritizeBy) {
                case 'size':
                    // 檔案越小越優先
                    return a.fileSize - b.fileSize;
                case 'modified':
                    try {
                        // fs.statSync() 獲取檔案的修改時間
                        const statA = fs.statSync(a.filePath);
                        const statB = fs.statSync(b.filePath);
                        // 最近修改的檔案越優先。如果獲取統計資訊失敗，則不改變順序。
                        return statB.mtime.getTime() - statA.mtime.getTime();
                    } catch {
                        return 0;
                    }
                case 'count':
                default:
                    // 中文字串越多越優先。
                    return b.chineseTextCount - a.chineseTextCount;
            }
        });
    }

    // 從 JavaScript/TypeScript 內容中提取字串字面值。
    private extractStringLiterals(content: string): string[] {
        const strings: string[] = [];
        // 定義了三個正規表達式模式，分別用於匹配：單引號、雙引號和模板字面量。
        const patterns = [
            // Single quotes
            /'([^'\\]|\\.)*'/g,
            // Double quotes
            /"([^"\\]|\\.)*"/g,
            // Template literals
            /`([^`\\]|\\.)*`/g
        ];

        patterns.forEach(pattern => {
            // 使用當前模式在內容中查找所有匹配的字串。
            const matches = content.match(pattern) || [];
            strings.push(...matches.map(match => match.slice(1, -1))); // Remove quotes
        });

        return strings;
    }

    // 計算檔案內容中唯一的中文字串數量
    private countUniqueChineseStrings(content: string): number {
        // 提取檔案內容中的所有字串字面值
        const stringLiterals = this.extractStringLiterals(content);
        // 創建一個 Set，用於儲存唯一的、包含中文的字串。Set 自動處理重複項。
        const chineseStrings = new Set<string>();

        stringLiterals.forEach(str => {
            if (this.chineseRegex.test(str)) {
                chineseStrings.add(str);
            }
        });

        // 返回 Set 中元素的數量，即唯一的中文字串數量
        return chineseStrings.size;
    }

    // 根據檔案路徑、中文字串數量和檔案大小來確定檔案的處理優先級。
    private determinePriority(
        filePath: string,
        chineseCount: number,
        fileSize: number
    ): 'high' | 'medium' | 'low' {
        // 如果檔案路徑包含 'error'、'Error'、'core' 或 'hook'（可能代表核心或關鍵邏輯）。
        if (
            filePath.includes('error') ||
            filePath.includes('Error') ||
            filePath.includes('core') ||
            filePath.includes('hook') ||
            (chineseCount > 10 && fileSize < 10000)
        ) {
            return 'high';
        }

        //如果檔案路徑包含 'component'、'Component'、'form'、'Form'、'modal' 或 'Modal'（可能代表 UI 組件）
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

        // 如果以上條件都不滿足，則預設為 'low' 優先級（可能代表配置檔案、工具程式或大型檔案）。
        return 'low';
    }

    private formatDuration(seconds: number): string {
        // 如果少於 60 秒，直接顯示秒數
        if (seconds < 60) return `${seconds}s`;
        // 如果少於 3600 秒（1 小時），則顯示為分鐘和秒數。
        if (seconds < 3600) return `${Math.round(seconds / 60)}m ${seconds % 60}s`;
        // 計算小時數
        const hours = Math.floor(seconds / 3600);
        // 計算剩餘的分鐘數
        const minutes = Math.floor((seconds % 3600) / 60);
        // 返回格式化後的字串
        return `${hours}h ${minutes}m`;
    }

    // 掃描目錄中包含中文字串的檔案
    async scanFilesWithChinese(options: BatchProcessingOptions): Promise<FileScanResult[]> {
        // 從 options 物件中解構出必要的屬性。
        const { srcDir, filePatterns, skipCache = false } = options;
        // 初始化一個空陣列來儲存掃描結果
        const results: FileScanResult[] = [];

        // 遍歷每個檔案模式
        for (const pattern of filePatterns) {
            // 將源目錄和檔案模式組合成一個完整的 glob 模式。
            const globPattern = path.join(srcDir, pattern);
            // 使用 glob 函式庫根據模式查找匹配的檔案。ignore 選項用於排除 node_modules、build 和 dist 目錄。
            const files = await glob(globPattern, {
                ignore: ['**/node_modules/**', '**/build/**', '**/dist/**']
            });
            // 遍歷每個匹配的檔案
            for (const file of files) {
                try {
                    // 呼叫私有方法 scanFile 掃描當前檔案。
                    const scanResult = this.scanFile(file, skipCache);
                    // 如果檔案中包含中文字串，則將掃描結果添加到 results 陣列中。
                    if (scanResult.chineseTextCount > 0) {
                        results.push(scanResult);
                    }
                } catch (error) {
                    console.warn(`Failed to scan ${file}:`, (error as Error).message);
                }
            }
        }

        // 返回經過優先級排序的掃描結果。
        return this.prioritizeFiles(results, options.prioritizeBy);
    }

    // 將檔案分組以進行批次處理
    groupFilesForBatching(files: FileScanResult[], maxConcurrency: number = 3): FileScanResult[][] {
        // 初始化一個空陣列，用於儲存分批後的檔案組。
        const groups: FileScanResult[][] = [];
        // 根據檔案中中文字串的數量將檔案分為「小檔案」（<= 5 個字串）、「中等檔案」（6-15 個字串）和「大檔案」（> 15 個字串）。
        const smallFiles = files.filter(f => f.chineseTextCount <= 5);
        const mediumFiles = files.filter(f => f.chineseTextCount > 5 && f.chineseTextCount <= 15);
        const largeFiles = files.filter(f => f.chineseTextCount > 15);

        // 以 maxConcurrency 為步長，將小檔案分割成多個批次。
        for (let i = 0; i < smallFiles.length; i += maxConcurrency) {
            groups.push(smallFiles.slice(i, i + maxConcurrency));
        }

        // 以 maxConcurrency 的一半（但至少為 1）為步長，將中等檔案分割成批次。
        for (let i = 0; i < mediumFiles.length; i += Math.max(1, Math.floor(maxConcurrency / 2))) {
            groups.push(mediumFiles.slice(i, i + Math.max(1, Math.floor(maxConcurrency / 2))));
        }

        // 每個大檔案單獨作為一個批次處理。
        largeFiles.forEach(file => {
            groups.push([file]);
        });

        return groups;
    }

    // 生成一個處理報告
    generateScanReport(files: FileScanResult[]): {
        totalFiles: number;
        needTranslation: number;
        totalStrings: number;
        byPriority: Record<string, number>;
        estimatedTime: string;
    } {
        // 從所有掃描的檔案中篩選出需要翻譯的檔案。
        const needTranslation = files.filter(f => f.needsTranslation);
        // 計算所有需要翻譯的檔案中總的唯一中文字串數量
        const totalStrings = needTranslation.reduce((sum, f) => sum + f.chineseTextCount, 0);

        // reduce 方法計算每個優先級（僅限需要翻譯的檔案）的檔案數量
        const byPriority = files.reduce(
            (acc, file) => {
                if (file.needsTranslation) {
                    acc[file.priority] = (acc[file.priority] || 0) + 1;
                }
                return acc;
            },
            {} as Record<string, number>
        );

        // 估計翻譯所需的時間，這裡假設每個字串大約需要 30 秒（這是一個粗略的估計）。
        const estimatedSeconds = totalStrings * 30;

        // 呼叫 formatDuration 方法將估計秒數格式化為可讀的時間字串。
        const estimatedTime = this.formatDuration(estimatedSeconds);

        return {
            totalFiles: files.length,
            needTranslation: needTranslation.length,
            totalStrings,
            byPriority,
            estimatedTime
        };
    }

    // 快速掃描檔案以查找是否包含中文字元，類似於 grep 操作
    async quickScan(srcDir: string, patterns: string[]): Promise<string[]> {
        // 初始化一個空陣列來儲存包含中文的檔案路徑
        const filesWithChinese: string[] = [];

        for (const pattern of patterns) {
            const globPattern = path.join(srcDir, pattern);
            // 查找匹配的檔案，並忽略常見的構建目錄。
            const files = await glob(globPattern, {
                ignore: ['**/node_modules/**', '**/build/**', '**/dist/**']
            });

            for (const file of files) {
                try {
                    // 讀取檔案的全部內容
                    const content = fs.readFileSync(file, 'utf8');
                    // 使用中文字元正規表達式在內容中查找所有匹配項。
                    if (this.chineseRegex.test(content)) {
                        filesWithChinese.push(file);
                    }
                } catch (error) {
                    console.warn(`Failed to scan ${file}:`, (error as Error).message);
                }
            }
        }

        // 返回包含中文的檔案路徑陣列
        return filesWithChinese;
    }
}
