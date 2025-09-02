/**
 * Service for discovering available languages from existing translation files
 */
import { existsSync, readdirSync, statSync } from 'fs';
import { resolve, extname } from 'path';
import { type LanguageInfo } from '../types/i18n.js';
import { JsonParser } from '../utils/json-parser.js';

export class LanguageDiscoveryService {
    /**
     * Discover languages from existing translation files in directory
     */
    async discoverLanguages(
        translationDir: string,
        translationFileName?: string,
        defaultLanguages?: string[]
    ): Promise<LanguageInfo[]> {
        if (!existsSync(translationDir)) {
            console.error(
                '[LanguageDiscoveryService] Translation directory does not exist, using default languages.'
            );
            return this.createLanguageInfoFromCodes(defaultLanguages || ['zh-TW', 'en-US']);
        }

        // If specific file name is provided, use it
        if (translationFileName) {
            const specificFilePath = resolve(translationDir, translationFileName);
            if (existsSync(specificFilePath)) {
                console.error(
                    `[LanguageDiscoveryService] Using specified translation file: ${translationFileName}`
                );
                return this.discoverFromExistingFile(specificFilePath);
            }
        }

        // Scan directory for JSON translation files
        console.error(
            '[LanguageDiscoveryService] Scanning translation directory for JSON files...'
        );
        return this.discoverFromDirectory(translationDir, defaultLanguages);
    }

    /**
     * Scan directory for translation JSON files and discover languages
     */
    private async discoverFromDirectory(
        translationDir: string,
        defaultLanguages?: string[]
    ): Promise<LanguageInfo[]> {
        try {
            const files = readdirSync(translationDir);
            const jsonFiles = files.filter(file => {
                const filePath = resolve(translationDir, file);
                return statSync(filePath).isFile() && extname(file).toLowerCase() === '.json';
            });

            if (jsonFiles.length === 0) {
                console.error(
                    '[LanguageDiscoveryService] No JSON files found in translation directory, using default languages.'
                );
                return this.createLanguageInfoFromCodes(defaultLanguages || ['zh-TW', 'en-US']);
            }

            console.error(
                `[LanguageDiscoveryService] Found ${jsonFiles.length} JSON files: [${jsonFiles.join(', ')}]`
            );

            // Try each file to find one with language structure
            for (const file of jsonFiles) {
                const filePath = resolve(translationDir, file);
                const languages = await this.discoverFromExistingFile(filePath);

                if (languages.length > 0) {
                    console.error(
                        `[LanguageDiscoveryService] Successfully discovered languages from: ${file}`
                    );
                    return languages;
                }
            }

            console.error(
                '[LanguageDiscoveryService] Could not discover languages from any JSON file, using default languages.'
            );
            return this.createLanguageInfoFromCodes(defaultLanguages || ['zh-TW', 'en-US']);
        } catch (error) {
            console.error('[LanguageDiscoveryService] Error scanning directory:', error);
            return this.createLanguageInfoFromCodes(defaultLanguages || ['zh-TW', 'en-US']);
        }
    }

    /**
     * Read existing translation file and extract language codes
     */
    private async discoverFromExistingFile(langFilePath: string): Promise<LanguageInfo[]> {
        try {
            const result = await JsonParser.parseFile(langFilePath);
            const langData = result.data;

            // Check if this looks like a translation file (has language codes as top-level keys)
            const keys = Object.keys(langData);
            if (keys.length === 0) {
                return [];
            }

            // Simple heuristic: if keys look like language codes (contains common language patterns)
            const languageCodePattern = /^[a-z]{2}(-[A-Z]{2,})?$/;
            let potentialLanguages = keys.filter(key => languageCodePattern.test(key));

            // If no language codes found at top level, check if this has nested "translation" structure
            if (potentialLanguages.length === 0) {
                // Check if any top-level key contains a "translation" object with language-like keys
                for (const key of keys) {
                    if (languageCodePattern.test(key) && 
                        langData[key] && 
                        typeof langData[key] === 'object' && 
                        'translation' in langData[key]) {
                        potentialLanguages.push(key);
                    }
                }
            }

            if (potentialLanguages.length === 0) {
                console.warn(
                    `[LanguageDiscoveryService] File ${langFilePath} doesn't appear to be a translation file`
                );
                return [];
            }

            console.error(
                `[LanguageDiscoveryService] Found ${potentialLanguages.length} languages: [${potentialLanguages.join(', ')}]`
            );
            return this.createLanguageInfoFromCodes(potentialLanguages);
        } catch (error) {
            console.error(`[LanguageDiscoveryService] Error reading file ${langFilePath}:`, error);
            return [];
        }
    }

    /**
     * Create LanguageInfo objects from language codes
     */
    private createLanguageInfoFromCodes(languageCodes: string[]): LanguageInfo[] {
        return languageCodes.map(code => this.createLanguageInfo(code));
    }

    /**
     * Create LanguageInfo from language code
     */
    private createLanguageInfo(langCode: string): LanguageInfo {
        const parts = langCode.split('-');
        const locale = parts[0];
        const region = parts[1] || '';

        // Common language names mapping
        const languageNames: Record<string, { english: string; local: string }> = {
            zh: { english: 'Chinese', local: '中文' },
            en: { english: 'English', local: 'English' },
            ja: { english: 'Japanese', local: '日本語' },
            ko: { english: 'Korean', local: '한국어' },
            fr: { english: 'French', local: 'Français' },
            de: { english: 'German', local: 'Deutsch' },
            es: { english: 'Spanish', local: 'Español' },
            it: { english: 'Italian', local: 'Italiano' },
            pt: { english: 'Portuguese', local: 'Português' },
            ru: { english: 'Russian', local: 'Русский' },
            th: { english: 'Thai', local: 'ไทย' },
            vi: { english: 'Vietnamese', local: 'Tiếng Việt' },
            ar: { english: 'Arabic', local: 'العربية' },
            hi: { english: 'Hindi', local: 'हिन्दी' }
        };

        // Region-specific mappings for common variants
        const regionMappings: Record<string, { english: string; local: string }> = {
            'zh-TW': { english: 'Traditional Chinese', local: '繁體中文' },
            'zh-CN': { english: 'Simplified Chinese', local: '简体中文' },
            'zh-HK': { english: 'Traditional Chinese (Hong Kong)', local: '繁體中文（香港）' },
            'en-US': { english: 'English (United States)', local: 'English (United States)' },
            'en-GB': { english: 'English (United Kingdom)', local: 'English (United Kingdom)' },
            'pt-BR': { english: 'Portuguese (Brazil)', local: 'Português (Brasil)' },
            'es-419': { english: 'Spanish (Latin America)', local: 'Español (Latinoamérica)' },
            'ja-JP': { english: 'Japanese', local: '日本語' },
            'ko-KR': { english: 'Korean', local: '한국어' },
            'th-TH': { english: 'Thai', local: 'ไทย' }
        };

        // Try exact match first
        const exactMatch = regionMappings[langCode];
        if (exactMatch) {
            return {
                code: langCode,
                english_name: exactMatch.english,
                local_name: exactMatch.local,
                locale,
                region
            };
        }

        // Use base language name
        const names = languageNames[locale] || {
            english: locale.toUpperCase(),
            local: locale.toUpperCase()
        };

        const englishName = region ? `${names.english} (${region.toUpperCase()})` : names.english;
        const localName = region ? `${names.local} (${region.toUpperCase()})` : names.local;

        return {
            code: langCode,
            english_name: englishName,
            local_name: localName,
            locale,
            region
        };
    }
}
