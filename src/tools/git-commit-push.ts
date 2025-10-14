/**
 * Standalone git commit and push tool for i18n operations
 */

import { z } from 'zod';
import { type ServerConfig } from '../types/config.js';
import { type TranslationConfig } from '../types/i18n.js';
import { executeGitOperations, type GitCommitOptions } from '../utils/git-operations.js';

/**
 * Handle git commit and push operations
 */
export async function handleGitCommitPush({
    files,
    commitMessage,
    operationType = 'i18n update',
    operationDetails,
    push = false,
    branch,
    projectRoot,
    dryRun = false
}: {
    files?: string[];
    commitMessage?: string;
    operationType?: string;
    operationDetails?: string;
    push?: boolean;
    branch?: string;
    projectRoot?: string;
    dryRun?: boolean;
}) {
    try {
        const resolvedProjectRoot = projectRoot || process.cwd();
        
        if (dryRun) {
            console.log('🔍 DRY RUN MODE - Git operations preview\n');
        }

        const gitOptions: GitCommitOptions = {
            addFiles: !!files?.length,
            specificFiles: files,
            message: commitMessage,
            push,
            branch
        };

        const result = await executeGitOperations(
            gitOptions,
            resolvedProjectRoot,
            operationType,
            operationDetails,
            dryRun
        );

        if (result.success) {
            console.log(`\n✅ ${result.message}`);
            
            if (result.commitHash && !dryRun) {
                console.log(`📝 Commit: ${result.commitHash}`);
            }
            
            if (result.pushedToBranch && !dryRun) {
                console.log(`🚀 Pushed to: ${result.pushedToBranch}`);
            }
        }

        return result;

    } catch (error) {
        console.error(`❌ Error: ${(error as Error).message}`);
        throw error;
    }
}

/**
 * Setup the git commit push tool
 */
export function setupGitCommitPushTool(
    server: any,
    _config: ServerConfig,
    _translationConfig: TranslationConfig
) {
    server.tool(
        'git_commit_push',
        'Commit and optionally push files to git repository with i18n-optimized workflow',
        {
            files: z.array(z.string()).optional().describe('Array of file paths to add and commit (relative to project root)'),
            commitMessage: z.string().optional().describe('Commit message (auto-generated if not provided)'),
            operationType: z.string().default('i18n update').describe('Type of operation for auto-generated commit message'),
            operationDetails: z.string().optional().describe('Additional details for auto-generated commit message'),
            push: z.boolean().default(false).describe('Push the commit to remote repository'),
            branch: z.string().optional().describe('Branch to push to (defaults to current branch)'),
            projectRoot: z.string().optional().describe('Project root directory (defaults to current working directory)'),
            dryRun: z.boolean().default(false).describe('Preview mode - show what would be committed/pushed without executing')
        },
        handleGitCommitPush
    );
}