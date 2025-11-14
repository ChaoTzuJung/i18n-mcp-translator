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

/**
 * File path context for intelligent key generation
 */
export interface PathContext {
    /** Namespace: editor, client, ugc, or common */
    namespace: 'editor' | 'client' | 'ugc' | 'common';
    /** Module name (e.g., 'aiWebGame', 'prize', 'checkIn') */
    module: string;
    /** Component name (e.g., 'gameConfig', 'settingPanel') */
    component: string;
    /** Additional path segments */
    subpath: string[];
    /** Original relative path */
    relativePath: string;
}

/**
 * Element context from code analysis
 */
export interface ElementContext {
    /** Element type inferred from code */
    type: 'button' | 'title' | 'label' | 'placeholder' | 'tooltip' | 'error' | 'message' | 'heading' | 'description';
    /** Parent component or element */
    parent: string;
    /** Detected attributes */
    attributes: Record<string, string>;
}

/**
 * Complete context for key generation
 */
export interface KeyGenerationContext {
    /** File path context */
    pathContext: PathContext;
    /** Element context from code */
    elementContext: ElementContext;
    /** Original text to translate */
    text: string;
    /** Code context (surrounding code) */
    codeContext: string;
}
