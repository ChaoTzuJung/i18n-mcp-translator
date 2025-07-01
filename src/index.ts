#!/usr/bin/env node
// Load environment variables from .env file
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import {
    processFileContent,
    readOrCreateLangFile,
    updateLangData,
    writeLangFile
} from './i18n-agent.js';

// 1. Create the MCP Server instance
const server = new McpServer({
    name: 'i18n-translator',
    version: '1.0.0',
    capabilities: {
        // We are defining a tool, not a resource
        resources: {},
        tools: {}
    }
});

// 2. Define the i18n translation tool
server.tool(
    'translate-file',
    'Scans a source code file for hardcoded Chinese text, replaces it with i18n keys, updates a local lang.json file, and returns the modified file content.',
    {
        // Define the inputs the LLM must provide
        filePath: z
            .string()
            .describe(
                "The full path of the file being processed, e.g., 'src/components/Login.jsx'"
            ),
        fileContent: z
            .string()
            .describe('The entire source code content of the file to be translated.')
    },
    async ({ filePath, fileContent }) => {
        console.error(`[i18n-tool] Received request for file: ${filePath}`);
        console.error(`[i18n-tool] Current working directory: ${process.cwd()}`);

        try {
            // Step 1: Read the existing language file once.
            const langData = await readOrCreateLangFile();

            // Step 2: Process the file content to get modified code and new translations.
            // Resolve the file path relative to the current working directory
            const __dirname = path.dirname(fileURLToPath(import.meta.url));
            // We go up one level from `build` to the project root.
            const COMPONENT_FILE_PATH = path.resolve(__dirname, '..', filePath);
            const { modifiedCode, suggestions } = await processFileContent(
                COMPONENT_FILE_PATH,
                fileContent
            );

            let summary;

            if (suggestions.length > 0) {
                // Step 3: Update the in-memory language data with all new suggestions.
                console.error(
                    `[i18n-tool] Found ${suggestions.length} new strings. Updating language file.`
                );
                for (const suggestion of suggestions) {
                    updateLangData(langData, suggestion);
                }

                // Step 4: Write the updated language file back to disk once.
                await writeLangFile(langData);

                summary = `Successfully processed ${filePath}. Found and translated ${suggestions.length} new strings. The lang.json file has been updated.`;

                // Return the summary AND the modified code.
                return {
                    content: [
                        {
                            type: 'text',
                            text: summary
                        },
                        {
                            type: 'resource',
                            resource: {
                                uri: filePath,
                                text: modifiedCode
                            }
                        }
                    ]
                };
            } else {
                summary = `Scanned ${filePath}. No new Chinese text was found to translate. ${suggestions}`;
                console.error('[i18n-tool] No new strings found.');

                // Return ONLY the summary text. Do NOT include the resource.
                return {
                    content: [
                        {
                            type: 'text',
                            text: summary
                        }
                    ]
                };
            }
        } catch (error) {
            console.error('[i18n-tool] An error occurred:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                content: [
                    {
                        type: 'text',
                        text: `An error occurred while translating the file: ${errorMessage}`
                    }
                ]
            };
        }
    }
);

// 3. Start the server
async function main() {
    // Make sure the API key is set
    if (!process.env.GOOGLE_AI_API_KEY) {
        console.error('FATAL: GOOGLE_AI_API_KEY environment variable is not set.');
        process.exit(1);
    }

    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('🤖 i18n MCP Server is running on stdio...');
}

main().catch(error => {
    console.error('Fatal error in main():', error);
    process.exit(1);
});
