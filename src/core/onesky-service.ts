/**
 * Service for interacting with the OneSky API.
 */
import fetch from 'node-fetch';
import { createHash } from 'crypto';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { LanguageInfo } from '../types/i18n.js';

interface CacheData {
    timestamp: number;
    locales: LanguageInfo[];
}

export class OneSkyService {
    private memoryCache: LanguageInfo[] | null = null;
    private readonly cacheFilePath: string;
    private readonly cacheExpirationMs: number = 24 * 60 * 60 * 1000; // 24 hours

    constructor() {
        this.cacheFilePath = join(process.cwd(), '.cache', 'onesky-locales.json');
    }

    /**
     * Fetches all supported locales from the OneSky project with caching.
     */
    public async fetchSupportedLocales(): Promise<LanguageInfo[]> {
        // 1. Check memory cache
        if (this.memoryCache) {
            console.error('[OneSkyService] Using memory cache for locales.');
            return this.memoryCache;
        }

        // 2. Check file cache
        const cachedData = this.loadFromFileCache();
        if (cachedData && !this.isCacheExpired(cachedData.timestamp)) {
            console.error('[OneSkyService] Using file cache for locales.');
            this.memoryCache = cachedData.locales;
            return cachedData.locales;
        }

        // 3. Fetch from API
        console.error('[OneSkyService] Fetching locales from OneSky API...');
        const locales = await this.fetchFromApi();

        // 4. Update caches
        this.memoryCache = locales;
        this.saveToFileCache(locales);

        return locales;
    }

    /**
     * Fetches locales directly from the OneSky API.
     */
    private async fetchFromApi(): Promise<LanguageInfo[]> {
        try {
            const { authHash, timestamp } = this.generateAuthParams();
            const apiKey = process.env.ONESKY_API_KEY;

            const url = `https://platform.api.onesky.io/1/locales?api_key=${apiKey}&timestamp=${timestamp}&dev_hash=${authHash}`;

            const response = await fetch(url);
            if (!response.ok) {
                const errorBody = await response.text();
                console.error(
                    `[OneSkyService] Error fetching locales: ${response.status} ${errorBody}`
                );
                return this.getMockData();
            }

            // TODO: add type https://github.com/onesky/api-documentation-platform/blob/master/resources/locale.md
            const data = (await response.json()) as { data: LanguageInfo[] };
            console.error('[OneSkyService] Successfully fetched locales from OneSky.');
            return data.data;
        } catch (error) {
            console.error('[OneSkyService] Failed to fetch from OneSky API:', error);
            return this.getMockData();
        }
    }

    /**
     * Load cache data from file.
     */
    private loadFromFileCache(): CacheData | null {
        try {
            if (!existsSync(this.cacheFilePath)) {
                return null;
            }

            const cacheContent = readFileSync(this.cacheFilePath, 'utf-8');
            const cacheData: CacheData = JSON.parse(cacheContent);

            // Validate cache structure
            if (!cacheData.timestamp || !Array.isArray(cacheData.locales)) {
                console.warn('[OneSkyService] Invalid cache file format, ignoring cache.');
                return null;
            }

            return cacheData;
        } catch (error) {
            console.warn('[OneSkyService] Failed to load cache file:', error);
            return null;
        }
    }

    /**
     * Save locales to file cache.
     */
    private saveToFileCache(locales: LanguageInfo[]): void {
        try {
            // Ensure cache directory exists
            const cacheDir = dirname(this.cacheFilePath);
            if (!existsSync(cacheDir)) {
                mkdirSync(cacheDir, { recursive: true });
            }

            const cacheData: CacheData = {
                timestamp: Date.now(),
                locales
            };

            writeFileSync(this.cacheFilePath, JSON.stringify(cacheData, null, 2), 'utf-8');
            console.error('[OneSkyService] Locales saved to file cache.');
        } catch (error) {
            console.warn('[OneSkyService] Failed to save cache file:', error);
        }
    }

    /**
     * Check if cache is expired.
     */
    private isCacheExpired(timestamp: number): boolean {
        return Date.now() - timestamp > this.cacheExpirationMs;
    }

    /**
     * Clear all caches.
     */
    public clearCache(): void {
        this.memoryCache = null;

        try {
            if (existsSync(this.cacheFilePath)) {
                writeFileSync(this.cacheFilePath, '', 'utf-8');
                console.error('[OneSkyService] Cache cleared.');
            }
        } catch (error) {
            console.warn('[OneSkyService] Failed to clear cache file:', error);
        }
    }

    /**
     * Get mock data for fallback.
     */
    private getMockData(): LanguageInfo[] {
        return [
            {
                code: 'zh-TW',
                english_name: 'Traditional Chinese',
                local_name: '繁體中文',
                locale: 'zh',
                region: 'TW'
            },
            {
                code: 'zh-CN',
                english_name: 'Simplified Chinese',
                local_name: '简体中文',
                locale: 'zh',
                region: 'CN'
            },
            {
                code: 'en-US',
                english_name: 'English (United States)',
                local_name: 'English (United States)',
                locale: 'en',
                region: 'US'
            },
            {
                code: 'en',
                english_name: 'English',
                local_name: 'English',
                locale: 'en',
                region: ''
            },
            {
                code: 'ja-JP',
                english_name: 'Japanese',
                local_name: '日本語',
                locale: 'ja',
                region: 'JP'
            },
            {
                code: 'ja',
                english_name: 'Japanese',
                local_name: '日本語',
                locale: 'ja',
                region: ''
            },
            {
                code: 'ko-KR',
                english_name: 'Korean',
                local_name: '한국어',
                locale: 'ko',
                region: 'KR'
            }
        ];
    }

    /**
     * Generates the required authentication parameters for a OneSky API request.
     * @private
     */
    private generateAuthParams(): { authHash: string; timestamp: string } {
        const apiKey = process.env.ONESKY_API_KEY;
        const apiSecret = process.env.ONESKY_API_SECRET;

        if (!apiKey || !apiSecret) {
            const errorMessage =
                'OneSky API Key or Secret is not configured in environment variables.';
            console.error(`[OneSkyService] ${errorMessage}`);
            throw new Error(errorMessage);
        }

        const timestamp = String(Math.floor(Date.now() / 1000));
        const devHash = createHash('md5');
        devHash.update(timestamp + apiSecret);
        const authHash = devHash.digest('hex');

        return { authHash, timestamp };
    }
}
