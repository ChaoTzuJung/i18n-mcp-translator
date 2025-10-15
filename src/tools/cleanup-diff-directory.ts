/**
 * Cleanup diff directory tool for MCP server
 * Removes diff directory and all its contents after translation merge
 */

import { z } from 'zod';
import fs from 'fs/promises';
import { existsSync, readdirSync } from 'fs';
import path from 'path';
import { type ServerConfig } from '../types/config.js';
import { type TranslationConfig } from '../types/i18n.js';

/**
 * Clean up diff directory and all its contents
 */
export async function cleanupDiffDirectory(
    diffDir: string, 
    dryRun: boolean = false,
    projectRoot?: string
): Promise<{
    success: boolean;
    message: string;
    filesRemoved: number;
}> {
    try {
        // Resolve path relative to project root if provided
        const resolvedDiffDir = path.isAbsolute(diffDir) 
            ? diffDir 
            : path.resolve(projectRoot || process.cwd(), diffDir);

        if (!existsSync(resolvedDiffDir)) {
            return {
                success: true,
                message: `Directory ${resolvedDiffDir} does not exist, no cleanup needed`,
                filesRemoved: 0
            };
        }

        const files = readdirSync(resolvedDiffDir);
        const fileCount = files.length;
        
        console.error(`📁 Found diff directory: ${resolvedDiffDir}`);
        console.error(`📊 Files to remove: ${fileCount}`);

        if (fileCount === 0) {
            console.error(`📁 Directory is already empty`);
            if (!dryRun) {
                await fs.rmdir(resolvedDiffDir);
                console.error(`🗑️  Removed empty directory: ${resolvedDiffDir}`);
            } else {
                console.error(`🗑️  DRY RUN: Would remove empty directory: ${resolvedDiffDir}`);
            }
            return {
                success: true,
                message: `Empty directory ${dryRun ? 'would be' : 'was'} removed`,
                filesRemoved: 0
            };
        }

        if (dryRun) {
            console.error(`\n🔍 DRY RUN MODE - Preview of files to be removed:`);
            files.forEach((file, index) => {
                console.error(`  ${index + 1}. ${file}`);
            });
            console.error(`🗑️  DRY RUN: Would remove ${fileCount} files and directory ${resolvedDiffDir}`);
            
            return {
                success: true,
                message: `DRY RUN: Would remove ${fileCount} files and directory`,
                filesRemoved: fileCount
            };
        }

        // Remove all files in the directory
        console.error(`\n🧹 Removing files...`);
        for (const file of files) {
            const filePath = path.join(resolvedDiffDir, file);
            await fs.unlink(filePath);
            console.error(`🗑️  Removed file: ${file}`);
        }

        // Remove the directory itself
        await fs.rmdir(resolvedDiffDir);
        console.error(`🗑️  Removed directory: ${resolvedDiffDir}`);

        return {
            success: true,
            message: `Successfully removed ${fileCount} files and directory`,
            filesRemoved: fileCount
        };

    } catch (error) {
        const errorMessage = `Error cleaning up directory: ${(error as Error).message}`;
        console.error(`❌ ${errorMessage}`);
        return {
            success: false,
            message: errorMessage,
            filesRemoved: 0
        };
    }
}

/**
 * Handle cleanup diff directory tool
 */
export async function handleCleanupDiffDirectory({
    diffDir,
    dryRun = false,
    projectRoot
}: {
    diffDir: string;
    dryRun?: boolean;
    projectRoot?: string;
}) {
    try {
        if (dryRun) {
            console.error('🔍 DRY RUN MODE - No files will be removed\n');
        }

        const result = await cleanupDiffDirectory(diffDir, dryRun, projectRoot);

        if (result.success) {
            console.error(`\n✅ ${result.message}`);
            if (result.filesRemoved > 0 && !dryRun) {
                console.error('💡 Tip: Diff directory has been cleaned up successfully');
            }
        }

        return result;

    } catch (error) {
        console.error(`❌ Error: ${(error as Error).message}`);
        throw error;
    }
}

/**
 * Setup the cleanup diff directory tool
 */
export function setupCleanupDiffDirectoryTool(
    server: any,
    _config: ServerConfig,
    _translationConfig: TranslationConfig
) {
    server.tool(
        'cleanup_diff_directory',
        'Clean up (remove) diff directory and all its contents after translation merge',
        {
            diffDir: z.string().describe('Path to the diff directory to be removed (e.g., "src/assets/locale/diff")'),
            dryRun: z.boolean().default(false).describe('Preview mode - show what would be removed without actually deleting'),
            projectRoot: z.string().optional().describe('Project root for path resolution (defaults to current working directory)')
        },
        handleCleanupDiffDirectory
    );
}