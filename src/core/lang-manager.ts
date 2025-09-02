/**
 * Language file management service
 */

import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import { type AiSuggestion, type TranslationConfig } from '../types/i18n.js';
import { type ServerConfig } from '../types/config.js';
import { JsonParser } from '../utils/json-parser.js';

export class LangManager {
    private langFilePath: string;
    private config: TranslationConfig;

    constructor(serverConfig: ServerConfig, translationConfig: TranslationConfig) {
        this.config = translationConfig;
        this.langFilePath = this.resolveLangFilePath(serverConfig);
    }

    private resolveLangFilePath(serverConfig: ServerConfig): string {
        const translationDir = serverConfig.translationDir || './src/assets/locale';
        const projectRoot = serverConfig.projectRoot || process.cwd();

        // If translationDir is absolute, use it directly
        if (path.isAbsolute(translationDir)) {
            return path.join(translationDir, serverConfig?.translationFileName || 'lang.json');
        }

        // Otherwise, resolve relative to project root
        return path.resolve(
            projectRoot,
            translationDir,
            serverConfig?.translationFileName || 'lang.json'
        );
    }

    async readOrCreateLangFile(): Promise<Record<string, any>> {
        try {
            const result = await JsonParser.parseFile(this.langFilePath);
            return result.data;
        } catch (error) {
            console.error('Language file not found. A new one will be created.');
            try {
                // 建立資料夾
                const dirPath = path.dirname(this.langFilePath);
                console.error('Creating directory:', dirPath);
                await fs.mkdir(dirPath, { recursive: true });

                // 建立空 JSON 檔案
                console.error('Creating empty lang.json file at:', this.langFilePath);
                await JsonParser.writeFile(this.langFilePath, {});
                return {};
            } catch (createError) {
                console.error('Failed to create language file:', createError);
                throw createError;
            }
        }
    }

    updateLangData(langData: Record<string, any>, suggestion: AiSuggestion): void {
        const { i18nKey, translations, originalText } = suggestion;

        // Add the original source text to the translations object
        const updatedTranslations = { ...translations };
        updatedTranslations[this.config.sourceLanguage] = originalText;

        console.error(`  -> Updating key: "${i18nKey}"`);

        for (const [langCode, text] of Object.entries(updatedTranslations)) {
            // Use langCode directly since we now support the actual language codes
            const fileLangKey = langCode;

            // Ensure the top-level language key exists (e.g., "en-US": {})
            if (!langData[fileLangKey]) {
                langData[fileLangKey] = {};
            }

            // Check if this uses nested "translation" structure
            if (this.hasNestedTranslationStructure(langData)) {
                // Ensure the "translation" key exists
                if (!langData[fileLangKey].translation) {
                    langData[fileLangKey].translation = {};
                }
                // Add the new key-value pair under "translation"
                langData[fileLangKey].translation[i18nKey] = text;
            } else {
                // Add the new key-value pair directly
                langData[fileLangKey][i18nKey] = text;
            }
        }
    }

    private hasNestedTranslationStructure(langData: Record<string, any>): boolean {
        // Check if any language has a "translation" key
        for (const lang of Object.keys(langData)) {
            if (langData[lang] && typeof langData[lang] === 'object' && 'translation' in langData[lang]) {
                return true;
            }
        }
        return false;
    }

    async writeLangFile(langData: Record<string, any>): Promise<void> {
        try {
            console.error('Writing to Lang file:', this.langFilePath);

            // Get the directory for the language file
            const dirPath = path.dirname(this.langFilePath);

            // Ensure the directory exists, creating it if necessary
            await fs.mkdir(dirPath, { recursive: true });

            // Sort keys alphabetically for consistent ordering
            const sortedLangData: Record<string, any> = {};
            const isNested = this.hasNestedTranslationStructure(langData);
            
            for (const langKey in langData) {
                if (isNested && langData[langKey].translation) {
                    // Handle nested structure with "translation" key
                    const sortedKeys = Object.keys(langData[langKey].translation).sort();
                    const sortedTranslations: Record<string, string> = {};
                    for (const key of sortedKeys) {
                        sortedTranslations[key] = langData[langKey].translation[key];
                    }
                    sortedLangData[langKey] = {
                        translation: sortedTranslations
                    };
                } else {
                    // Handle flat structure
                    const sortedKeys = Object.keys(langData[langKey]).sort();
                    const sortedLang: Record<string, string> = {};
                    for (const key of sortedKeys) {
                        sortedLang[key] = langData[langKey][key];
                    }
                    sortedLangData[langKey] = sortedLang;
                }
            }

            await JsonParser.writeFile(this.langFilePath, sortedLangData, 4);
            console.error(
                chalk.green(`\n✅ Language file successfully updated at ${this.langFilePath}`)
            );
        } catch (error) {
            console.error(chalk.red('❌ Error writing language file:', error));
            throw error;
        }
    }
}
