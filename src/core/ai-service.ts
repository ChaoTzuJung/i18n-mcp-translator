/**
 * AI service for translation and key generation
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { type AiSuggestion, type TranslationConfig } from '../types/i18n.js';
import { type ServerConfig } from '../types/config.js';

export class AiService {
    private model: any;
    private config: TranslationConfig;

    constructor(serverConfig: ServerConfig, translationConfig: TranslationConfig) {
        const apiKey = serverConfig.apiKey || process.env.GOOGLE_AI_API_KEY;
        if (!apiKey) {
            throw new Error('GOOGLE_AI_API_KEY is not set');
        }

        const genAI = new GoogleGenerativeAI(apiKey.trim());
        this.model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        // 直接使用傳入的設定
        this.config = translationConfig;
    }

    async getAiSuggestions(text: string, context: string): Promise<AiSuggestion | null> {
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
      
          **Input:**
          - Original Text: "${text}"
          - Source Language: "${this.config.sourceLanguage}"
          - Target Languages: ${JSON.stringify(this.config.targetLanguages)}
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
