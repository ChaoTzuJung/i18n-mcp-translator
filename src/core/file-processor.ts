/**
 * File content processing for i18n transformation
 */

import * as babelParser from '@babel/parser';
import { createRequire } from 'module';
import { NodePath } from '@babel/traverse';
import * as prettier from 'prettier';
import * as t from '@babel/types';
import fs from 'fs/promises';
import { AiService } from './ai-service.js';
import { isI18nKey, isLikelyChinese } from '../utils/text-utils.js';
import { resolveFilePath } from '../utils/path-resolver.js';
import { type ServerConfig } from '../types/config.js';
import { type AiSuggestion, type ProcessFileResult } from '../types/i18n.js';

// Use createRequire to import CommonJS modules
const require = createRequire(import.meta.url);
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;

export class FileProcessor {
    private aiService: AiService;
    private config: ServerConfig;

    constructor(config: ServerConfig, aiService: AiService) {
        this.config = config;
        this.aiService = aiService;
    }

    private isI18nCall(nodePath: NodePath<t.CallExpression>): boolean {
        const callee = nodePath.get('callee');
        // 簡單判斷 t('key')
        if (callee.isIdentifier({ name: 't' })) return true;

        // 判斷 i18n.t('key') 或 i18next.t('key')
        if (callee.isMemberExpression()) {
            const object = callee.get('object');
            const property = callee.get('property');
            if (property.isIdentifier({ name: 't' })) {
                if (
                    object.isIdentifier({ name: 'i18n' }) ||
                    object.isIdentifier({ name: 'i18next' })
                ) {
                    return true;
                }
                // 可以擴展到 this.i18n.t, props.t 等
            }
        }
        return false;
    }

    async processFileContent(filePath: string, fileContent: string): Promise<ProcessFileResult> {
        console.error(`[processFileContent] Processing file: ${filePath}`);
        console.error(`[processFileContent] File content length: ${fileContent.length} characters`);

        const ast = babelParser.parse(fileContent, {
            sourceType: 'module',
            plugins: ['jsx', 'typescript']
        });

        let modified = false;
        let suggestions: AiSuggestion[] = [];
        const tasks: (() => Promise<void>)[] = [];

        traverse(ast, {
            CallExpression: (path: NodePath<t.CallExpression>) => {
                if (this.isI18nCall(path)) {
                    const firstArg = path.get('arguments')[0];
                    if (firstArg?.isStringLiteral()) {
                        const hardcodedText = firstArg.node.value;
                        if (isI18nKey(hardcodedText) || !isLikelyChinese(hardcodedText)) {
                            return;
                        }

                        const parentJsxElement = path.findParent((p: NodePath) => p.isJSXElement());
                        const contextCode = parentJsxElement
                            ? generate(parentJsxElement.node).code
                            : 'No JSX context found.';

                        tasks.push(async () => {
                            const suggestion = await this.aiService.getAiSuggestions(
                                hardcodedText,
                                contextCode
                            );

                            if (suggestion && suggestion.i18nKey) {
                                console.error(`AI generated key: "${suggestion.i18nKey}"`);
                                // Replace the string literal with the new key
                                firstArg.replaceWith(t.stringLiteral(suggestion.i18nKey));
                                suggestions.push({ ...suggestion, originalText: hardcodedText });
                                modified = true;
                            }
                        });
                    }
                }
            }
        });

        // Sequentially process to avoid rate limits
        for (const task of tasks) {
            await task();
        }

        if (modified) {
            console.error(`[processFileContent] Transfer relative path to absolute path...`);
            const absolutePath = resolveFilePath(filePath, this.config);
            console.error(`[processFileContent] Relative path: ${filePath}`);
            console.error(`[processFileContent] Absolute path: ${absolutePath}`);
            console.error(`[processFileContent] Applying changes to ${absolutePath}...`);

            try {
                const output = generate(ast, {}, fileContent);
                console.error(
                    `[processFileContent] Generated code length: ${output.code.length} characters`
                );

                const formattedCode = await prettier.format(output.code, {
                    parser:
                        absolutePath.endsWith('.tsx') || absolutePath.endsWith('.ts')
                            ? 'typescript'
                            : 'babel'
                });
                console.error(
                    `[processFileContent] Formatted code length: ${formattedCode.length} characters`
                );

                // Check if we should write the file back
                try {
                    console.error(`[processFileContent] Writing to file: ${filePath}`);

                    // Ensure the directory exists before writing the file
                    // TODO: 不卻定是否要保留
                    // const dirPath = path.dirname(filePath);
                    // console.error(`[processFileContent] Creating directory: ${dirPath}`);
                    // await fs.mkdir(dirPath, { recursive: true });

                    await fs.writeFile(absolutePath, formattedCode, 'utf-8');
                    console.error(`✅ Successfully updated ${absolutePath}`);
                } catch (writeError) {
                    console.error(`⚠️  Could not write to file ${absolutePath}:`, writeError);
                    console.error('Returning modified code without writing to disk.');
                }

                return { modifiedCode: formattedCode, suggestions };
            } catch (formatError) {
                console.error(
                    `❌ Error during code generation or formatting for ${absolutePath}:`,
                    formatError
                );
                throw formatError;
            }
        }

        console.error(`No changes were made to ${filePath}`);
        return { modifiedCode: fileContent, suggestions };
    }
}
