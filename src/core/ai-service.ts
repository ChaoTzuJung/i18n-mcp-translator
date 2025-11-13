/**
 * AI service for translation and key generation
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { type AiSuggestion, type TranslationConfig, type PathContext, type ElementContext } from '../types/i18n.js';
import { type ServerConfig } from '../types/config.js';
import { LangManager } from './lang-manager.js';
import path from 'path';

export class AiService {
    private model: any;
    private config: TranslationConfig;
    private langManager: LangManager;
    private projectRoot: string;

    constructor(serverConfig: ServerConfig, translationConfig: TranslationConfig) {
        const apiKey = serverConfig.apiKey || process.env.GOOGLE_AI_API_KEY;
        if (!apiKey) {
            throw new Error('GOOGLE_AI_API_KEY is not set');
        }

        const genAI = new GoogleGenerativeAI(apiKey.trim());
        this.model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        // 直接使用傳入的設定
        this.config = translationConfig;
        this.langManager = new LangManager(serverConfig, translationConfig);
        this.projectRoot = serverConfig.projectRoot || process.cwd();
    }

    private async searchExistingTranslations(text: string): Promise<{ key: string; translations: Record<string, string> } | null> {
        try {
            const langData = await this.langManager.readOrCreateLangFile();

            // Search through all languages and their translations
            for (const [langCode, langObj] of Object.entries(langData)) {
                if (!langObj || typeof langObj !== 'object') continue;

                // Handle nested structure (with "translation" key)
                const translationsObj = langObj.translation || langObj;
                if (typeof translationsObj !== 'object') continue;

                // Search for the text in any translation value
                for (const [key, value] of Object.entries(translationsObj)) {
                    if (typeof value === 'string' && value.trim() === text.trim()) {
                        // Found a match! Collect all translations for this key
                        const existingTranslations: Record<string, string> = {};

                        // Collect translations from all languages for this key
                        for (const [otherLangCode, otherLangObj] of Object.entries(langData)) {
                            if (!otherLangObj || typeof otherLangObj !== 'object') continue;
                            const otherTranslationsObj = otherLangObj.translation || otherLangObj;
                            if (typeof otherTranslationsObj === 'object' && otherTranslationsObj[key]) {
                                existingTranslations[otherLangCode] = otherTranslationsObj[key];
                            }
                        }

                        return { key, translations: existingTranslations };
                    }
                }
            }

            return null;
        } catch (error) {
            console.error('Error searching existing translations:', error);
            return null;
        }
    }

    /**
     * Convert string to camelCase
     */
    private toCamelCase(str: string): string {
        return str
            .replace(/[-_](.)/g, (_, char) => char.toUpperCase())
            .replace(/^(.)/, (_, char) => char.toLowerCase());
    }

    /**
     * Analyze file path to extract namespace, module, and component context
     */
    private analyzeFilePath(filePath: string): PathContext {
        const relativePath = path.relative(this.projectRoot, filePath);
        const segments = relativePath.split(path.sep).filter((s: string) => s && s !== '.');

        // Default context
        let namespace: PathContext['namespace'] = 'common';
        let module = '';
        let component = '';
        let subpath: string[] = [];
        let startIdx = 0;

        // Determine namespace from path
        if (segments.includes('editor')) {
            namespace = 'editor';
            startIdx = segments.indexOf('editor') + 1;
        } else if (segments.includes('client')) {
            namespace = 'client';
            startIdx = segments.indexOf('client') + 1;
        } else if (segments.includes('ugc')) {
            namespace = 'ugc';
            startIdx = segments.indexOf('ugc') + 1;
        } else if (segments.includes('components')) {
            namespace = 'common';
            startIdx = segments.indexOf('components') + 1;
        } else if (segments.includes('src')) {
            startIdx = segments.indexOf('src') + 1;
        }

        // Extract module from game_xxx or feature directories
        let componentStartIdx = startIdx;
        for (let i = startIdx; i < segments.length; i++) {
            const segment = segments[i];

            // Check for game types (game_xxx)
            if (segment.startsWith('game_')) {
                module = segment.replace('game_', '');
                componentStartIdx = i + 1;
                break;
            }

            // Check for known feature modules
            const knownModules = [
                'prize', 'qualify', 'task', 'mgm', 'achievement',
                'point', 'rewards', 'collected', 'login', 'fever_form',
                'api', 'hooks', 'utils', 'config', 'styles', 'locale'
            ];
            if (knownModules.includes(segment)) {
                module = segment;
                componentStartIdx = i + 1;
                break;
            }

            // Check for components directory
            if (segment === 'components' && i > startIdx) {
                componentStartIdx = i + 1;
                break;
            }
        }

        // Extract component and subpath
        const remainingSegments = segments.slice(componentStartIdx);
        if (remainingSegments.length > 0) {
            component = remainingSegments[0];
            // Filter out file names and index files
            subpath = remainingSegments.slice(1).filter((s: string) =>
                !s.endsWith('.js') &&
                !s.endsWith('.jsx') &&
                !s.endsWith('.ts') &&
                !s.endsWith('.tsx') &&
                s !== 'index'
            );
        }

        return {
            namespace,
            module: this.toCamelCase(module),
            component: this.toCamelCase(component),
            subpath: subpath.map(s => this.toCamelCase(s)),
            relativePath
        };
    }

    /**
     * Detect element context from code snippet
     */
    private detectElementContext(codeContext: string): ElementContext {
        const code = codeContext.toLowerCase();

        // Button detection
        if (code.includes('<button') || code.includes('<button>') ||
            code.includes('onclick=') || code.includes('onclick:') ||
            code.includes('variant="contained"') || code.includes('variant="outlined"')) {
            return { type: 'button', parent: '', attributes: {} };
        }

        // Title/Heading detection
        if (code.includes('<h1') || code.includes('<h2') || code.includes('<h3') ||
            code.includes('<h4') || code.includes('<h5') || code.includes('<h6') ||
            code.includes('variant="h1"') || code.includes('variant="h2"') ||
            code.includes('<title') || code.includes('variant="title"')) {
            return { type: 'title', parent: '', attributes: {} };
        }

        // Placeholder detection
        if (code.includes('placeholder=') || code.includes('placeholder:') ||
            code.includes('placeholder={')) {
            return { type: 'placeholder', parent: '', attributes: {} };
        }

        // Tooltip detection
        if (code.includes('tooltip=') || code.includes('tooltip:') ||
            code.includes('<tooltip') || code.includes('title=')) {
            return { type: 'tooltip', parent: '', attributes: {} };
        }

        // Error message detection
        if (code.includes('error') || code.includes('invalid') ||
            code.includes('errormessage') || code.includes('helpertext') ||
            code.includes('variant="error"')) {
            return { type: 'error', parent: '', attributes: {} };
        }

        // Description detection
        if (code.includes('description') || code.includes('subtitle') ||
            code.includes('variant="body2"') || code.includes('variant="subtitle"')) {
            return { type: 'description', parent: '', attributes: {} };
        }

        // Default to label for generic text
        return { type: 'label', parent: '', attributes: {} };
    }

    /**
     * Construct intelligent i18n key based on context
     */
    private constructI18nKey(
        pathContext: PathContext,
        elementContext: ElementContext,
        semanticName: string
    ): string {
        const parts: string[] = [];

        // 1. Namespace (required)
        parts.push(pathContext.namespace);

        // 2. Module (if present and meaningful)
        if (pathContext.module && pathContext.module !== 'components') {
            parts.push(pathContext.module);
        }

        // 3. Component (if present and meaningful)
        if (pathContext.component && pathContext.component !== 'index') {
            parts.push(pathContext.component);
        }

        // 4. Subpath (only if present and depth allows, max 1-2 subpath segments)
        if (pathContext.subpath.length > 0 && parts.length < 4) {
            const allowedSubpathDepth = Math.min(pathContext.subpath.length, 5 - parts.length - 1);
            parts.push(...pathContext.subpath.slice(0, allowedSubpathDepth));
        }

        // 5. Semantic name + element type
        // For generic element types (label, message), just use semantic name
        // For specific types (button, placeholder, tooltip, error), append the type
        const elementTypeNeedsSuffix = ['placeholder', 'tooltip', 'error', 'description'];

        if (elementTypeNeedsSuffix.includes(elementContext.type)) {
            // If semantic name already contains the element type, don't duplicate
            const lowerSemanticName = semanticName.toLowerCase();
            const lowerElementType = elementContext.type.toLowerCase();

            if (lowerSemanticName.includes(lowerElementType)) {
                parts.push(semanticName);
            } else {
                parts.push(`${semanticName}.${elementContext.type}`);
            }
        } else {
            parts.push(semanticName);
        }

        // Ensure maximum depth of 5 levels
        if (parts.length > 5) {
            // Keep namespace, module, and last 3 parts
            const namespace = parts[0];
            const module = parts[1];
            const lastParts = parts.slice(-3);
            parts.splice(0, parts.length, namespace, module, ...lastParts);
        }

        return parts.join('.');
    }

    async getAiSuggestions(text: string, context: string, filePath?: string): Promise<AiSuggestion | null> {
        // First, check if this text already exists in our translation files
        const existingTranslation = await this.searchExistingTranslations(text);
        if (existingTranslation) {
            console.error(`  -> Found existing translation for "${text}" with key: "${existingTranslation.key}"`);
            return {
                i18nKey: existingTranslation.key,
                translations: existingTranslation.translations,
                originalText: text
            };
        }

        // Analyze file path and code context for intelligent key generation
        let pathContext: PathContext | null = null;
        let elementContext: ElementContext | null = null;
        let suggestedKeyStructure = '';

        if (filePath) {
            pathContext = this.analyzeFilePath(filePath);
            elementContext = this.detectElementContext(context);

            // Generate a suggested key structure for AI guidance
            suggestedKeyStructure = this.constructI18nKey(pathContext, elementContext, 'SEMANTIC_NAME');

            console.error(`  -> Path context: ${pathContext.namespace}.${pathContext.module}.${pathContext.component}`);
            console.error(`  -> Element type: ${elementContext.type}`);
            console.error(`  -> Suggested key pattern: ${suggestedKeyStructure}`);
        }

        // Dynamically build translations schema based on configured target languages
        const translationsSchema: Record<string, string> = {};
        for (const langCode of this.config.targetLanguages) {
            translationsSchema[langCode] = 'string';
        }

        const jsonOutputSchema = {
            i18nKey: 'string',
            translations: translationsSchema,
            originalText: 'string'
        };

        // Build enhanced prompt with path context
        let contextInfo = '';
        let keyGenerationRules = '';

        if (pathContext && elementContext) {
            contextInfo = `
          **File Context Analysis:**
          - File Path: ${pathContext.relativePath}
          - Namespace: ${pathContext.namespace} (editor/client/ugc/common)
          - Module: ${pathContext.module || 'N/A'}
          - Component: ${pathContext.component || 'N/A'}
          - Element Type: ${elementContext.type}
          - Suggested Key Pattern: ${suggestedKeyStructure}
            `;

            keyGenerationRules = `
          **Enhanced Key Generation Rules:**

          1. **Follow the Suggested Pattern:**
             - Your key should follow this structure: ${suggestedKeyStructure}
             - Replace SEMANTIC_NAME with a SHORT, descriptive English name for the text content
             - Use camelCase for the semantic part (e.g., saveButton, uploadImage, confirmDelete)

          2. **Namespace Rules:**
             - Start with namespace: ${pathContext.namespace}
             - For common UI elements (Save, Cancel, Close, Delete), consider: common.button.{action}
             - Only use common namespace if it's truly reusable across the entire application

          3. **Semantic Naming (CRITICAL):**
             - Focus on MEANING, not literal translation
             - Examples:
               * "關閉" → "close" (NOT "guan_bi")
               * "保存設定" → "saveSettings" (NOT "save_setting")
               * "上傳圖片" → "uploadImage" (NOT "upload_image")
               * "確認刪除" → "confirmDelete" (NOT "confirm_delete")
             - Keep it SHORT and CLEAR
             - Use camelCase for multi-word semantic names

          4. **Element Type Handling:**
             - For buttons: semantic name is usually sufficient (e.g., "save", "cancel")
             - For placeholders: append .placeholder if not in semantic name
             - For tooltips: append .tooltip if not in semantic name
             - For errors: append .error if not in semantic name
             - For generic text (label/message): just use semantic name

          5. **Maximum Depth:**
             - Keep keys to 4-5 levels maximum
             - Format: {namespace}.{module}.{component}.{semanticName}[.elementType]
            `;
        } else {
            // Fallback to original simple rules if no file path provided
            keyGenerationRules = `
          **Rules for Key Generation:**
          - The key should be in English and use camelCase (e.g., 'component.generateMindMapProposal')
          - Infer the context from the provided code snippet
          - If the text is in a <button>, consider using a descriptive action name
          - If the text is in a <h1>, <h2>, etc., use 'title' suffix
          - For form input placeholder, append '.placeholder'
          - Multi-level nesting is acceptable (key1.key2.key3)
          - The key should be short, descriptive, and semantic
            `;
        }

        const prompt = `
          You are an expert i18n (internationalization) assistant for a React project.
          Your task is to perform two actions:
          1. Generate a structured, context-aware i18n key for the given text
          2. Translate the original text into the specified target languages
${contextInfo}
${keyGenerationRules}
          **CRITICAL: File Formatting Boundaries - DO NOT:**
          - Remove comments from source code
          - Remove line breaks or whitespace
          - Fix linting issues or code style
          - Modify file formatting or structure beyond the actual translation work
          - Change indentation, quote styles, or spacing in existing code
          - Your ONLY responsibility is i18n key generation and translation

          **CRITICAL JSON Formatting Requirements:**
          - NEVER modify the JSON formatting or structure beyond the actual translations
          - Do NOT change indentation, quote styles, or spacing
          - Only provide the requested content (i18nKey, translations, originalText)
          - Do NOT add extra formatting, comments, or modifications to the JSON
          - Your output will be processed by an automated system that requires exact JSON format

          **Input:**
          - Original Text: "${text}"
          - Source Language: "${this.config.sourceLanguage}"
          - Target Languages: ${JSON.stringify(this.config.targetLanguages)}
          - Code Context:
          \`\`\`jsx
          ${context}
          \`\`\`

          **Output:**
          Provide ONLY valid JSON matching this exact schema with no additional text or explanations:
          \`\`\`json
          ${JSON.stringify(jsonOutputSchema, null, 2)}
          \`\`\`

          **Examples of Good Keys (based on your file context):**
          ${pathContext ? `
          - For button in ${pathContext.namespace}: ${pathContext.namespace}.${pathContext.module || 'feature'}.${pathContext.component || 'component'}.actionName
          - For title: ${pathContext.namespace}.${pathContext.module || 'feature'}.${pathContext.component || 'component'}.title
          - For error message: ${pathContext.namespace}.${pathContext.module || 'feature'}.${pathContext.component || 'component'}.errorType.error
          ` : ''}
          `;

        try {
            const result = await this.model.generateContent(prompt);
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
}
