/**
 * MCP tool definitions for the translation server
 */

import { z } from 'zod';
import { setupTranslateFileTool } from '../tools/translate-file.js';
import { 
    handleEnhancedTranslateFile, 
    handleBatchTranslateFiles,
    setGlobalConfig
} from '../tools/enhanced-translate-file.js';
import { setupMergeTranslationsTool } from '../tools/merge-translations.js';
import { setupCleanupDiffDirectoryTool } from '../tools/cleanup-diff-directory.js';
import { setupGenerateLocaleDiffTool } from '../tools/generate-locale-diff.js';
import { setupGitCommitPushTool } from '../tools/git-commit-push.js';
import { type ServerConfig } from '../types/config.js';
import { type TranslationConfig } from '../types/i18n.js';

export class MCPTools {
    constructor(
        private readonly config: Required<ServerConfig>,
        private readonly translationConfig: TranslationConfig,
        private readonly refresh?: () => Promise<void>
    ) {}

    /**
     * Register all tools with the MCP server using correct SDK format
     */
    registerTools(server: any): void {
        const refreshedTool = (name: string, description: string, schema: any, handler: any) => {
            const wrappedHandler = async (args: any) => {
                if (this.refresh) {
                    await this.refresh();
                }
                return handler(args);
            };
            server.tool(name, description, schema, wrappedHandler);
        };

        const refreshedServer = { ...server, tool: refreshedTool };

        // Set global config for enhanced translation tools
        setGlobalConfig(this.config, this.translationConfig);

        // Register original translate-file tool
        setupTranslateFileTool(refreshedServer, this.config, this.translationConfig);
        
        // Register merge translations tool
        setupMergeTranslationsTool(refreshedServer, this.config, this.translationConfig);
        
        // Register cleanup diff directory tool
        setupCleanupDiffDirectoryTool(refreshedServer, this.config, this.translationConfig);
        
        // Register generate locale diff tool (A1 functionality)
        setupGenerateLocaleDiffTool(refreshedServer, this.config, this.translationConfig);
        
        // Register git commit push tool
        setupGitCommitPushTool(refreshedServer, this.config, this.translationConfig);
        
        // Register enhanced translation tools using Zod schema format (matching original tools)
        server.tool(
            'enhanced_translate_file',
            'Enhanced file translation with intelligent caching and optimization',
            {
                file_path: z.string().describe('Path to the file to translate'),
                use_cache: z.boolean().default(true).describe('Whether to use cache for optimization'),
                force_refresh: z.boolean().default(false).describe('Force refresh even if cached'),
                cache_dir: z.string().default('.translation-cache').describe('Cache directory path'),
                progress_callback: z.boolean().default(false).describe('Enable progress callbacks'),
                batch_mode: z.boolean().default(false).describe('Enable batch mode optimizations')
            },
            handleEnhancedTranslateFile
        );
        
        server.tool(
            'batch_translate_files',
            'Batch translate multiple files with parallel processing and intelligent caching',
            {
                file_paths: z.array(z.string()).optional().describe('Array of file paths to translate'),
                src_dir: z.string().optional().describe('Source directory for scanning'),
                file_patterns: z.array(z.string()).default(['**/*.{js,ts,jsx,tsx}']).describe('File patterns to scan'),
                max_concurrency: z.number().default(3).describe('Maximum concurrent translations'),
                cache_dir: z.string().default('.translation-cache').describe('Cache directory path'),
                use_cache: z.boolean().default(true).describe('Whether to use cache'),
                force_refresh: z.boolean().default(false).describe('Force refresh all files'),
                progress_updates: z.boolean().default(true).describe('Show progress updates')
            },
            handleBatchTranslateFiles
        );
    }
}
