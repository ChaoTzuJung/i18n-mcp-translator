#!/usr/bin/env node

/**
 * i18n MCP Server - Entry point for MCP clients
 */

import 'dotenv/config'; // Load environment variables from .env file
import { TranslationMCPServer } from './server/mcp-server.js';
import { type ServerConfig } from './types/config.js';

/**
 * Main function - starts MCP server with configuration from args/env
 */
async function main(): Promise<void> {
    // Merge environment and argument configuration
    const envConfig = loadEnvConfig();
    const argsConfig = parseArgs();

    const config: ServerConfig = {
        name: 'i18n-mcp-translator',
        version: '1.0.0',
        debug: false,
        baseLanguage: 'zh-TW',
        translationDir: './locales',
        ...envConfig,
        ...argsConfig
    } as ServerConfig;

    if (!config.translationDir) {
        console.error(
            'Error: Translation directory is required. Use --dir or I18N_MCP_TRANSLATION_DIR'
        );
        process.exit(1);
    }

    const server = new TranslationMCPServer(config);
    await server.start();
    console.error('🤖 i18n MCP Server is running on stdio...');
}

main().catch(error => {
    console.error('Fatal error in main():', error);
    process.exit(1);
});

/**
 * Parse command line arguments for MCP client usage
 */
function parseArgs(): Partial<ServerConfig> {
    const args = process.argv.slice(2);
    const config: Partial<ServerConfig> = {};

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        const nextArg = args[i + 1];

        switch (arg) {
            case '--name':
            case '-n':
                if (nextArg && !nextArg.startsWith('-')) {
                    config.name = nextArg;
                    i++;
                }
                break;

            case '--version':
            case '-v':
                if (nextArg && !nextArg.startsWith('-')) {
                    config.version = nextArg;
                    i++;
                }
                break;

            case '--debug':
                config.debug = true;
                break;

            case '--api-key':
                if (nextArg && !nextArg.startsWith('-')) {
                    config.apiKey = nextArg;
                    i++;
                }
                break;

            case '--base-language':
            case '-b':
                if (nextArg && !nextArg.startsWith('-')) {
                    config.baseLanguage = nextArg;
                    i++;
                }
                break;

            case '--target-languages':
            case '-t':
                if (nextArg && !nextArg.startsWith('-')) {
                    config.targetLanguages = nextArg.split(',').map(lang => lang.trim());
                    i++;
                }
                break;

            case '--translation-file':
                if (nextArg && !nextArg.startsWith('-')) {
                    config.translationFileName = nextArg;
                    i++;
                }
                break;

            case '--dir':
            case '-d':
                if (nextArg && !nextArg.startsWith('-')) {
                    config.translationDir = nextArg;
                    i++;
                }
                break;

            case '--src-dir':
                if (nextArg && !nextArg.startsWith('-')) {
                    config.srcDir = nextArg;
                    i++;
                }
                break;

            case '--project-root':
                if (nextArg && !nextArg.startsWith('-')) {
                    config.projectRoot = nextArg;
                    i++;
                }
                break;

            default:
                // Assume it's a directory path if no flag is provided
                if (arg && !arg.startsWith('-') && !config.translationDir) {
                    config.translationDir = arg;
                }
                break;
        }
    }

    return config;
}

/**
 * Load configuration from environment variables
 */
function loadEnvConfig(): Partial<ServerConfig> {
    const config: Partial<ServerConfig> = {};

    if (process.env.GOOGLE_AI_API_KEY) {
        config.apiKey = process.env.GOOGLE_AI_API_KEY;
    }

    if (process.env.I18N_MCP_BASE_LANGUAGE) {
        config.baseLanguage = process.env.I18N_MCP_BASE_LANGUAGE;
    }

    if (process.env.I18N_MCP_TARGET_LANGUAGES) {
        config.targetLanguages = process.env.I18N_MCP_TARGET_LANGUAGES.split(',');
    }

    if (process.env.I18N_MCP_TRANSLATION_FILE) {
        config.translationFileName = process.env.I18N_MCP_TRANSLATION_FILE;
    }

    if (process.env.I18N_MCP_TRANSLATION_DIR) {
        config.translationDir = process.env.I18N_MCP_TRANSLATION_DIR;
    }

    if (process.env.I18N_MCP_DEBUG) {
        config.debug = process.env.I18N_MCP_DEBUG.toLowerCase() === 'true';
    }

    if (process.env.I18N_MCP_SRC_DIR) {
        config.srcDir = process.env.I18N_MCP_SRC_DIR;
    }

    if (process.env.I18N_MCP_PROJECT_ROOT) {
        config.projectRoot = process.env.I18N_MCP_PROJECT_ROOT;
    }

    return config;
}
