/**
 * Main MCP server implementation for i18n translation management
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { resolve } from 'path';
import { MCPTools } from './mcp-tools.js';
import { ServerConfig } from '../types/config.js';
import { isAbsolutePath } from '../utils/path-resolver.js';
import { TranslationConfigService } from '../core/translation-config-service.js';
import { TranslationConfig } from '../types/i18n.js';

/**
 * High-level MCP server for translation management
 */
export class TranslationMCPServer {
    private readonly server: McpServer;
    private readonly config: Required<ServerConfig>;
    private readonly resolvedPaths: {
        translationDir: string;
        srcDir?: string;
        generateTypes?: string;
    };
    private readonly translationConfigService: TranslationConfigService;
    private translationConfig: TranslationConfig | null = null;
    private isInitialized = false;

    /**
     * Creates a new TranslationMCPServer instance
     * @param config - Server configuration
     */
    constructor(config: ServerConfig) {
        // 確定並取得一個專案的「絕對根目錄路徑」(absolute project root path)
        const projectRoot = config.projectRoot
            ? isAbsolutePath(config.projectRoot) // config.projectRoot 是一個絕對路徑
                ? config.projectRoot // 就直接使用它
                : resolve(process.cwd(), config.projectRoot) // config.projectRoot 是相對路徑，把「當前執行目錄」和「相對路徑」結合起來，產生一個完整的絕對路徑。
            : process.cwd(); // 當前 Node.js 程式執行的目錄作為專案根目錄

        const defaults = {
            baseLanguage: 'zh-TW', // Updated default to Traditional Chinese
            debug: false,
            srcDir: undefined,
            targetLanguages: ['en-US'] // Default target languages
        };

        // Ensure we have a default translationDir if not provided
        const translationDir = config.translationDir || './locales';

        // Store original config
        this.config = {
            ...defaults,
            ...config,
            projectRoot,
            translationDir // Store the original value for reference
        } as Required<ServerConfig>;

        // Resolve paths ensuring we handle absolute paths properly
        const resolvedTranslationDir = isAbsolutePath(translationDir)
            ? translationDir // Already absolute, use as-is
            : resolve(projectRoot, translationDir); // Relative, make absolute

        this.resolvedPaths = {
            translationDir: resolvedTranslationDir,
            srcDir: config.srcDir
                ? isAbsolutePath(config.srcDir)
                    ? config.srcDir
                    : resolve(projectRoot, config.srcDir)
                : undefined
        };

        // Initialize translation config service
        this.translationConfigService = new TranslationConfigService();

        // Initialize MCP server
        this.server = new McpServer(
            {
                name: this.config.name,
                version: this.config.version
            },
            {
                capabilities: {
                    tools: {},
                    resources: {},
                    prompts: {}
                }
            }
        );

        this.setupResources();
    }

    /**
     * Initialize translation configuration asynchronously
     */
    private async initialize(): Promise<void> {
        if (this.isInitialized) {
            return;
        }

        console.error('[TranslationMCPServer] Initializing translation configuration...');

        try {
            // Build translation config using the service
            this.translationConfig = await this.translationConfigService.buildTranslationConfig(
                this.config
            );

            // Setup tools after config is ready
            this.setupTools();

            this.isInitialized = true;
            console.error(
                '[TranslationMCPServer] Translation configuration initialized successfully.'
            );
        } catch (error) {
            console.error(
                '[TranslationMCPServer] Failed to initialize translation configuration:',
                error
            );

            // Create fallback configuration
            this.translationConfig = {
                sourceLanguage: this.config.baseLanguage,
                targetLanguages: this.config.targetLanguages,
                langMap: {},
                availableLanguages: []
            };

            this.setupTools();
            this.isInitialized = true;

            console.warn(
                '[TranslationMCPServer] Using fallback configuration due to initialization failure.'
            );
        }
    }

    /**
     * Setup MCP tools (called after translation config is ready)
     */
    private setupTools(): void {
        if (!this.translationConfig) {
            console.warn(
                '[TranslationMCPServer] Cannot setup tools: translation config not available.'
            );
            return;
        }

        // Create config with resolved paths for tools
        const configWithResolvedPaths = {
            ...this.config,
            translationDir: this.resolvedPaths.translationDir,
            srcDir: this.resolvedPaths.srcDir || this.config.srcDir
        } as Required<ServerConfig>;

        const mcpTools = new MCPTools(
            configWithResolvedPaths,
            this.translationConfig,
            // Provide refresh callback for tools that need updated config
            async () => {
                await this.refreshTranslationConfig();
            }
        );

        // Register each tool with the correct MCP SDK format
        mcpTools.registerTools(this.server);

        console.error('[TranslationMCPServer] MCP tools registered successfully.');
    }

    /**
     * Refresh translation configuration
     */
    private async refreshTranslationConfig(): Promise<void> {
        console.error('[TranslationMCPServer] Refreshing translation configuration...');

        try {
            this.translationConfig = await this.translationConfigService.buildTranslationConfig(
                this.config
            );
            console.error(
                '[TranslationMCPServer] Translation configuration refreshed successfully.'
            );
        } catch (error) {
            console.error(
                '[TranslationMCPServer] Failed to refresh translation configuration:',
                error
            );
        }
    }

    /**
     * Setup MCP resources
     */
    private setupResources(): void {
        // TODO: Fix MCP SDK API for resources
        // For now, skip resource setup to focus on core translation functionality
        console.error(
            '[TranslationMCPServer] Resource setup skipped - will be implemented after API clarification.'
        );
    }

    /**
     * Start the MCP server with STDIO transport
     */
    async start(): Promise<void> {
        try {
            // Initialize translation configuration first
            await this.initialize();

            // Connect to STDIO transport
            const transport = new StdioServerTransport();
            await this.server.connect(transport);
        } catch (error) {
            console.error('Error starting MCP server:', error);
            process.exit(1);
        }
    }

    /**
     * Stop the server and cleanup resources
     */
    async stop(): Promise<void> {
        // No cleanup needed for file-based language discovery
        console.error('[MCP Server] Server stopped.');
    }
}
