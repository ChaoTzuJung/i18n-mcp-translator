import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as babelParser from '@babel/parser';
import { createRequire } from 'module';
import { NodePath } from '@babel/traverse';
import * as prettier from 'prettier';
import * as t from '@babel/types';
import chalk from 'chalk';

// Use createRequire to import CommonJS modules
const require = createRequire(import.meta.url);
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;

// --- CONFIGURATION ---
const SOURCE_LANGUAGE = 'Traditional Chinese';
const TARGET_LANGUAGES = ['English', 'Japanese', 'Simplified Chinese'];

// This path is relative to the script file itself.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// We go up one level from `build` to the project root.
const LANG_FILE_PATH = path.resolve(__dirname, '..', 'src/assets/locale/lang.json');

const LANG_MAP: Record<string, string> = {
    en: 'en-US',
    ja: 'ja',
    'zh-CN': 'zh-CN',
    'zh-TW': 'zh-TW'
};
const SOURCE_LANG_KEY = 'zh-TW';
// --- END CONFIGURATION ---

const apiKey = process.env.GOOGLE_AI_API_KEY;
if (!apiKey) {
    throw new Error('GOOGLE_AI_API_KEY is not set');
}
// Initialize AI
const genAI = new GoogleGenerativeAI(apiKey.trim());
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// --- TYPE DEFINITIONS ---
export interface AiSuggestion {
    i18nKey: string;
    // { 語系: 翻譯後的文字 }
    translations: Record<string, string>;
    originalText: string;
}

// --- HELPER FUNCTIONS ---
const isI18nKey = (text: string): boolean => /^[a-z0-9]+(\.[a-z0-9]+)+$/.test(text);
const isLikelyChinese = (text: string): boolean => /[\u4e00-\u9fa5]/.test(text);

// --- CORE AGENT LOGIC ---

export async function getAiSuggestions(
    text: string,
    context: string
): Promise<AiSuggestion | null> {
    const jsonOutputSchema = {
        i18nKey: 'string',
        translations: {
            en: 'string',
            ja: 'string',
            'zh-CN': 'string'
            // Add other language codes here
        }
    };

    const prompt = `
      You are an expert i18n (internationalization) assistant for a React project.
      Your task is to perform two actions:
      1.  Generate a structured i18n key for a given text based on its code context.
      2.  Translate the original text into a specified list of target languages.
  
      **Rules for Key Generation:**
      - The key should be in English and use dot.case (e.g., 'component.title').
      - Infer the context from the provided code snippet.
      - If the text is in a <button>, start the key with 'btn.'.
      - If the text is in a <h1>, <h2>, etc., start the key with 'title.'.
      - If the text is in a <p>, <span>, or general text node, start with 'label.'.
      - If it's a form input placeholder, use 'placeholder.'.
      - The rest of the key should be a short, descriptive English version of the text. For '關閉', a good key would be 'btn.close'.
  
      **Input:**
      - Original Text: "${text}"
      - Source Language: "${SOURCE_LANGUAGE}"
      - Target Languages: ${JSON.stringify(TARGET_LANGUAGES)}
      - Code Context:
      \`\`\`jsx
      ${context}
      \`\`\`
  
      **Output:**
      Please provide your response ONLY in a valid JSON format that matches this schema, with no additional text or explanations.
      \`\`\`json
      ${JSON.stringify(jsonOutputSchema, null, 2)}
      \`\`\`
      `;

    try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        const jsonString = response
            .text()
            .replace(/```json|```/g, '')
            .trim();
        return JSON.parse(jsonString);
    } catch (error) {
        console.error('Error calling AI model:', error);
        return null;
    }
}

export async function readOrCreateLangFile(): Promise<Record<string, any>> {
    try {
        const fileContent = await fs.readFile(LANG_FILE_PATH, 'utf-8');
        return JSON.parse(fileContent);
    } catch (error) {
        // 統一錯誤處理邏輯
        console.error('Language file not found. A new one will be created.');
        try {
            // 建立資料夾
            const dirPath = path.dirname(LANG_FILE_PATH);
            console.error('Creating directory:', dirPath);
            await fs.mkdir(dirPath, { recursive: true });
            // 建立空 JSON 檔案
            console.error('Creating empty lang.json file at:', LANG_FILE_PATH);
            await fs.writeFile(LANG_FILE_PATH, '{}', 'utf-8');
            return {};
        } catch (createError) {
            console.error('Failed to create language file:', createError);
            throw createError;
        }
    }
}

export function updateLangData(langData: Record<string, any>, suggestion: AiSuggestion) {
    const { i18nKey, translations, originalText } = suggestion;

    // Add the original source text to the translations object
    translations[SOURCE_LANG_KEY] = originalText;

    console.error(`  -> Updating key: "${i18nKey}"`);

    for (const [langCode, text] of Object.entries(translations)) {
        const fileLangKey = LANG_MAP[langCode];
        if (!fileLangKey) continue; // Skip if language is not in our map

        // Ensure the top-level language key exists (e.g., "en-US": {})
        if (!langData[fileLangKey]) {
            langData[fileLangKey] = {};
        }

        // Add the new key-value pair
        langData[fileLangKey][i18nKey] = text;
    }
}

/**
 * Writes the final language data object to the JSON file, creating the
 * directory structure if it doesn't exist.
 * @param {object} langData - The complete language data to write.
 */
export async function writeLangFile(langData: Record<string, any>) {
    try {
        console.error('Writing to Lang file:', LANG_FILE_PATH);
        // Get the directory for the language file.
        const dirPath = path.dirname(LANG_FILE_PATH);

        console.error('dirPath:', dirPath);

        // Ensure the directory exists, creating it if necessary.
        await fs.mkdir(dirPath, { recursive: true });
        // Sort keys alphabetically for consistent ordering
        for (const langKey in langData) {
            const sortedKeys = Object.keys(langData[langKey]).sort();
            const sortedLang: Record<string, string> = {};
            for (const key of sortedKeys) {
                sortedLang[key] = langData[langKey][key];
            }
            langData[langKey] = sortedLang;
        }

        const jsonString = JSON.stringify(langData, null, 4); // Use 4 spaces for nice formatting
        await fs.writeFile(LANG_FILE_PATH, jsonString, 'utf-8');
        console.error(chalk.green(`\n✅ Language file successfully updated at ${LANG_FILE_PATH}`));
    } catch (error) {
        console.error(chalk.red('❌ Error writing language file:', error));
    }
}

/**
 * Processes the content of a single file.
 * This is the heart of the agent.
 * @param filePath The path of the file for context.
 * @param fileContent The source code to process.
 * @returns An object containing the modified code and a list of new translations.
 */
export async function processFileContent(
    filePath: string,
    fileContent: string
): Promise<{ modifiedCode: string; suggestions: AiSuggestion[] }> {
    console.error(`[processFileContent] Processing file: ${filePath}`);
    console.error(`[processFileContent] File content length: ${fileContent.length} characters`);

    const ast = babelParser.parse(fileContent, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript']
    });

    let modified = false;
    let suggestions: AiSuggestion[] = [];
    const tasks: (() => Promise<void>)[] = [];

    const isI18nCall = (nodePath: NodePath<t.CallExpression>) => {
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
    };

    traverse(ast, {
        CallExpression(path: NodePath<t.CallExpression>) {
            if (isI18nCall(path)) {
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
                        const suggestion = await getAiSuggestions(hardcodedText, contextCode);

                        if (suggestion && suggestion.i18nKey) {
                            console.error(`AI generated key: "${suggestion.i18nKey}"`);
                            // Replace the string literal with the new key
                            firstArg.replaceWith(t.stringLiteral(suggestion.i18nKey));
                            suggestions.push({ ...suggestion, originalText: hardcodedText });

                            modified = true;
                            // We will also handle the OneSky update here
                            // await updateOneSky(suggestion);
                        }
                    });
                }
            }
        }
    });

    // Run all the AI and update tasks
    // if (tasks.length > 0) {
    //     await Promise.all(tasks.map(task => task()));
    // }

    // Sequentially process to avoid rate limits
    for (const task of tasks) {
        await task();
    }

    if (modified) {
        console.error(`[processFileContent] Applying changes to ${filePath}...`);

        try {
            const output = generate(ast, {}, fileContent);
            console.error(
                `[processFileContent] Generated code length: ${output.code.length} characters`
            );

            const formattedCode = await prettier.format(output.code, {
                parser:
                    filePath.endsWith('.tsx') || filePath.endsWith('.ts') ? 'typescript' : 'babel'
            });
            console.error(
                `[processFileContent] Formatted code length: ${formattedCode.length} characters`
            );

            // Check if we should write the file back
            try {
                console.error(`[processFileContent] Writing to file: ${filePath}`);

                // Ensure the directory exists before writing the file
                const dirPath = path.dirname(filePath);
                console.error(`[processFileContent] Creating directory: ${dirPath}`);
                await fs.mkdir(dirPath, { recursive: true });

                await fs.writeFile(filePath, formattedCode, 'utf-8');
                console.error(`✅ Successfully updated ${filePath}`);
            } catch (writeError) {
                console.error(`⚠️  Could not write to file ${filePath}:`, writeError);
                console.error('Returning modified code without writing to disk.');
            }

            return { modifiedCode: formattedCode, suggestions };
        } catch (formatError) {
            console.error(
                `❌ Error during code generation or formatting for ${filePath}:`,
                formatError
            );
            throw formatError;
        }
    }

    console.error(`No changes were made to ${filePath}`);
    return { modifiedCode: fileContent, suggestions };
}
