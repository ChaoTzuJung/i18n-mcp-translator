/**
 * i18n related type definitions
 */

export interface AiSuggestion {
    i18nKey: string;
    // { 語系: 翻譯後的文字 }
    translations: Record<string, string>;
    originalText: string;
}

export interface ProcessFileResult {
    modifiedCode: string;
    suggestions: AiSuggestion[];
}

export interface LanguageInfo {
    code: string;
    english_name: string;
    local_name: string;
    locale: string;
    region: string;
}

export interface TranslationConfig {
    sourceLanguage: string;
    targetLanguages: string[];
    // { 語系代碼: 完整語系資料 }
    langMap: Record<string, LanguageInfo>;
    availableLanguages: LanguageInfo[];
}
