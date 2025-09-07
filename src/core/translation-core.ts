import fs from 'fs';
import { AiService } from './ai-service.js';
import { LangManager } from './lang-manager.js';
import { FileProcessor } from './file-processor.js';
import { ServerConfig } from '../types/config.js';
import { TranslationConfig, AiSuggestion } from '../types/i18n.js';

export interface TranslationResult {
    success: boolean;
    filePath: string;
    summary: string;
    modifiedCode?: string;
    suggestions: AiSuggestion[];
    translatedStrings: Array<{
        original: string;
        key: string;
        translation: string;
        timestamp: number;
    }>;
    content: Array<{
        type: 'text' | 'resource';
        text?: string;
        resource?: {
            uri: string;
            text: string;
        };
    }>;
}

export class TranslationCore {
    private aiService: AiService;
    private langManager: LangManager;
    private fileProcessor: FileProcessor;

    constructor(
        private config: Required<ServerConfig>,
        private translationConfig: TranslationConfig
    ) {
        this.aiService = new AiService(config, translationConfig);
        this.langManager = new LangManager(config, translationConfig);
        this.fileProcessor = new FileProcessor(config, this.aiService);
    }

    /**
     * Translate a file with the given content
     */
    async translateFileContent(filePath: string, fileContent: string): Promise<TranslationResult> {
        console.log(`[translation-core] Processing file: ${filePath}`);

        try {
            // Step 1: Load or create language data
            const langData = await this.langManager.readOrCreateLangFile();

            // Step 2: Process the file content
            const { modifiedCode, suggestions } = await this.fileProcessor.processFileContent(
                filePath,
                fileContent
            );

            let summary: string;
            let translatedStrings: Array<{
                original: string;
                key: string;
                translation: string;
                timestamp: number;
            }> = [];

            if (suggestions.length > 0) {
                console.log(
                    `[translation-core] Found ${suggestions.length} new strings. Updating language file.`
                );

                // Step 3: Update the in-memory language data with all new suggestions
                for (const suggestion of suggestions) {
                    this.langManager.updateLangData(langData, suggestion);

                    // Convert suggestion to translatedStrings format for caching
                    // Get the first available translation (usually English)
                    const firstTranslation = Object.values(suggestion.translations)[0] || '';
                    translatedStrings.push({
                        original: suggestion.originalText,
                        key: suggestion.i18nKey,
                        translation: firstTranslation,
                        timestamp: Date.now()
                    });
                }

                // Step 4: Write the updated language file back to disk
                await this.langManager.writeLangFile(langData);

                summary = `Successfully processed ${filePath}. Found and translated ${suggestions.length} new strings. The lang.json file has been updated.`;

                // Return success result with modified code
                return {
                    success: true,
                    filePath,
                    summary,
                    modifiedCode,
                    suggestions,
                    translatedStrings,
                    content: [
                        {
                            type: 'text',
                            text: summary
                        },
                        {
                            type: 'resource',
                            resource: {
                                uri: filePath,
                                text: modifiedCode
                            }
                        }
                    ]
                };
            } else {
                summary = `Scanned ${filePath}. No new Chinese text was found to translate.`;
                console.log('[translation-core] No new strings found.');

                // Return success result without modifications
                return {
                    success: true,
                    filePath,
                    summary,
                    suggestions: [],
                    translatedStrings: [],
                    content: [
                        {
                            type: 'text',
                            text: summary
                        }
                    ]
                };
            }
        } catch (error) {
            console.error('[translation-core] Translation error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

            return {
                success: false,
                filePath,
                summary: `Error translating ${filePath}: ${errorMessage}`,
                suggestions: [],
                translatedStrings: [],
                content: [
                    {
                        type: 'text',
                        text: `Error translating ${filePath}: ${errorMessage}`
                    }
                ]
            };
        }
    }

    /**
     * Translate a file by reading its content from disk
     */
    async translateFile(filePath: string): Promise<TranslationResult> {
        try {
            if (!fs.existsSync(filePath)) {
                throw new Error(`File not found: ${filePath}`);
            }

            const fileContent = fs.readFileSync(filePath, 'utf8');
            return await this.translateFileContent(filePath, fileContent);
        } catch (error) {
            console.error('[translation-core] File read error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

            return {
                success: false,
                filePath,
                summary: `Error reading ${filePath}: ${errorMessage}`,
                suggestions: [],
                translatedStrings: [],
                content: [
                    {
                        type: 'text',
                        text: `Error reading ${filePath}: ${errorMessage}`
                    }
                ]
            };
        }
    }

    /**
     * Create a new TranslationCore instance with custom config
     */
    static create(
        config: Required<ServerConfig>,
        translationConfig: TranslationConfig
    ): TranslationCore {
        return new TranslationCore(config, translationConfig);
    }
}
