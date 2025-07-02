/**
 * Add translation tool
 */

import { z } from 'zod';

/**
 * Setup the add translation tool
 */
export function setupAddTranslationsTool(server: any, config: any) {
    server.tool(
        'add_translations',
        'Add new translations with smart key generation and conflict handling',
        {
            keyPath: z
                .string()
                .optional()
                .describe('Translation key path (optional if text provided)'),
            translations: z.record(z.string(), z.any()).describe('Translations by language code'),
            text: z.string().optional().describe('Source text for key generation'),
            suggestedKey: z.string().optional().describe('Suggested key path'),
            conflictResolution: z
                .enum(['error', 'merge', 'replace'])
                .default('error')
                .describe('How to handle existing keys'),
            validateStructure: z.boolean().default(true).describe('Validate structure consistency'),
            namespace: z
                .string()
                .optional()
                .describe(
                    'Namespace for organization (e.g., "dashboard.clients" for client-related translations)'
                )
        },
        async ({}: any) => {}
    );
}
