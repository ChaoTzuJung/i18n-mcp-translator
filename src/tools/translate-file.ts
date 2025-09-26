/**
 * Translate file tool - Main i18n translation functionality
 */

import { z } from 'zod';
import { ServerConfig } from '../types/config.js';
import { AiService } from '../core/ai-service.js';
import { LangManager } from '../core/lang-manager.js';
import { FileProcessor } from '../core/file-processor.js';
import { TranslationConfig } from '../types/i18n.js';


/**
 * Setup the translate file tool
 */
export function setupTranslateFileTool(
    server: any,
    config: Required<ServerConfig>,
    translationConfig: TranslationConfig
) {
    server.tool(
        'translate-file',
        'Scans a source code file for hardcoded Chinese text, replaces it with i18n keys, updates a local lang.json file, and returns the modified file content.',
        {
            filePath: z
                .string()
                .describe(
                    "The full path of the file being processed, e.g., 'src/components/Login.jsx'"
                ),
            fileContent: z
                .string()
                .describe('The entire source code content of the file to be translated.')
        },
        async ({ filePath, fileContent }: { filePath: string; fileContent: string }) => {
            console.error(`[i18n-tool] Received request for file: ${filePath}`);

            try {
                const aiService = new AiService(config, translationConfig);
                const langManager = new LangManager(config, translationConfig);
                const fileProcessor = new FileProcessor(config, aiService);

                const langData = await langManager.readOrCreateLangFile();
                const { modifiedCode, suggestions } = await fileProcessor.processFileContent(
                    filePath,
                    fileContent
                );

                let summary;

                if (suggestions.length > 0) {
                    // Step 3: Update the in-memory language data with all new suggestions
                    console.error(
                        `[i18n-tool] Found ${suggestions.length} new strings. Updating language file.`
                    );
                    for (const suggestion of suggestions) {
                        langManager.updateLangData(langData, suggestion);
                    }

                    // Step 4: Write the updated language file back to disk once
                    await langManager.writeLangFile(langData);

                    const updatedFiles = langManager.getUpdatedFilesDescription(langData);
                    summary = `Successfully processed ${filePath}. Found and translated ${suggestions.length} new strings. Updated ${updatedFiles}.`;

                    // Return the summary AND the modified code
                    return {
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
                    console.error('[i18n-tool] No new strings found.');

                    // Return ONLY the summary text
                    return {
                        content: [
                            {
                                type: 'text',
                                text: summary
                            }
                        ]
                    };
                }
            } catch (error) {
                console.error('[i18n-tool] An error occurred:', error);
                const errorMessage =
                    error instanceof Error ? error.message : 'Unknown error occurred';
                return {
                    content: [
                        {
                            type: 'text',
                            text: `An error occurred while translating the file: ${errorMessage}`
                        }
                    ]
                };
            }
        }
    );
}
