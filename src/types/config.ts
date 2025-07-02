/**
 * Server configuration
 */
export interface ServerConfig {
    /** Server name */
    name: string;
    /** Server version */
    version: string;
    /** Translation files directory */
    translationDir: string;
    /** Base language for structure template */
    baseLanguage?: string;
    /** Target languages for translation */
    targetLanguages?: string[];
    /** Enable debug mode */
    debug?: boolean;
    /** Source code directory for analysis */
    srcDir?: string;
    /** Google AI API key */
    apiKey?: string;
    /** Project root for relative paths */
    projectRoot?: string;
}
