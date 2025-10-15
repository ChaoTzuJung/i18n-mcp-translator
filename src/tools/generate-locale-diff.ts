/**
 * A1 - Generate locale diff files by comparing current branch with master/main branch
 * 比對當前分支與 Master 文本異動
 */

import { z } from 'zod';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { type ServerConfig } from '../types/config.js';
import { type TranslationConfig } from '../types/i18n.js';
import { executeGitOperations, type GitCommitOptions } from '../utils/git-operations.js';

interface DiffChange {
    type: 'added' | 'modified' | 'deleted';
    key: string;
    newValue?: string;
    oldValue?: string;
}

interface LocaleFileDiff {
    filePath: string;
    language: string;
    changes: DiffChange[];
}

interface DiffGenerationResult {
    success: boolean;
    message: string;
    baseBranch: string;
    filesProcessed: number;
    totalChanges: number;
    diffDirectory: string;
    languageDiffs: LocaleFileDiff[];
}

/**
 * Detect the main branch name (master or main)
 */
async function detectMainBranch(projectRoot: string): Promise<string> {
    try {
        // Check if master branch exists
        try {
            execSync('git show-ref --verify --quiet refs/heads/master', { 
                cwd: projectRoot, 
                stdio: 'ignore' 
            });
            return 'master';
        } catch {
            // master doesn't exist, check for main
            try {
                execSync('git show-ref --verify --quiet refs/heads/main', { 
                    cwd: projectRoot, 
                    stdio: 'ignore' 
                });
                return 'main';
            } catch {
                // Neither exists, check remote branches
                try {
                    execSync('git show-ref --verify --quiet refs/remotes/origin/master', { 
                        cwd: projectRoot, 
                        stdio: 'ignore' 
                    });
                    return 'origin/master';
                } catch {
                    try {
                        execSync('git show-ref --verify --quiet refs/remotes/origin/main', { 
                            cwd: projectRoot, 
                            stdio: 'ignore' 
                        });
                        return 'origin/main';
                    } catch {
                        // Fallback to master as default
                        console.error('⚠️  Could not detect main branch, defaulting to master');
                        return 'master';
                    }
                }
            }
        }
    } catch (error) {
        console.error(`⚠️  Error detecting main branch: ${(error as Error).message}, defaulting to master`);
        return 'master';
    }
}

/**
 * Get list of changed locale files
 */
function getChangedLocaleFiles(localeDir: string, baseBranch: string, projectRoot: string): string[] {
    try {
        const relativePath = path.relative(projectRoot, localeDir);
        const gitCommand = `git diff ${baseBranch} --name-only -- ${relativePath}/`;

        console.error(`🔍 Running: ${gitCommand}`);
        const output = execSync(gitCommand, {
            cwd: projectRoot,
            encoding: 'utf8'
        });

        const changedFiles = output
            .split('\n')
            .filter(file => file.trim() && file.endsWith('.json'))
            .map(file => path.resolve(projectRoot, file));

        console.error(`📁 Found ${changedFiles.length} changed locale files`);
        changedFiles.forEach(file => console.error(`   - ${path.basename(file)}`));

        return changedFiles;
    } catch (error) {
        console.error(`❌ Error getting changed files: ${(error as Error).message}`);
        return [];
    }
}

/**
 * Parse git diff output to extract changes
 */
function parseGitDiffChanges(diffOutput: string): DiffChange[] {
    const changes: DiffChange[] = [];
    const lines = diffOutput.split('\n');
    const processedKeys = new Set<string>();

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Look for JSON key-value changes (handle both + and - prefixes)
        if (line.startsWith('+"') || line.startsWith('-"')) {
            const isAdded = line.startsWith('+"');
            const isRemoved = line.startsWith('-"');

            // More flexible regex that handles escaped quotes and special characters
            // Matches: +    "key": "value",  or  -    "key": "value"
            const match = line.match(/^([+-])\s*"([^"]+)":\s*"((?:[^"\\]|\\.)*)"\s*,?\s*$/);
            if (match) {
                const [, , key, value] = match;

                // Skip if we've already processed this key
                if (processedKeys.has(key)) {
                    continue;
                }

                // Check if this is a modification (both + and - exist for same key)
                const oppositePrefix = isAdded ? '-' : '+';
                const oppositeLine = lines.find(l => {
                    const oppositeMatch = l.match(/^([+-])\s*"([^"]+)":\s*"((?:[^"\\]|\\.)*)"\s*,?\s*$/);
                    return oppositeMatch && oppositeMatch[1] === oppositePrefix && oppositeMatch[2] === key;
                });

                if (oppositeLine && isAdded) {
                    // This is a modification, get the old value
                    const oldMatch = oppositeLine.match(/^-\s*"[^"]+":\ *"((?:[^"\\]|\\.)*)"\s*,?\s*$/);
                    const oldValue = oldMatch ? oldMatch[1] : '';

                    changes.push({
                        type: 'modified',
                        key,
                        newValue: value,
                        oldValue
                    });
                    processedKeys.add(key);
                } else if (!oppositeLine) {
                    // This is a pure addition or deletion
                    changes.push({
                        type: isAdded ? 'added' : 'deleted',
                        key,
                        newValue: isAdded ? value : undefined,
                        oldValue: isRemoved ? value : undefined
                    });
                    processedKeys.add(key);
                }
            }
        }
    }

    return changes;
}

/**
 * Get file diff for a specific locale file
 */
async function getLocaleFileDiff(
    filePath: string, 
    baseBranch: string, 
    projectRoot: string
): Promise<LocaleFileDiff | null> {
    try {
        const relativePath = path.relative(projectRoot, filePath);
        const gitCommand = `git diff ${baseBranch} -- "${relativePath}"`;

        console.error(`🔍 Getting diff for: ${path.basename(filePath)}`);

        const diffOutput = execSync(gitCommand, {
            cwd: projectRoot,
            encoding: 'utf8'
        });

        if (!diffOutput.trim()) {
            console.error(`   ℹ️  No changes found for ${path.basename(filePath)}`);
            return null;
        }

        const changes = parseGitDiffChanges(diffOutput);
        const language = path.basename(filePath, '.json');

        console.error(`   📊 Found ${changes.length} changes in ${language}`);
        
        return {
            filePath,
            language,
            changes
        };
    } catch (error) {
        console.error(`❌ Error getting diff for ${filePath}: ${(error as Error).message}`);
        return null;
    }
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
        console.error(`Warning: Could not parse ${filePath}: ${(error as Error).message}`);
    }
    return null;
}

/**
 * Save JSON file with proper formatting
 */
async function saveJsonFile(filePath: string, data: Record<string, any>): Promise<boolean> {
    try {
        // Ensure directory exists
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        
        // Sort keys alphabetically
        const sortedData: Record<string, any> = {};
        Object.keys(data)
            .sort()
            .forEach(key => {
                sortedData[key] = data[key];
            });
            
        await fs.writeFile(filePath, JSON.stringify(sortedData, null, 4) + '\n', 'utf8');
        return true;
    } catch (error) {
        console.error(`Error writing ${filePath}: ${(error as Error).message}`);
        return false;
    }
}

/**
 * Generate diff content for other languages based on main language changes
 */
async function generateLanguageDiffContent(
    changes: DiffChange[],
    _language: string,
    originalFilePath: string,
    isMainLanguage: boolean
): Promise<Record<string, string>> {
    const diffContent: Record<string, string> = {};

    if (isMainLanguage) {
        // For main language (zh-TW), use actual change values
        changes.forEach(change => {
            if (change.type === 'added' || change.type === 'modified') {
                diffContent[change.key] = change.newValue || '';
            }
        });
    } else {
        // For other languages, follow the A1 logic
        const originalData = await loadJsonFile(originalFilePath);
        
        changes.forEach(change => {
            if (originalData && originalData[change.key] !== undefined) {
                // Key exists in target language - use original translation
                diffContent[change.key] = originalData[change.key];
            } else {
                // Key doesn't exist - use empty string
                diffContent[change.key] = '';
            }
        });
    }
    
    return diffContent;
}

/**
 * Generate locale diff files
 */
export async function generateLocaleDiff({
    localeDir,
    projectRoot,
    baseBranch: customBaseBranch,
    mainLanguage = 'zh-TW',
    dryRun = false,
    gitOptions
}: {
    localeDir: string;
    projectRoot?: string;
    baseBranch?: string;
    mainLanguage?: string;
    dryRun?: boolean;
    gitOptions?: GitCommitOptions;
}): Promise<DiffGenerationResult> {
    try {
        // Resolve paths
        const resolvedProjectRoot = projectRoot || process.cwd();
        const resolvedLocaleDir = path.isAbsolute(localeDir) 
            ? localeDir 
            : path.resolve(resolvedProjectRoot, localeDir);

        console.error(`📁 Locale directory: ${resolvedLocaleDir}`);
        console.error(`📁 Project root: ${resolvedProjectRoot}`);

        if (!existsSync(resolvedLocaleDir)) {
            throw new Error(`Locale directory not found: ${resolvedLocaleDir}`);
        }

        // Detect main branch if not specified
        const baseBranch = customBaseBranch || await detectMainBranch(resolvedProjectRoot);
        console.error(`🌿 Using base branch: ${baseBranch}`);

        // Get changed locale files
        const changedFiles = getChangedLocaleFiles(resolvedLocaleDir, baseBranch, resolvedProjectRoot);
        
        if (changedFiles.length === 0) {
            return {
                success: true,
                message: 'No locale files have changed',
                baseBranch,
                filesProcessed: 0,
                totalChanges: 0,
                diffDirectory: '',
                languageDiffs: []
            };
        }

        // Get diff for each changed file
        const languageDiffs: LocaleFileDiff[] = [];
        let totalChanges = 0;

        for (const filePath of changedFiles) {
            const diff = await getLocaleFileDiff(filePath, baseBranch, resolvedProjectRoot);
            if (diff && diff.changes.length > 0) {
                languageDiffs.push(diff);
                totalChanges += diff.changes.length;
            }
        }

        if (languageDiffs.length === 0) {
            return {
                success: true,
                message: 'No translation changes found in locale files',
                baseBranch,
                filesProcessed: changedFiles.length,
                totalChanges: 0,
                diffDirectory: '',
                languageDiffs: []
            };
        }

        // Find main language changes
        const mainLanguageDiff = languageDiffs.find(diff => 
            diff.language === mainLanguage || 
            path.basename(diff.filePath, '.json') === mainLanguage
        );

        if (!mainLanguageDiff) {
            throw new Error(`No changes found for main language: ${mainLanguage}`);
        }

        // Create diff directory
        const diffDirectory = path.join(resolvedLocaleDir, 'diff');

        if (dryRun) {
            console.error(`\n🔍 DRY RUN MODE - Preview of diff files to be generated:`);
            console.error(`📁 Diff directory: ${diffDirectory}`);
        } else {
            await fs.mkdir(diffDirectory, { recursive: true });
            console.error(`\n📁 Created diff directory: ${diffDirectory}`);
        }

        // Generate diff files for all languages
        const allLanguageFiles = await fs.readdir(resolvedLocaleDir);
        const allLanguages = allLanguageFiles
            .filter(file => file.endsWith('.json'))
            .map(file => file.replace('.json', ''));

        console.error(`\n🌐 Generating diff files for ${allLanguages.length} languages...`);

        for (const language of allLanguages) {
            const isMainLanguage = language === mainLanguage;
            const originalFilePath = path.join(resolvedLocaleDir, `${language}.json`);
            const diffFilePath = path.join(diffDirectory, `${language}.json`);

            const diffContent = await generateLanguageDiffContent(
                mainLanguageDiff.changes,
                language,
                originalFilePath,
                isMainLanguage
            );

            if (Object.keys(diffContent).length > 0) {
                if (dryRun) {
                    console.error(`   📄 Would create: ${language}.json (${Object.keys(diffContent).length} keys)`);
                } else {
                    await saveJsonFile(diffFilePath, diffContent);
                    console.error(`   ✅ Generated: ${language}.json (${Object.keys(diffContent).length} keys)`);
                }
            }
        }

        // Perform git operations if requested
        if (gitOptions && totalChanges > 0) {
            console.error('\n🔧 Performing git operations...');
            
            // Prepare files for git operations
            const diffFiles = allLanguages.map(lang => path.join(diffDirectory, `${lang}.json`));
            const gitOptionsWithFiles = {
                ...gitOptions,
                specificFiles: gitOptions.specificFiles || diffFiles
            };
            
            const gitResult = await executeGitOperations(
                gitOptionsWithFiles,
                resolvedProjectRoot,
                'generate locale diff',
                `${totalChanges} changes across ${allLanguages.length} languages`,
                dryRun
            );
            
            if (gitResult.success) {
                console.error(`✅ ${gitResult.message}`);
            } else {
                console.error(`⚠️  Git operations failed: ${gitResult.message}`);
            }
        }

        return {
            success: true,
            message: `Generated diff files for ${allLanguages.length} languages with ${totalChanges} total changes`,
            baseBranch,
            filesProcessed: changedFiles.length,
            totalChanges,
            diffDirectory,
            languageDiffs
        };

    } catch (error) {
        console.error(`❌ Error: ${(error as Error).message}`);
        throw error;
    }
}

/**
 * Handle generate locale diff tool
 */
export async function handleGenerateLocaleDiff({
    localeDir,
    projectRoot,
    baseBranch,
    mainLanguage = 'zh-TW',
    dryRun = false,
    autoCommit = false,
    commitMessage,
    autoPush = false,
    pushBranch
}: {
    localeDir: string;
    projectRoot?: string;
    baseBranch?: string;
    mainLanguage?: string;
    dryRun?: boolean;
    autoCommit?: boolean;
    commitMessage?: string;
    autoPush?: boolean;
    pushBranch?: string;
}) {
    try {
        if (dryRun) {
            console.error('🔍 DRY RUN MODE - No files will be created\n');
        }

        // Prepare git options
        const gitOptions: GitCommitOptions | undefined = (autoCommit || autoPush) ? {
            addFiles: autoCommit,
            message: commitMessage,
            push: autoPush,
            branch: pushBranch
        } : undefined;

        const result = await generateLocaleDiff({
            localeDir,
            projectRoot,
            baseBranch,
            mainLanguage,
            dryRun,
            gitOptions
        });

        if (result.success) {
            console.error(`\n✅ ${result.message}`);
            if (result.totalChanges > 0) {
                console.error('💡 Tip: Review the generated diff files and share them with your translation team');
            }
        }

        return result;

    } catch (error) {
        console.error(`❌ Error: ${(error as Error).message}`);
        throw error;
    }
}

/**
 * Setup the generate locale diff tool
 */
export function setupGenerateLocaleDiffTool(
    server: any,
    _config: ServerConfig,
    _translationConfig: TranslationConfig
) {
    server.tool(
        'generate_locale_diff',
        'A1 - Compare current branch with master/main branch and generate diff files for translation team',
        {
            localeDir: z.string().describe('Path to the locale directory (e.g., "src/assets/locale")'),
            projectRoot: z.string().optional().describe('Project root directory (defaults to current working directory)'),
            baseBranch: z.string().optional().describe('Base branch to compare against (auto-detects master/main if not specified)'),
            mainLanguage: z.string().default('zh-TW').describe('Main language code for diff generation'),
            dryRun: z.boolean().default(false).describe('Preview mode - show what would be generated without creating files'),
            autoCommit: z.boolean().default(false).describe('Automatically commit the generated diff files to git'),
            commitMessage: z.string().optional().describe('Custom commit message (auto-generated if not provided)'),
            autoPush: z.boolean().default(false).describe('Automatically push the commit to remote repository'),
            pushBranch: z.string().optional().describe('Branch to push to (defaults to current branch)')
        },
        handleGenerateLocaleDiff
    );
}