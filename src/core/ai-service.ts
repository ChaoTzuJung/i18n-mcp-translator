/**
 * AI service for translation and key generation
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { type AiSuggestion, type TranslationConfig } from '../types/i18n.js';
import { type ServerConfig } from '../types/config.js';
import { LangManager } from './lang-manager.js';

export class AiService {
    private model: any;
    private config: TranslationConfig;
    private langManager: LangManager;

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

    async getAiSuggestions(text: string, context: string): Promise<AiSuggestion | null> {
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
