/**
 * Sort JSON keys tool for MCP server
 * Sorts JSON object keys alphabetically in the specified files
 */

import { z } from 'zod';
import fs from 'fs/promises';
import { existsSync, readdirSync, statSync } from 'fs';
import path from 'path';
import { type ServerConfig } from '../types/config.js';
import { type TranslationConfig } from '../types/i18n.js';
import { JsonParser } from '../utils/json-parser.js';

interface SortResult {
    filePath: string;
    success: boolean;
    message: string;
    keysCountBefore?: number;
    keysCountAfter?: number;
}

/**
 * Recursively sort JSON object keys alphabetically
 * Preserves the structure but sorts all object keys at each level
 */
function sortJsonKeys(obj: any): any {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => sortJsonKeys(item));
    }

    // Sort the keys and rebuild the object
    const sorted: Record<string, any> = {};
    const keys = Object.keys(obj).sort();

    for (const key of keys) {
        sorted[key] = sortJsonKeys(obj[key]);
    }

    return sorted;
}

/**
 * Count keys in a JSON object recursively
 */
function countKeys(obj: any): number {
    if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
        return 0;
    }

    const ownKeys = Object.keys(obj).length;
    let totalKeys = ownKeys;

    for (const value of Object.values(obj)) {
        totalKeys += countKeys(value);
    }

    return totalKeys;
}

/**
 * Create a backup file with timestamp
 */
async function createBackup(filePath: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = `${filePath}.backup.${timestamp}`;
    await fs.copyFile(filePath, backupPath);
    return backupPath;
}

/**
 * Sort a single JSON file
 */
async function sortJsonFile(filePath: string): Promise<SortResult> {
    try {
        if (!existsSync(filePath)) {
            return {
                filePath,
                success: false,
                message: `File not found: ${filePath}`
            };
        }

        if (!filePath.endsWith('.json')) {
            return {
                filePath,
                success: false,
                message: `Skipping non-JSON file: ${filePath}`
            };
        }

        console.error(`📄 Processing: ${filePath}`);

        // Create backup
        const backupPath = await createBackup(filePath);
        console.error(`💾 Backup created: ${backupPath}`);

        // Parse and validate JSON
        const parseResult = await JsonParser.parseFile(filePath);
        const keysCountBefore = countKeys(parseResult.data);

        // Sort keys
        const sortedData = sortJsonKeys(parseResult.data);
        const keysCountAfter = countKeys(sortedData);

        // Write sorted JSON
        await JsonParser.writeFile(filePath, sortedData, 2);

        console.error(`✅ Successfully sorted keys in: ${filePath}`);
        console.error(`   Keys before: ${keysCountBefore}, after: ${keysCountAfter}`);

        // Remove backup on success
        await fs.unlink(backupPath);

        return {
            filePath,
            success: true,
            message: `Successfully sorted ${keysCountAfter} keys`,
            keysCountBefore,
            keysCountAfter
        };

    } catch (error) {
        const errorMessage = `Error sorting JSON keys: ${(error as Error).message}`;
        console.error(`❌ ${errorMessage}`);
        return {
            filePath,
            success: false,
            message: errorMessage
        };
    }
}

/**
 * Find all JSON files in a directory recursively
 */
function findJsonFiles(dirPath: string): string[] {
    const files: string[] = [];

    if (!existsSync(dirPath)) {
        return files;
    }

    const entries = readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
            // Recurse into subdirectories
            files.push(...findJsonFiles(fullPath));
        } else if (entry.name.endsWith('.json')) {
            files.push(fullPath);
        }
    }

    return files;
}

/**
 * Main sort JSON keys function
 */
export async function sortJsonKeysInFiles(
    targets: string | string[],
    dryRun: boolean = false,
    projectRoot?: string
): Promise<{
    success: boolean;
    message: string;
    results: SortResult[];
    successCount: number;
    totalCount: number;
}> {
    try {
        const fileList: string[] = [];
        const targetArray = Array.isArray(targets) ? targets : [targets];

        // Resolve all target paths and collect JSON files
        for (const target of targetArray) {
            const resolvedPath = path.isAbsolute(target)
                ? target
                : path.resolve(projectRoot || process.cwd(), target);

            if (!existsSync(resolvedPath)) {
                console.error(`⚠️  Path not found: ${resolvedPath}`);
                continue;
            }

            const stats = statSync(resolvedPath);
            if (stats.isDirectory()) {
                const jsonFiles = findJsonFiles(resolvedPath);
                fileList.push(...jsonFiles);
            } else if (resolvedPath.endsWith('.json')) {
                fileList.push(resolvedPath);
            }
        }

        if (fileList.length === 0) {
            return {
                success: true,
                message: 'No JSON files found to sort',
                results: [],
                successCount: 0,
                totalCount: 0
            };
        }

        // Remove duplicates and sort file paths
        const uniqueFiles = Array.from(new Set(fileList)).sort();

        console.error(`\n📊 Found ${uniqueFiles.length} JSON file(s) to process`);
        uniqueFiles.forEach((file, index) => {
            console.error(`  ${index + 1}. ${file}`);
        });

        if (dryRun) {
            console.error('\n🔍 DRY RUN MODE - No files will be modified\n');
        }

        // Process files
        const results: SortResult[] = [];
        console.error('\n🔄 Starting to process files...\n');

        for (const file of uniqueFiles) {
            if (dryRun) {
                // In dry-run mode, just parse and validate without modifying
                try {
                    const parseResult = await JsonParser.parseFile(file);
                    const keysCount = countKeys(parseResult.data);
                    console.error(`✓ DRY RUN: Would sort ${keysCount} keys in ${file}`);
                    results.push({
                        filePath: file,
                        success: true,
                        message: `DRY RUN: Would sort ${keysCount} keys`,
                        keysCountBefore: keysCount,
                        keysCountAfter: keysCount
                    });
                } catch (error) {
                    results.push({
                        filePath: file,
                        success: false,
                        message: `DRY RUN: Failed to validate - ${(error as Error).message}`
                    });
                }
            } else {
                const result = await sortJsonFile(file);
                results.push(result);
            }
            console.error();
        }

        // Summary
        const successCount = results.filter(r => r.success).length;
        const totalCount = results.length;

        console.error('═══════════════════════════════════════════════');
        console.error(`✅ Processing complete!`);
        console.error(`📊 Successfully processed: ${successCount}/${totalCount} files`);

        if (dryRun) {
            console.error('💡 This was a DRY RUN - no files were modified');
        }

        return {
            success: successCount === totalCount,
            message: successCount === totalCount
                ? `All ${totalCount} files processed successfully`
                : `${successCount}/${totalCount} files processed (see details for errors)`,
            results,
            successCount,
            totalCount
        };

    } catch (error) {
        const errorMessage = `Error in sort operation: ${(error as Error).message}`;
        console.error(`❌ ${errorMessage}`);
        return {
            success: false,
            message: errorMessage,
            results: [],
            successCount: 0,
            totalCount: 0
        };
    }
}

/**
 * Handle sort JSON keys tool
 */
export async function handleSortJsonKeys({
    targets,
    dryRun = false,
    projectRoot
}: {
    targets: string | string[];
    dryRun?: boolean;
    projectRoot?: string;
}) {
    try {
        if (dryRun) {
            console.error('🔍 DRY RUN MODE - Files will not be modified\n');
        }

        const result = await sortJsonKeysInFiles(targets, dryRun, projectRoot);

        return {
            success: result.success,
            message: result.message,
            details: {
                processedFiles: result.totalCount,
                successCount: result.successCount,
                results: result.results
            }
        };

    } catch (error) {
        console.error(`❌ Error: ${(error as Error).message}`);
        throw error;
    }
}

/**
 * Setup the sort JSON keys tool
 */
export function setupSortJsonKeysTool(
    server: any,
    _config: ServerConfig,
    _translationConfig: TranslationConfig
) {
    server.tool(
        'sort_json_keys',
        'Sort JSON object keys alphabetically. Supports single files, multiple files, or entire directories (recursive)',
        {
            targets: z.union([
                z.string().describe('Path to a JSON file or directory containing JSON files'),
                z.array(z.string()).describe('Array of paths (files or directories) to process')
            ]).describe('JSON file(s) or directory/directories to sort keys in'),
            dryRun: z.boolean().default(false).describe('Preview mode - show what would be sorted without modifying files'),
            projectRoot: z.string().optional().describe('Project root for path resolution (defaults to current working directory)')
        },
        handleSortJsonKeys
    );
}
