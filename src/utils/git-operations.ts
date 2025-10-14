/**
 * Git operations utilities for i18n MCP tools
 */

import { execSync } from 'child_process';

export interface GitCommitOptions {
    message?: string;
    addFiles?: boolean;
    specificFiles?: string[];
    push?: boolean;
    branch?: string;
}

export interface GitOperationResult {
    success: boolean;
    message: string;
    commitHash?: string;
    pushedToBranch?: string;
}

/**
 * Generate a commit message for i18n operations
 */
function generateCommitMessage(operation: string, details?: string): string {
    const baseMessage = `i18n: ${operation}`;
    
    if (details) {
        return `${baseMessage} - ${details}`;
    }
    
    return baseMessage;
}

/**
 * Add files to git staging area
 */
function addFilesToGit(files: string[], projectRoot: string): void {
    if (files.length === 0) return;
    
    const filesArg = files.map(f => `"${f}"`).join(' ');
    const addCommand = `git add ${filesArg}`;
    
    console.log(`📝 Adding files to git: ${files.length} files`);
    execSync(addCommand, { cwd: projectRoot, stdio: 'inherit' });
}

/**
 * Create a git commit
 */
function createGitCommit(message: string, projectRoot: string): string {
    console.log(`💾 Creating commit: ${message}`);
    
    const commitCommand = `git commit -m "${message}"`;
    const output = execSync(commitCommand, { 
        cwd: projectRoot, 
        encoding: 'utf8',
        stdio: ['inherit', 'pipe', 'inherit']
    });
    
    // Extract commit hash from output
    const hashMatch = output.match(/\[[\w-]+\s+([a-f0-9]+)\]/);
    const commitHash = hashMatch ? hashMatch[1] : 'unknown';
    
    console.log(`✅ Created commit: ${commitHash}`);
    return commitHash;
}

/**
 * Push changes to remote
 */
function pushToRemote(branch: string, projectRoot: string): void {
    console.log(`🚀 Pushing to remote branch: ${branch}`);
    
    const pushCommand = `git push origin ${branch}`;
    execSync(pushCommand, { cwd: projectRoot, stdio: 'inherit' });
    
    console.log(`✅ Pushed to origin/${branch}`);
}

/**
 * Get current git branch
 */
function getCurrentBranch(projectRoot: string): string {
    try {
        const branch = execSync('git branch --show-current', { 
            cwd: projectRoot, 
            encoding: 'utf8' 
        }).trim();
        return branch || 'main';
    } catch (error) {
        console.warn('⚠️  Could not detect current branch, defaulting to main');
        return 'main';
    }
}

/**
 * Check if there are any changes to commit
 */
function hasChangesToCommit(projectRoot: string): boolean {
    try {
        const status = execSync('git status --porcelain', { 
            cwd: projectRoot, 
            encoding: 'utf8' 
        });
        return status.trim().length > 0;
    } catch (error) {
        console.warn('⚠️  Could not check git status');
        return false;
    }
}

/**
 * Execute git operations with error handling
 */
export async function executeGitOperations(
    options: GitCommitOptions,
    projectRoot: string,
    operationType: string,
    operationDetails?: string,
    dryRun: boolean = false
): Promise<GitOperationResult> {
    try {
        if (dryRun) {
            console.log('\n🔍 DRY RUN MODE - Git operations that would be performed:');
            
            if (options.addFiles && options.specificFiles?.length) {
                console.log(`   📝 Would add ${options.specificFiles.length} files to git`);
                options.specificFiles.forEach(file => console.log(`     - ${file}`));
            }
            
            const commitMessage = options.message || generateCommitMessage(operationType, operationDetails);
            console.log(`   💾 Would create commit: "${commitMessage}"`);
            
            if (options.push) {
                const branch = options.branch || getCurrentBranch(projectRoot);
                console.log(`   🚀 Would push to: origin/${branch}`);
            }
            
            return {
                success: true,
                message: 'DRY RUN: Git operations preview completed'
            };
        }

        // Check if we should perform git operations
        if (!options.addFiles && !options.message && !options.push) {
            return {
                success: true,
                message: 'No git operations requested'
            };
        }

        // Check if there are changes to commit
        if (!hasChangesToCommit(projectRoot)) {
            console.log('ℹ️  No changes detected, skipping git operations');
            return {
                success: true,
                message: 'No changes to commit'
            };
        }

        let commitHash: string | undefined;
        let pushedToBranch: string | undefined;

        // Add files if requested
        if (options.addFiles && options.specificFiles?.length) {
            addFilesToGit(options.specificFiles, projectRoot);
        }

        // Create commit if message provided or auto-generate
        const commitMessage = options.message || generateCommitMessage(operationType, operationDetails);
        commitHash = createGitCommit(commitMessage, projectRoot);

        // Push if requested
        if (options.push) {
            const branch = options.branch || getCurrentBranch(projectRoot);
            pushToRemote(branch, projectRoot);
            pushedToBranch = branch;
        }

        return {
            success: true,
            message: `Git operations completed successfully${pushedToBranch ? ` and pushed to ${pushedToBranch}` : ''}`,
            commitHash,
            pushedToBranch
        };

    } catch (error) {
        console.error(`❌ Git operation failed: ${(error as Error).message}`);
        return {
            success: false,
            message: `Git operation failed: ${(error as Error).message}`
        };
    }
}