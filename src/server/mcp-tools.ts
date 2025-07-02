/**
 * MCP tool definitions for the translation server
 */

import { setupTranslateFileTool } from '../tools/translate-file.js';
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

        setupTranslateFileTool(refreshedServer, this.config, this.translationConfig);
    }
}
