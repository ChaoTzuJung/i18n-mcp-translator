/**
 * Language file management service
 */

import fs from 'fs/promises';
import { existsSync, readdirSync, statSync } from 'fs';
import path from 'path';
import chalk from 'chalk';
import { type AiSuggestion, type TranslationConfig } from '../types/i18n.js';
import { type ServerConfig } from '../types/config.js';
import { JsonParser } from '../utils/json-parser.js';

export class LangManager {
    private langFilePath: string;
    private config: TranslationConfig;
    private serverConfig: ServerConfig;
    private useNewStructure: boolean = false;
    private subdirectory: string = '';

    constructor(serverConfig: ServerConfig, translationConfig: TranslationConfig) {
        this.config = translationConfig;
        this.serverConfig = serverConfig;
        this.langFilePath = this.resolveLangFilePath(serverConfig);
        this.detectStructure();
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

    private detectStructure(): void {
        try {
            const translationDir = path.dirname(this.langFilePath);
            
            // If subdirectory is explicitly configured, use it
            if (this.serverConfig.translationSubdirectory) {
                const subdirPath = path.join(translationDir, this.serverConfig.translationSubdirectory);
                if (existsSync(subdirPath)) {
                    this.useNewStructure = true;
                    this.subdirectory = this.serverConfig.translationSubdirectory;
                    console.error(`[LangManager] Using configured subdirectory: ${this.serverConfig.translationSubdirectory}`);
                    return;
                } else {
                    console.error(`[LangManager] Configured subdirectory ${this.serverConfig.translationSubdirectory} does not exist, falling back to detection`);
                }
            }

            // First, check for per-language JSON files directly in translation directory
            try {
                const files = readdirSync(translationDir);
                const languageCodePattern = /^[a-z]{2}(-[A-Z0-9]{2,})?\.json$/;
                const perLanguageFiles = files.filter((file: string) => languageCodePattern.test(file));

                if (perLanguageFiles.length > 0) {
                    this.useNewStructure = true;
                    this.subdirectory = ''; // No subdirectory - files are directly in translation dir
                    console.error(`[LangManager] Detected per-language files in translation directory: [${perLanguageFiles.join(', ')}]`);
                    return;
                }
            } catch (error) {
                // Continue to subdirectory detection
            }
            
            // Auto-detect subdirectories (client/, editor/, etc.)
            try {
                const files = readdirSync(translationDir);
                const subdirs = files.filter((file: string) => {
                    const filePath = path.join(translationDir, file);
                    return statSync(filePath).isDirectory();
                });

                for (const dir of subdirs) {
                    const subdirPath = path.join(translationDir, dir);
                    // Check if subdirectory contains per-language JSON files
                    try {
                        const subdirFiles = readdirSync(subdirPath);
                        const languageCodePattern = /^[a-z]{2}(-[A-Z0-9]{2,})?\.json$/;
                        const perLanguageFiles = subdirFiles.filter((file: string) => languageCodePattern.test(file));
                        
                        if (perLanguageFiles.length > 0) {
                            this.useNewStructure = true;
                            this.subdirectory = dir;
                            console.error(`[LangManager] Detected new structure with subdirectory: ${dir}`);
                            return;
                        }
                    } catch (error) {
                        // Continue to next subdirectory
                    }
                }
            } catch (error) {
                // Fall through to legacy structure
            }
            
            console.error('[LangManager] Using legacy structure with single lang.json file');
            this.useNewStructure = false;
        } catch (error) {
            console.error('[LangManager] Error detecting structure, using legacy format:', error);
            this.useNewStructure = false;
        }
    }

    private resolveLanguageFilePath(langCode: string): string {
        if (this.useNewStructure) {
            const translationDir = path.dirname(this.langFilePath);
            if (this.subdirectory) {
                // Files are in a subdirectory (e.g., client/zh-TW.json)
                return path.join(translationDir, this.subdirectory, `${langCode}.json`);
            } else {
                // Files are directly in translation directory (e.g., zh-TW.json)
                return path.join(translationDir, `${langCode}.json`);
            }
        }
        return this.langFilePath;
    }

    async readOrCreateLangFile(): Promise<Record<string, any>> {
        if (this.useNewStructure) {
            return this.readOrCreateNewStructure();
        } else {
            return this.readOrCreateLegacyStructure();
        }
    }

    private async readOrCreateLegacyStructure(): Promise<Record<string, any>> {
        try {
            const result = await JsonParser.parseFile(this.langFilePath);
            return result.data;
        } catch (error) {
            console.error('Language file not found. A new one will be created.');
            try {
                const dirPath = path.dirname(this.langFilePath);
                console.error('Creating directory:', dirPath);
                await fs.mkdir(dirPath, { recursive: true });

                console.error('Creating empty lang.json file at:', this.langFilePath);
                await JsonParser.writeFile(this.langFilePath, {});
                return {};
            } catch (createError) {
                console.error('Failed to create language file:', createError);
                throw createError;
            }
        }
    }

    private async readOrCreateNewStructure(): Promise<Record<string, any>> {
        const langData: Record<string, any> = {};
        
        // Read all language files from the subdirectory
        for (const langInfo of this.config.availableLanguages) {
            const langFilePath = this.resolveLanguageFilePath(langInfo.code);
            
            try {
                const result = await JsonParser.parseFile(langFilePath);
                langData[langInfo.code] = result.data;
            } catch (error) {
                console.error(`Language file not found for ${langInfo.code}. A new one will be created.`);
                
                // Create directory if it doesn't exist
                const dirPath = path.dirname(langFilePath);
                await fs.mkdir(dirPath, { recursive: true });
                
                // Create empty file
                await JsonParser.writeFile(langFilePath, {});
                langData[langInfo.code] = {};
            }
        }
        
        return langData;
    }

    updateLangData(langData: Record<string, any>, suggestion: AiSuggestion): void {
        const { i18nKey, translations, originalText } = suggestion;

        // Add the original source text to the translations object
        const updatedTranslations = { ...translations };
        updatedTranslations[this.config.sourceLanguage] = originalText;

        console.error(`  -> Updating key: "${i18nKey}"`);

        for (const [langCode, text] of Object.entries(updatedTranslations)) {
            // Ensure the top-level language key exists
            if (!langData[langCode]) {
                langData[langCode] = {};
            }

            if (this.useNewStructure) {
                // New structure: direct key-value pairs
                langData[langCode][i18nKey] = text;
            } else {
                // Legacy structure: check if nested "translation" structure exists
                if (this.hasNestedTranslationStructure(langData)) {
                    // Ensure the "translation" key exists
                    if (!langData[langCode].translation) {
                        langData[langCode].translation = {};
                    }
                    langData[langCode].translation[i18nKey] = text;
                } else {
                    langData[langCode][i18nKey] = text;
                }
            }
        }
    }

    private hasNestedTranslationStructure(langData: Record<string, any>): boolean {
        // Check if this is truly a nested structure where ALL content is under "translation"
        for (const lang of Object.keys(langData)) {
            if (!langData[lang] || typeof langData[lang] !== 'object') {
                continue;
            }

            const langObj = langData[lang];
            const keys = Object.keys(langObj);

            // If "translation" exists and has content, and it's the ONLY meaningful key
            if (
                'translation' in langObj &&
                langObj.translation &&
                typeof langObj.translation === 'object' &&
                Object.keys(langObj.translation).length > 0
            ) {
                // Count non-empty keys other than "translation"
                const otherNonEmptyKeys = keys.filter(
                    key =>
                        key !== 'translation' &&
                        langObj[key] !== null &&
                        langObj[key] !== undefined &&
                        !(
                            typeof langObj[key] === 'object' &&
                            Object.keys(langObj[key]).length === 0
                        )
                );

                // If translation has content and there are no other meaningful keys, it's nested
                if (otherNonEmptyKeys.length === 0) {
                    return true;
                }
            }
        }
        return false;
    }

    async writeLangFile(langData: Record<string, any>): Promise<void> {
        if (this.useNewStructure) {
            await this.writeNewStructure(langData);
        } else {
            await this.writeLegacyStructure(langData);
        }
    }

    private async writeLegacyStructure(langData: Record<string, any>): Promise<void> {
        try {
            console.error('Writing to language file:', this.langFilePath);

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

            await JsonParser.writeFile(this.langFilePath, sortedLangData);
            console.error(
                chalk.green(`\n✅ Language file successfully updated at ${this.langFilePath}`)
            );
        } catch (error) {
            console.error(chalk.red('❌ Error writing language file:', error));
            throw error;
        }
    }

    private async writeNewStructure(langData: Record<string, any>): Promise<void> {
        try {
            const structureDesc = this.getFileStructureDescription();
            console.error(`Writing to ${structureDesc}`);

            // Write each language to its own file
            for (const langCode of Object.keys(langData)) {
                const langFilePath = this.resolveLanguageFilePath(langCode);
                const dirPath = path.dirname(langFilePath);

                // Ensure the directory exists
                await fs.mkdir(dirPath, { recursive: true });

                // Sort keys alphabetically for consistent ordering
                const sortedKeys = Object.keys(langData[langCode]).sort();
                const sortedTranslations: Record<string, string> = {};
                for (const key of sortedKeys) {
                    sortedTranslations[key] = langData[langCode][key];
                }

                await JsonParser.writeFile(langFilePath, sortedTranslations);
                console.error(
                    chalk.green(`✅ Language file for ${langCode} successfully updated at ${langFilePath}`)
                );
            }
        } catch (error) {
            console.error(chalk.red('❌ Error writing language files:', error));
            throw error;
        }
    }

    /**
     * Get a human-readable description of the file structure for logging
     */
    getFileStructureDescription(): string {
        if (this.useNewStructure) {
            if (this.subdirectory) {
                return `per-language files in ${this.subdirectory}/ subdirectory`;
            } else {
                return `per-language files (zh-TW.json, en-US.json, etc.)`;
            }
        } else {
            return `single language file (${path.basename(this.langFilePath)})`;
        }
    }

    /**
     * Get list of files that will be updated for logging
     */
    getUpdatedFilesDescription(langData: Record<string, any>): string {
        if (this.useNewStructure) {
            const languages = Object.keys(langData);
            if (this.subdirectory) {
                return `${languages.length} files in ${this.subdirectory}/: ${languages.map(lang => `${lang}.json`).join(', ')}`;
            } else {
                return `${languages.length} files: ${languages.map(lang => `${lang}.json`).join(', ')}`;
            }
        } else {
            return `${path.basename(this.langFilePath)}`;
        }
    }
}
