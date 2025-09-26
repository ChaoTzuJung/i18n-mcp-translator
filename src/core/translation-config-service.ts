/**
 * Service for building and managing translation configuration
 */
import { LanguageDiscoveryService } from './language-discovery-service.js';
import { type TranslationConfig, type LanguageInfo } from '../types/i18n.js';
import { type ServerConfig } from '../types/config.js';

export class TranslationConfigService {
    private readonly languageDiscoveryService: LanguageDiscoveryService;

    constructor() {
        this.languageDiscoveryService = new LanguageDiscoveryService();
    }

    /**
     * Build TranslationConfig from ServerConfig and discovered languages
     */
    async buildTranslationConfig(serverConfig: ServerConfig): Promise<TranslationConfig> {
        console.error('[TranslationConfigService] Building translation configuration...');

        // 1. Get source language from config (with default fallback)
        const sourceLanguage = serverConfig.baseLanguage || 'zh-TW';

        // 2. Get target languages from config (with default fallback)
        const targetLanguages = serverConfig.targetLanguages || ['en-US'];

        // 3. Build required languages list (source + targets)
        const requiredLanguages = [sourceLanguage, ...targetLanguages];
        const uniqueLanguages = [...new Set(requiredLanguages)]; // Remove duplicates

        // 4. Discover available languages from translation files
        const translationDir = serverConfig.translationDir || './src/assets/locale';
        const allLocales = await this.languageDiscoveryService.discoverLanguages(
            translationDir, 
            serverConfig.translationFileName,
            uniqueLanguages
        );

        // 5. Build langMap with available languages
        const langMap = this.buildLangMap(uniqueLanguages, allLocales);

        // 6. Validate that all required languages are available
        this.validateRequiredLanguages(uniqueLanguages, langMap);

        const translationConfig: TranslationConfig = {
            sourceLanguage,
            targetLanguages,
            langMap,
            availableLanguages: allLocales
        };

        console.error('[TranslationConfigService] Translation configuration built successfully:');
        console.error(`  - Source Language: ${sourceLanguage}`);
        console.error(`  - Target Languages: [${targetLanguages.join(', ')}]`);
        console.error(`  - Available Languages: [${Object.keys(langMap).join(', ')}]`);

        return translationConfig;
    }

    /**
     * Build language mapping from required languages and available locales
     */
    private buildLangMap(
        requiredLanguages: string[],
        allLocales: LanguageInfo[]
    ): Record<string, LanguageInfo> {
        const langMap: Record<string, LanguageInfo> = {};

        for (const reqLang of requiredLanguages) {
            // First try exact match
            let locale = allLocales.find(l => l.code === reqLang);

            // If no exact match, try to find by locale part (e.g., 'en' for 'en-US')
            if (!locale && reqLang.includes('-')) {
                const localeOnly = reqLang.split('-')[0];
                locale = allLocales.find(l => l.locale === localeOnly && !l.region);
            }

            // If still no match, try to find any variant of the locale
            if (!locale) {
                const localeOnly = reqLang.includes('-') ? reqLang.split('-')[0] : reqLang;
                locale = allLocales.find(l => l.locale === localeOnly);
            }

            if (locale) {
                langMap[reqLang] = locale;
            } else {
                // Create a fallback entry for unsupported languages
                console.warn(
                    `[TranslationConfigService] Language '${reqLang}' not found in OneSky, creating fallback entry.`
                );
                langMap[reqLang] = this.createFallbackLanguageInfo(reqLang);
            }
        }

        return langMap;
    }

    /**
     * Create fallback language info for unsupported languages
     */
    private createFallbackLanguageInfo(langCode: string): LanguageInfo {
        const parts = langCode.split('-');
        const locale = parts[0];
        const region = parts[1] || '';

        // Some common fallback names
        const fallbackNames: Record<string, { english: string; local: string }> = {
            zh: { english: 'Chinese', local: '中文' },
            en: { english: 'English', local: 'English' },
            ja: { english: 'Japanese', local: '日本語' },
            ko: { english: 'Korean', local: '한국어' },
            fr: { english: 'French', local: 'Français' },
            de: { english: 'German', local: 'Deutsch' },
            es: { english: 'Spanish', local: 'Español' },
            it: { english: 'Italian', local: 'Italiano' },
            pt: { english: 'Portuguese', local: 'Português' },
            ru: { english: 'Russian', local: 'Русский' }
        };

        const names = fallbackNames[locale] || {
            english: locale.toUpperCase(),
            local: locale.toUpperCase()
        };

        return {
            code: langCode,
            english_name: region ? `${names.english} (${region.toUpperCase()})` : names.english,
            local_name: region ? `${names.local} (${region.toUpperCase()})` : names.local,
            locale,
            region
        };
    }

    /**
     * Validate that all required languages are available
     */
    private validateRequiredLanguages(
        requiredLanguages: string[],
        langMap: Record<string, LanguageInfo>
    ): void {
        const missingLanguages = requiredLanguages.filter(lang => !langMap[lang]);

        if (missingLanguages.length > 0) {
            console.warn(
                `[TranslationConfigService] Some required languages are not available: [${missingLanguages.join(', ')}]`
            );
            console.warn(
                '[TranslationConfigService] Fallback entries will be used for these languages.'
            );
        }

        const availableLanguages = Object.keys(langMap);
        if (availableLanguages.length === 0) {
            throw new Error('No languages are available for translation configuration.');
        }
    }

    /**
     * Get all available locales for debugging/info purposes
     */
    async getAllAvailableLocales(serverConfig: ServerConfig): Promise<LanguageInfo[]> {
        const translationDir = serverConfig.translationDir || './src/assets/locale';
        return this.languageDiscoveryService.discoverLanguages(
            translationDir, 
            serverConfig.translationFileName
        );
    }
}
