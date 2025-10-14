/**
 * Merge translations tool for MCP server
 * Based on batch-merge-translations.js functionality
 */

import { z } from 'zod';
import fs from 'fs/promises';
import { existsSync, readdirSync } from 'fs';
import path from 'path';
import { type ServerConfig } from '../types/config.js';
import { type TranslationConfig } from '../types/i18n.js';
import { executeGitOperations, type GitCommitOptions } from '../utils/git-operations.js';

interface TranslationFile {
    lang: string;
    filename: string;
    path: string;
}

interface MergeStats {
    newKeys: number;
    updatedKeys: number;
    unchangedKeys: number;
}

interface MergeResult {
    success: boolean;
    stats: MergeStats;
    changes: Array<{
        type: 'NEW' | 'UPDATED';
        key: string;
        originalValue?: string;
        reviewedValue: string;
    }>;
}

interface OverallStats {
    filesProcessed: number;
    filesSkipped: number;
    totalNewKeys: number;
    totalUpdatedKeys: number;
    totalUnchangedKeys: number;
    processedLanguages: string[];
}

/**
 * Load JSON file safely
 */
async function loadJsonFile(filePath: string): Promise<Record<string, any> | null> {
    try {
        if (existsSync(filePath)) {
            const content = await fs.readFile(filePath, 'utf8');
            return JSON.parse(content);
        }
    } catch (error) {
        console.warn(`Warning: Could not parse ${filePath}: ${(error as Error).message}`);
    }
    return null;
}

/**
 * Save JSON file with proper formatting
 */
async function saveJsonFile(filePath: string, data: Record<string, any>): Promise<boolean> {
    try {
        await fs.writeFile(filePath, JSON.stringify(data, null, 4) + '\n', 'utf8');
        return true;
    } catch (error) {
        console.error(`Error writing ${filePath}: ${(error as Error).message}`);
        return false;
    }
}

/**
 * Get all JSON translation files in a directory
 */
function getTranslationFiles(dirPath: string): TranslationFile[] {
    if (!existsSync(dirPath)) {
        console.warn(`Warning: Directory ${dirPath} does not exist`);
        return [];
    }

    return readdirSync(dirPath)
        .filter(file => file.endsWith('.json'))
        .map(file => ({
            lang: file.replace('.json', ''),
            filename: file,
            path: path.join(dirPath, file)
        }));
}

/**
 * Merge single language file
 */
async function mergeSingleFile(
    originalFilePath: string,
    reviewedFilePath: string,
    dryRun: boolean = false,
    verbose: boolean = false
): Promise<MergeResult> {
    const originalData = await loadJsonFile(originalFilePath);
    const reviewedData = await loadJsonFile(reviewedFilePath);

    if (!originalData) {
        throw new Error('Could not load original translations file');
    }

    if (!reviewedData) {
        throw new Error('Could not load reviewed translations file');
    }

    // Track statistics
    const stats: MergeStats = {
        newKeys: 0,
        updatedKeys: 0,
        unchangedKeys: 0
    };

    const mergedData = { ...originalData };
    const changes: MergeResult['changes'] = [];

    // Process each key in reviewed data
    for (const [key, reviewedValue] of Object.entries(reviewedData)) {
        const originalValue = originalData[key];

        if (originalValue === undefined) {
            // New key
            mergedData[key] = reviewedValue;
            stats.newKeys++;
            changes.push({
                type: 'NEW',
                key,
                reviewedValue
            });
            if (verbose) {
                console.log(`➕ NEW: "${key}"`);
                console.log(`    Value: "${reviewedValue}"`);
            }
        } else if (originalValue !== reviewedValue) {
            // Updated key
            mergedData[key] = reviewedValue;
            stats.updatedKeys++;
            changes.push({
                type: 'UPDATED',
                key,
                originalValue,
                reviewedValue
            });
            if (verbose) {
                console.log(`🔄 UPDATED: "${key}"`);
                console.log(`    Original: "${originalValue}"`);
                console.log(`    Reviewed: "${reviewedValue}"`);
            }
        } else {
            // Unchanged key
            stats.unchangedKeys++;
            if (verbose) {
                console.log(`✅ UNCHANGED: "${key}"`);
            }
        }
        if (verbose) {
            console.log();
        }
    }

    if (dryRun) {
        return { success: true, stats, changes };
    }

    if (stats.newKeys === 0 && stats.updatedKeys === 0) {
        return { success: true, stats, changes };
    }

    // Save merged file
    if (await saveJsonFile(originalFilePath, mergedData)) {
        return { success: true, stats, changes };
    } else {
        return { success: false, stats, changes };
    }
}

/**
 * Batch merge translations from reviewed directory to original directory
 */
export async function batchMergeTranslations(
    originalDir: string,
    reviewedDir: string,
    dryRun: boolean = false,
    verbose: boolean = false
): Promise<OverallStats> {
    console.log(`📁 Scanning original directory: ${originalDir}`);
    console.log(`📁 Scanning reviewed directory: ${reviewedDir}`);

    const originalFiles = getTranslationFiles(originalDir);
    const reviewedFiles = getTranslationFiles(reviewedDir);

    if (originalFiles.length === 0) {
        throw new Error('No translation files found in original directory');
    }

    if (reviewedFiles.length === 0) {
        throw new Error('No translation files found in reviewed directory');
    }

    console.log(
        `\n🔍 Found ${originalFiles.length} original files and ${reviewedFiles.length} reviewed files\n`
    );

    const overallStats: OverallStats = {
        filesProcessed: 0,
        filesSkipped: 0,
        totalNewKeys: 0,
        totalUpdatedKeys: 0,
        totalUnchangedKeys: 0,
        processedLanguages: []
    };

    // Process each reviewed file
    for (const reviewedFile of reviewedFiles) {
        const originalFile = originalFiles.find(f => f.lang === reviewedFile.lang);

        if (!originalFile) {
            console.log(`⏭️  Skipping ${reviewedFile.lang}: No corresponding original file found`);
            overallStats.filesSkipped++;
            continue;
        }

        console.log(`🌐 Processing language: ${reviewedFile.lang}`);
        console.log(`   📄 Original: ${originalFile.path}`);
        console.log(`   📄 Reviewed: ${reviewedFile.path}`);

        if (verbose) {
            console.log(`\n🔍 Comparing ${reviewedFile.lang} translations...\n`);
        }

        try {
            const result = await mergeSingleFile(originalFile.path, reviewedFile.path, dryRun, verbose);

            if (result.success) {
                overallStats.filesProcessed++;
                overallStats.totalNewKeys += result.stats.newKeys;
                overallStats.totalUpdatedKeys += result.stats.updatedKeys;
                overallStats.totalUnchangedKeys += result.stats.unchangedKeys;
                overallStats.processedLanguages.push(reviewedFile.lang);

                if (result.stats.newKeys > 0 || result.stats.updatedKeys > 0) {
                    console.log(
                        `   ✅ ${result.stats.newKeys} new, ${result.stats.updatedKeys} updated, ${result.stats.unchangedKeys} unchanged`
                    );
                } else {
                    console.log(`   ✨ No changes needed - all translations are up to date`);
                }
            } else {
                console.log(`   ❌ Failed to process ${reviewedFile.lang}`);
            }
        } catch (error) {
            console.log(`   ❌ Error processing ${reviewedFile.lang}: ${(error as Error).message}`);
        }
        console.log();
    }

    // Print overall summary
    console.log('='.repeat(60));
    console.log('📊 Overall Summary:');
    console.log(`   Languages processed: ${overallStats.filesProcessed}`);
    console.log(`   Languages skipped: ${overallStats.filesSkipped}`);
    console.log(`   Total new keys: ${overallStats.totalNewKeys}`);
    console.log(`   Total updated keys: ${overallStats.totalUpdatedKeys}`);
    console.log(`   Total unchanged keys: ${overallStats.totalUnchangedKeys}`);
    console.log(`   Processed languages: ${overallStats.processedLanguages.join(', ')}`);

    if (!dryRun && (overallStats.totalNewKeys > 0 || overallStats.totalUpdatedKeys > 0)) {
        console.log('\n🎉 Batch merge completed successfully!');
        console.log('💡 Tip: Check the changes and commit them to your version control system');
    } else if (dryRun) {
        console.log('\n🔍 DRY RUN MODE - No files were modified');
    } else if (overallStats.totalNewKeys === 0 && overallStats.totalUpdatedKeys === 0) {
        console.log('\n✨ All translations are already up to date!');
    }

    return overallStats;
}

/**
 * Clean up diff directory after merging
 */
async function cleanupDiffDirectory(diffDir: string, dryRun: boolean = false): Promise<boolean> {
    try {
        if (!existsSync(diffDir)) {
            console.log(`📁 Directory ${diffDir} does not exist, no cleanup needed`);
            return true;
        }

        const files = readdirSync(diffDir);
        if (files.length === 0) {
            console.log(`📁 Directory ${diffDir} is already empty`);
            if (!dryRun) {
                await fs.rmdir(diffDir);
                console.log(`🗑️  Removed empty directory: ${diffDir}`);
            }
            return true;
        }

        if (dryRun) {
            console.log(`🗑️  DRY RUN: Would remove ${files.length} files from ${diffDir}`);
            console.log(`🗑️  DRY RUN: Would remove directory: ${diffDir}`);
            return true;
        }

        // Remove all files in the directory
        for (const file of files) {
            const filePath = path.join(diffDir, file);
            await fs.unlink(filePath);
            console.log(`🗑️  Removed file: ${filePath}`);
        }

        // Remove the directory itself
        await fs.rmdir(diffDir);
        console.log(`🗑️  Removed directory: ${diffDir}`);

        return true;
    } catch (error) {
        console.error(`❌ Error cleaning up directory ${diffDir}: ${(error as Error).message}`);
        return false;
    }
}

/**
 * Handle merge translations tool
 */
export async function handleMergeTranslations({
    originalDir,
    reviewedDir,
    dryRun = false,
    verbose = false,
    projectRoot,
    cleanupDiffDirectory: shouldCleanup = false,
    autoCommit = false,
    commitMessage,
    autoPush = false,
    pushBranch
}: {
    originalDir: string;
    reviewedDir: string;
    dryRun?: boolean;
    verbose?: boolean;
    projectRoot?: string;
    cleanupDiffDirectory?: boolean;
    autoCommit?: boolean;
    commitMessage?: string;
    autoPush?: boolean;
    pushBranch?: string;
}) {
    try {
        // Resolve paths relative to project root if provided
        const resolveDir = (dir: string) => {
            if (path.isAbsolute(dir)) {
                return dir;
            }
            return path.resolve(projectRoot || process.cwd(), dir);
        };

        const resolvedOriginalDir = resolveDir(originalDir);
        const resolvedReviewedDir = resolveDir(reviewedDir);

        if (!existsSync(resolvedOriginalDir)) {
            throw new Error(`Original directory not found: ${resolvedOriginalDir}`);
        }

        if (!existsSync(resolvedReviewedDir)) {
            throw new Error(`Reviewed directory not found: ${resolvedReviewedDir}`);
        }

        if (dryRun) {
            console.log('🔍 DRY RUN MODE - No files will be modified\n');
        }

        const stats = await batchMergeTranslations(resolvedOriginalDir, resolvedReviewedDir, dryRun, verbose);

        // Clean up diff directory if requested and merge was successful
        if (shouldCleanup && stats.filesProcessed > 0) {
            console.log('\n🧹 Cleaning up diff directory...');
            const cleanupSuccess = await cleanupDiffDirectory(resolvedReviewedDir, dryRun);
            if (cleanupSuccess) {
                console.log('✅ Diff directory cleanup completed');
            } else {
                console.log('⚠️  Warning: Diff directory cleanup failed');
            }
        }

        // Perform git operations if requested and merge was successful
        if ((autoCommit || autoPush) && stats.filesProcessed > 0) {
            console.log('\n🔧 Performing git operations...');
            
            // Get list of merged files for git add
            const mergedFiles = stats.processedLanguages.map(lang => 
                path.join(resolvedOriginalDir, `${lang}.json`)
            );
            
            const gitOptions: GitCommitOptions = {
                addFiles: autoCommit,
                specificFiles: mergedFiles,
                message: commitMessage,
                push: autoPush,
                branch: pushBranch
            };
            
            const gitResult = await executeGitOperations(
                gitOptions,
                path.resolve(projectRoot || process.cwd()),
                'merge translations',
                `${stats.totalNewKeys + stats.totalUpdatedKeys} changes across ${stats.processedLanguages.length} languages`,
                dryRun
            );
            
            if (gitResult.success) {
                console.log(`✅ ${gitResult.message}`);
            } else {
                console.warn(`⚠️  Git operations failed: ${gitResult.message}`);
            }
        }

        return {
            success: stats.filesProcessed > 0,
            message: `Processed ${stats.filesProcessed} languages, ${stats.totalNewKeys} new keys, ${stats.totalUpdatedKeys} updated keys${shouldCleanup ? ', cleaned up diff directory' : ''}`,
            stats
        };

    } catch (error) {
        console.error(`❌ Error: ${(error as Error).message}`);
        throw error;
    }
}

/**
 * Setup the merge translations tool
 */
export function setupMergeTranslationsTool(
    server: any,
    _config: ServerConfig,
    _translationConfig: TranslationConfig
) {
    server.tool(
        'merge_translations',
        'Merge reviewed translation files back into original translation files',
        {
            originalDir: z.string().describe('Path to the original translations directory (contains target files to be updated)'),
            reviewedDir: z.string().describe('Path to the reviewed translations directory (contains reviewed translations from boss)'),
            dryRun: z.boolean().default(false).describe('Preview mode - show changes without modifying files'),
            verbose: z.boolean().default(false).describe('Show detailed changes for each key'),
            projectRoot: z.string().optional().describe('Project root for path resolution (defaults to current working directory)'),
            cleanupDiffDirectory: z.boolean().default(false).describe('Automatically clean up (remove) the diff directory after successful merge'),
            autoCommit: z.boolean().default(false).describe('Automatically commit the merged translation files to git'),
            commitMessage: z.string().optional().describe('Custom commit message (auto-generated if not provided)'),
            autoPush: z.boolean().default(false).describe('Automatically push the commit to remote repository'),
            pushBranch: z.string().optional().describe('Branch to push to (defaults to current branch)')
        },
        handleMergeTranslations
    );
}