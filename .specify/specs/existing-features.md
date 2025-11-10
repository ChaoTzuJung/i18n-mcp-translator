# Specification: i18n MCP Translator - Existing Features

**Version:** 1.2.2
**Status:** Implemented
**Last Updated:** 2025-11-05

## 1. Feature Name

**i18n MCP Translator** - Comprehensive MCP Server for Automatic i18n Translation and Translation Workflow Management

## 2. Problem Statement

### Original Problem
Software projects with hardcoded text face significant challenges when internationalizing:

1. **Manual Translation Burden**: Developers must manually identify all hardcoded text in source files
2. **Key Generation Complexity**: Creating contextual, meaningful i18n keys is time-consuming and error-prone
3. **Multi-language Management**: Generating translations for multiple languages requires API calls to multiple services
4. **Code Refactoring Risk**: Replacing hardcoded text with i18n keys can introduce syntax errors
5. **Translation Review Workflow**: No standardized way to export translations for stakeholder review and re-import approved changes
6. **File Structure Flexibility**: Different projects use different i18n file structures (nested, flat, per-language files)
7. **Team Collaboration**: Difficulty tracking what translations changed between branches or versions

### Solution Scope
An MCP (Model Context Protocol) server that:
- Automates detection of hardcoded text in source files
- Generates contextual i18n keys using AI
- Produces multi-language translations in one operation
- Safely refactors code by replacing text with keys
- Manages translation file workflows (export, review, merge)
- Supports multiple i18n file structures with auto-detection
- Integrates with git for version control workflows

## 3. Proposed Solution

A comprehensive MCP server with 7 main tools organized into three categories:

### A. Core Translation Tools
1. **translate-file**: Translate individual source files with hardcoded text
2. **enhanced_translate_file**: Enhanced version with caching and optimization
3. **batch_translate_files**: Batch processing multiple files with parallel execution

### B. Translation Workflow Tools
4. **generate_locale_diff**: Generate diff files comparing branch changes for team review
5. **merge_translations**: Merge reviewed translations back into project files
6. **cleanup_diff_directory**: Clean up temporary diff directories

### C. Git Integration Tools
7. **git_commit_push**: Standalone git operations for i18n workflows

### Technical Approach
- **MCP Protocol**: Standard STDIO transport for Claude Desktop and other MCP clients
- **AST Parsing**: Babel parser for safe, precise code transformation
- **AI Integration**: Google Gemini for contextual key generation and translation
- **Language Discovery**: Auto-detect configured languages from existing files
- **File Format Support**: Both legacy (nested) and modern (per-language) structures

## 4. Requirements

### 4.1 Functional Requirements

#### FR1: Source Code Translation
- **FR1.1**: Detect hardcoded Traditional Chinese text in JavaScript/TypeScript files
- **FR1.2**: Support both `t()` function calls and `<Trans>` JSX components
- **FR1.3**: Generate contextual i18n keys in dot.case format (e.g., `result.display.timing`)
- **FR1.4**: Translate to multiple target languages (English, Japanese, Simplified Chinese, etc.)
- **FR1.5**: Replace hardcoded text with i18n keys in source code
- **FR1.6**: Update language JSON files with new translations
- **FR1.7**: Return refactored code with proper formatting (Prettier integration)

#### FR2: Translation File Management
- **FR2.1**: Support legacy file structure: `{"zh-TW": {"translation": {"key": "value"}}}`
- **FR2.2**: Support modern structure: Separate per-language files (e.g., `zh-TW.json`, `en-US.json`)
- **FR2.3**: Support subdirectory structures (e.g., `client/zh-TW.json`, `editor/zh-TW.json`)
- **FR2.4**: Auto-detect file structure from existing files
- **FR2.5**: Create new translation files/structures as needed
- **FR2.6**: Preserve existing translations and formatting

#### FR3: Language Discovery & Configuration
- **FR3.1**: Auto-discover languages from existing translation files
- **FR3.2**: Support 100+ language codes with full metadata (name, region, etc.)
- **FR3.3**: Accept language configuration via environment variables
- **FR3.4**: Accept language configuration via CLI arguments
- **FR3.5**: Fallback to sensible defaults when configuration is missing

#### FR4: Branch Comparison & Diff Generation
- **FR4.1**: Compare current branch with master/main branch
- **FR4.2**: Auto-detect whether repository uses master or main
- **FR4.3**: Use git diff to identify added, modified, and deleted keys
- **FR4.4**: Generate diff files for all language variants
- **FR4.5**: Support multiple subdirectories in one operation
- **FR4.6**: Preserve subdirectory structure in diff output
- **FR4.7**: Show actual changes in main language, existing/empty in others
- **FR4.8**: Optional dry-run mode for preview
- **FR4.9**: Optional auto-commit of generated diff files
- **FR4.10**: Optional auto-push to remote branch

#### FR5: Translation Merge Workflow
- **FR5.1**: Match reviewed translation files by language code
- **FR5.2**: Merge only changed translations (preserve unchanged keys)
- **FR5.3**: Add new keys from reviewed files
- **FR5.4**: Update existing keys with new values
- **FR5.5**: Report detailed statistics (new, updated, unchanged)
- **FR5.6**: Support dry-run mode for previewing changes
- **FR5.7**: Support verbose mode for detailed logging
- **FR5.8**: Optional automatic cleanup of diff directory after merge
- **FR5.9**: Optional auto-commit of merged files
- **FR5.10**: Optional auto-push to remote branch

#### FR6: Git Integration
- **FR6.1**: Commit specific files or all staged files
- **FR6.2**: Generate standardized i18n commit messages
- **FR6.3**: Support custom commit messages
- **FR6.4**: Push commits to remote repository
- **FR6.5**: Auto-detect current branch or use specified branch
- **FR6.6**: Dry-run mode for previewing git operations
- **FR6.7**: Comprehensive error handling for git failures

#### FR7: Enhanced Translation Features
- **FR7.1**: Intelligent caching of translation results
- **FR7.2**: Batch processing with parallel execution
- **FR7.3**: Progress reporting for long operations
- **FR7.4**: Force refresh option to override cache
- **FR7.5**: Configurable concurrency limits

### 4.2 Non-Functional Requirements

#### NFR1: Performance
- **NFR1.1**: Process typical source files (<1000 lines) in <5 seconds
- **NFR1.2**: Support parallel processing for batch operations
- **NFR1.3**: Cache translation results to avoid redundant AI calls
- **NFR1.4**: Minimize file I/O operations

#### NFR2: Reliability
- **NFR2.1**: Gracefully handle AI service failures (use mock data as fallback)
- **NFR2.2**: Validate file paths and permissions before operations
- **NFR2.3**: Provide detailed error messages with actionable suggestions
- **NFR2.4**: Never corrupt existing translation files
- **NFR2.5**: Atomic file operations (write to temp, then rename)

#### NFR3: Usability
- **NFR3.1**: Minimize required configuration (auto-detection preferred)
- **NFR3.2**: Provide clear, actionable error messages
- **NFR3.3**: Support both CLI and environment variable configuration
- **NFR3.4**: Dry-run modes for all destructive operations
- **NFR3.5**: Verbose logging options for debugging

#### NFR4: Maintainability
- **NFR4.1**: TypeScript with strict mode and explicit types
- **NFR4.2**: ESM module structure
- **NFR4.3**: Comprehensive inline documentation
- **NFR4.4**: Modular architecture with clear separation of concerns
- **NFR4.5**: Follow MCP protocol specifications exactly

#### NFR5: Compatibility
- **NFR5.1**: Node.js v22.0.0 or higher
- **NFR5.2**: Compatible with Claude Desktop and other MCP clients
- **NFR5.3**: Cross-platform support (Windows, macOS, Linux)
- **NFR5.4**: Support both legacy and modern i18n file structures

### 4.3 Dependencies

#### External Dependencies
- **@modelcontextprotocol/sdk** (^1.13.2): MCP protocol implementation
- **@google/generative-ai** (^0.24.1): Google Gemini AI integration
- **@babel/parser** (^7.27.5): JavaScript/TypeScript AST parsing
- **@babel/traverse** (^7.27.4): AST traversal
- **@babel/generator** (^7.27.5): Code generation from AST
- **prettier** (^3.6.1): Code formatting after transformation
- **zod** (^3.25.67): Schema validation for MCP tools
- **commander** (^14.0.0): CLI argument parsing
- **chalk** (^5.4.1): Terminal output styling
- **glob** (^11.0.3): File pattern matching
- **dotenv** (^16.6.0): Environment variable management

#### System Dependencies
- **Node.js**: v22.0.0 or higher
- **git**: For branch comparison and git operations
- **GOOGLE_AI_API_KEY**: Required for AI translation (optional, falls back to mock)

## 5. Technical Design

### 5.1 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    MCP Client (Claude Desktop)              │
└─────────────────────────┬───────────────────────────────────┘
                          │ STDIO Transport
┌─────────────────────────▼───────────────────────────────────┐
│                    MCP Server Layer                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  mcp-server.ts (Main Server)                         │  │
│  │  - STDIO transport                                   │  │
│  │  - Tool registration                                 │  │
│  │  - Request/response handling                         │  │
│  └──────────────────┬───────────────────────────────────┘  │
│                     │                                        │
│  ┌──────────────────▼───────────────────────────────────┐  │
│  │  mcp-tools.ts (Tool Registry)                        │  │
│  │  - Tool definitions with Zod schemas                 │  │
│  │  - Parameter validation                              │  │
│  │  - Tool handler routing                              │  │
│  └──────────────────┬───────────────────────────────────┘  │
└───────────────────────┼──────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
┌───────▼─────┐  ┌──────▼──────┐  ┌────▼─────────┐
│ Translation │  │  Workflow   │  │     Git      │
│    Tools    │  │    Tools    │  │   Tools      │
└───────┬─────┘  └──────┬──────┘  └────┬─────────┘
        │               │               │
┌───────▼─────────────────────────────────────────────────────┐
│                     Core Services Layer                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │file-processor│  │  ai-service  │  │ lang-manager │     │
│  │  (Babel AST) │  │   (Gemini)   │  │  (JSON I/O)  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────────────────────────┐   │
│  │   language-  │  │  translation-config-service      │   │
│  │discovery-svc │  │  (Config management)             │   │
│  └──────────────┘  └──────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
┌───────▼─────┐  ┌──────▼──────┐  ┌────▼─────────┐
│ Source Files│  │Translation  │  │     Git      │
│   (.ts,.js) │  │   Files     │  │  Repository  │
│             │  │  (.json)    │  │              │
└─────────────┘  └─────────────┘  └──────────────┘
```

### 5.2 Core Components

#### 5.2.1 MCP Server Layer (`src/server/`)

**mcp-server.ts**
- Initializes MCP server with STDIO transport
- Loads configuration from environment and CLI arguments
- Builds translation configuration
- Registers all MCP tools
- Handles server lifecycle (start, stop, refresh)

**mcp-tools.ts (MCPTools class)**
- Registers all 7 MCP tools with the server
- Defines tool schemas using Zod for parameter validation
- Routes tool calls to appropriate handlers
- Provides refresh mechanism for dynamic configuration updates

#### 5.2.2 Translation Engine (`src/core/`)

**file-processor.ts**
- Parses source files using Babel parser
- Traverses AST to find hardcoded text in:
  - `t()` function calls
  - `i18n.t()` function calls
  - `<Trans i18nKey="...">` JSX components
- Detects Traditional Chinese text using Unicode ranges
- Replaces hardcoded text with i18n keys
- Generates formatted code using Babel generator + Prettier
- Returns both refactored code and detected texts

**ai-service.ts**
- Integrates with Google Gemini AI (gemini-1.5-flash model)
- Generates contextual i18n keys from hardcoded text
- Translates text to all configured target languages
- Uses structured JSON schema for reliable parsing
- Handles API failures gracefully (returns mock data)
- Supports custom prompts with project context

**lang-manager.ts**
- Reads and writes language JSON files
- Supports both legacy and modern file structures
- Auto-detects file structure from existing files
- Merges new translations with existing content
- Preserves file formatting and key order
- Handles subdirectory structures
- Atomic file operations (temp file + rename)

**language-discovery-service.ts**
- Scans translation directory for existing JSON files
- Detects language codes from file names or content
- Extracts language information from nested structures
- Returns discovered languages with full metadata
- Supports multiple file naming conventions

**translation-config-service.ts**
- Builds translation configuration from environment/CLI
- Merges configuration from multiple sources (priority order):
  1. CLI arguments
  2. Environment variables
  3. Auto-detection
  4. Defaults
- Validates configuration completeness
- Provides configuration for all services

#### 5.2.3 Translation Tools (`src/tools/`)

**translate-file.ts**
```typescript
Tool: translate-file
Parameters:
  - filePath: string (path to source file)
  - fileContent: string (source code content)
Flow:
  1. Parse file with Babel
  2. Detect hardcoded Traditional Chinese text
  3. Call AI service to generate keys and translations
  4. Update language JSON files
  5. Replace text with keys in source code
  6. Format code with Prettier
  7. Return refactored code and summary
```

**enhanced-translate-file.ts**
```typescript
Tool: enhanced_translate_file
Parameters:
  - file_path: string
  - use_cache: boolean (default: true)
  - force_refresh: boolean (default: false)
  - cache_dir: string (default: '.translation-cache')
  - progress_callback: boolean (default: false)
  - batch_mode: boolean (default: false)
Features:
  - Caches translation results to avoid redundant AI calls
  - Configurable cache directory
  - Force refresh to override cache
  - Progress reporting for long operations
```

**batch_translate_files** (same file)
```typescript
Tool: batch_translate_files
Parameters:
  - file_paths: string[] (optional, specific files)
  - src_dir: string (optional, directory to scan)
  - file_patterns: string[] (default: ['**/*.{js,ts,jsx,tsx}'])
  - max_concurrency: number (default: 3)
  - cache_dir: string (default: '.translation-cache')
  - use_cache: boolean (default: true)
  - force_refresh: boolean (default: false)
  - progress_updates: boolean (default: true)
Features:
  - Parallel processing with configurable concurrency
  - File pattern matching with glob
  - Progress updates for batch operations
  - Shared caching across files
```

#### 5.2.4 Workflow Tools (`src/tools/`)

**generate-locale-diff.ts**
```typescript
Tool: generate_locale_diff
Parameters:
  - localeDir: string (path to locale directory)
  - projectRoot: string (optional, defaults to cwd)
  - baseBranch: string (optional, auto-detects master/main)
  - mainLanguage: string (default: "zh-TW")
  - dryRun: boolean (default: false)
  - autoCommit: boolean (default: false)
  - commitMessage: string (optional, auto-generated)
  - autoPush: boolean (default: false)
  - pushBranch: string (optional, defaults to current)
Flow:
  1. Detect base branch (master or main)
  2. Run git diff to get changed files
  3. For each subdirectory (e.g., client/, editor/):
     a. Parse current and base branch JSON files
     b. Identify added, modified, deleted keys
     c. Generate diff JSON for all languages
     d. Main language shows actual changes
     e. Other languages show existing or empty
  4. Save diff files to locale/diff/ directory
  5. Optionally commit and push changes
Features:
  - Multi-subdirectory support in one run
  - Git integration for accurate change detection
  - Structure preservation in diff output
  - Dry-run preview mode
  - Integrated git workflow
```

**merge-translations.ts**
```typescript
Tool: merge_translations
Parameters:
  - originalDir: string (project translation directory)
  - reviewedDir: string (reviewed translations directory)
  - dryRun: boolean (default: false)
  - verbose: boolean (default: false)
  - projectRoot: string (optional)
  - cleanupDiffDirectory: boolean (default: false)
  - autoCommit: boolean (default: false)
  - commitMessage: string (optional)
  - autoPush: boolean (default: false)
  - pushBranch: string (optional)
Flow:
  1. Scan originalDir for language files
  2. Match reviewed files by language code
  3. For each matched pair:
     a. Load both original and reviewed JSON
     b. Identify new, updated, unchanged keys
     c. Merge changes into original
     d. Write updated file (dry-run: skip write)
  4. Report detailed statistics
  5. Optionally clean up diff directory
  6. Optionally commit and push
Features:
  - Smart file matching by language code
  - Selective updates (only changed keys)
  - Detailed change reporting
  - Safe dry-run mode
  - Optional automatic cleanup
  - Integrated git workflow
```

**cleanup-diff-directory.ts**
```typescript
Tool: cleanup_diff_directory
Parameters:
  - diffDir: string (path to diff directory)
  - dryRun: boolean (default: false)
  - projectRoot: string (optional)
Flow:
  1. Resolve diffDir path
  2. Check if directory exists
  3. List all files in directory
  4. Remove all files (dry-run: skip removal)
  5. Remove directory itself
  6. Report removed files
Features:
  - Safe removal with error handling
  - Dry-run preview mode
  - Detailed logging of removed files
  - Graceful handling of missing directories
```

#### 5.2.5 Git Integration Tools (`src/tools/`)

**git-commit-push.ts**
```typescript
Tool: git_commit_push
Parameters:
  - files: string[] (optional, uses staged if not provided)
  - commitMessage: string (optional, auto-generated)
  - operationType: string (default: "i18n update")
  - operationDetails: string (optional)
  - push: boolean (default: false)
  - branch: string (optional, auto-detected)
  - projectRoot: string (optional)
  - dryRun: boolean (default: false)
Flow:
  1. Resolve projectRoot
  2. Validate git repository
  3. If files provided: git add files
  4. Generate commit message if not provided
  5. Execute git commit
  6. If push: execute git push
  7. Return operation summary
Features:
  - Selective or staged file commits
  - Auto-generated standardized messages
  - Branch auto-detection
  - Integrated push functionality
  - Dry-run preview mode
  - Comprehensive error handling
```

### 5.3 Data Structures

#### TranslationConfig
```typescript
interface TranslationConfig {
  baseLanguage: LanguageInfo;      // Source language (e.g., zh-TW)
  targetLanguages: LanguageInfo[]; // Target languages (e.g., en-US, ja)
  translationDir: string;          // Translation directory path
  translationFile?: string;        // Specific translation file (optional)
  translationSubdirectory?: string; // Subdirectory (optional)
  srcDir: string;                  // Source code directory
  projectRoot: string;             // Project root directory
}
```

#### LanguageInfo
```typescript
interface LanguageInfo {
  code: string;              // e.g., "en-US"
  localName: string;         // e.g., "English"
  englishName: string;       // e.g., "English"
  region?: string;           // e.g., "United States"
  script?: string;           // e.g., "Latin"
  direction?: 'ltr' | 'rtl'; // Text direction
}
```

#### TranslationResult
```typescript
interface TranslationResult {
  [key: string]: {
    [languageCode: string]: string;
  };
}
// Example:
// {
//   "result.display.timing": {
//     "zh-TW": "結果頁顯示時機",
//     "en-US": "Result page display timing",
//     "ja": "結果ページの表示タイミング"
//   }
// }
```

#### DiffGenerationResult
```typescript
interface DiffGenerationResult {
  success: boolean;
  message: string;
  baseBranch: string;
  currentBranch: string;
  diffDirectory: string;
  subdirectories: string[];
  processedSubdirectories: {
    name: string;
    languages: string[];
    statistics: {
      added: number;
      modified: number;
      deleted: number;
    };
  }[];
  committed?: boolean;
  pushed?: boolean;
}
```

#### MergeResult
```typescript
interface MergeResult {
  success: boolean;
  message: string;
  mergedFiles: {
    language: string;
    originalFile: string;
    reviewedFile: string;
    statistics: {
      newKeys: number;
      updatedKeys: number;
      unchangedKeys: number;
    };
  }[];
  cleanedUp?: boolean;
  committed?: boolean;
  pushed?: boolean;
}
```

### 5.4 API (MCP Tool Schemas)

All tools follow MCP protocol with Zod schemas for parameter validation. Tool responses follow this format:

```typescript
interface ToolResponse {
  content: Array<{
    type: "text";
    text: string; // Main response content (Markdown supported)
  }>;
  isError?: boolean;
}
```

Error responses include detailed error messages and suggestions for resolution.

### 5.5 Key Algorithms

#### Hardcoded Text Detection Algorithm
```
1. Parse source file with Babel parser
2. Traverse AST using visitor pattern
3. For each CallExpression:
   - If callee is 't' or 'i18n.t'
   - Check first argument
   - If StringLiteral and contains Traditional Chinese
   - Extract text and location
4. For each JSXElement:
   - If component name is 'Trans'
   - Find i18nKey attribute
   - If value contains Traditional Chinese
   - Extract text and location
5. Return array of detected texts with locations
```

#### Git Diff Parsing Algorithm
```
1. Execute: git diff baseBranch..currentBranch -- localeDir
2. Parse diff output line by line
3. For lines starting with '+' (additions):
   - Parse JSON to extract added/modified keys
4. For lines starting with '-' (deletions):
   - Parse JSON to extract deleted keys
5. Compare old and new values to identify modifications
6. Group changes by subdirectory and language
7. Generate diff JSON files preserving structure
```

#### Translation Merge Algorithm
```
1. Load original translation JSON
2. Load reviewed translation JSON
3. Create merged object = shallow copy of original
4. For each key in reviewed:
   - If key not in original: ADD (newKeys++)
   - Else if original[key] != reviewed[key]: UPDATE (updatedKeys++)
   - Else: UNCHANGED (unchangedKeys++)
   - Set merged[key] = reviewed[key]
5. Write merged object to original file
6. Return statistics
```

## 6. Testing Strategy

### 6.1 Unit Tests Needed

#### Core Services
- **file-processor.ts**
  - Parse valid JavaScript/TypeScript files
  - Detect Traditional Chinese in `t()` calls
  - Detect Traditional Chinese in `<Trans>` components
  - Replace text with i18n keys correctly
  - Handle malformed source files gracefully
  - Preserve code formatting

- **ai-service.ts**
  - Generate contextual i18n keys
  - Translate to all configured languages
  - Handle API failures (fallback to mock)
  - Validate response schema
  - Handle rate limiting

- **lang-manager.ts**
  - Read legacy file structure
  - Read modern file structure (per-language)
  - Read subdirectory structure
  - Write translations without corrupting existing data
  - Auto-detect file structure correctly
  - Handle file I/O errors

- **language-discovery-service.ts**
  - Discover languages from legacy files
  - Discover languages from modern files
  - Discover languages from subdirectories
  - Handle empty directories
  - Handle malformed JSON files

#### Tools
- **translate-file**
  - End-to-end translation workflow
  - Handle files with no hardcoded text
  - Handle files with multiple texts
  - Update correct language files
  - Return properly formatted code

- **generate-locale-diff**
  - Detect master vs main branch
  - Parse git diff output correctly
  - Identify added/modified/deleted keys
  - Generate correct diff structure
  - Handle multiple subdirectories
  - Handle empty diffs (no changes)

- **merge-translations**
  - Match files by language code
  - Merge new keys
  - Update modified keys
  - Preserve unchanged keys
  - Calculate statistics correctly
  - Handle mismatched file structures

### 6.2 Integration Tests Needed

- **Full translation workflow**
  1. Start with source file with hardcoded text
  2. Call translate-file tool
  3. Verify language files updated
  4. Verify source code refactored
  5. Verify code still valid (parseable)

- **Diff generation and merge workflow**
  1. Create feature branch with locale changes
  2. Call generate_locale_diff
  3. Verify diff files created with correct structure
  4. Modify diff files (simulate stakeholder review)
  5. Call merge_translations
  6. Verify original files updated correctly
  7. Call cleanup_diff_directory
  8. Verify diff directory removed

- **Git integration workflow**
  1. Make changes to translation files
  2. Call git_commit_push with specific files
  3. Verify commit created with correct message
  4. Verify files committed
  5. Call git_commit_push with push enabled
  6. Verify pushed to remote

### 6.3 Manual Testing Steps

#### Setup Test Environment
1. Clone a test project with existing i18n setup
2. Configure MCP server with test project paths
3. Prepare test source files with hardcoded Traditional Chinese

#### Test translate-file
1. Open MCP Inspector: `npm run inspector`
2. Select `translate-file` tool
3. Input test file path and content
4. Verify response includes:
   - Refactored code with i18n keys
   - Summary of detected texts
   - Updated language files
5. Check language JSON files manually
6. Verify code can be parsed and runs

#### Test generate_locale_diff
1. Create feature branch: `git checkout -b test-feature`
2. Modify locale files (add, update, delete keys)
3. Commit changes
4. Call `generate_locale_diff` via MCP Inspector
5. Verify diff directory created: `locale/diff/`
6. Verify diff files contain correct changes
7. Verify subdirectories preserved

#### Test merge_translations
1. Modify diff files (simulate review)
2. Call `merge_translations` with dryRun=true
3. Verify preview output shows correct statistics
4. Call `merge_translations` with dryRun=false
5. Verify original files updated
6. Verify diff directory cleaned up (if enabled)

#### Test git_commit_push
1. Stage some files: `git add locale/`
2. Call `git_commit_push` with dryRun=true
3. Verify preview shows correct commit
4. Call `git_commit_push` with dryRun=false
5. Verify commit created: `git log`
6. Call with push=true
7. Verify pushed: `git log --all`

#### Test Enhanced Features
1. Call `enhanced_translate_file` with use_cache=true
2. Verify cache directory created: `.translation-cache/`
3. Call again with same file
4. Verify uses cache (faster response)
5. Call `batch_translate_files` with src_dir
6. Verify multiple files processed
7. Verify progress updates displayed

#### Test Edge Cases
1. Missing API key → Should use mock data
2. Malformed JSON file → Should error gracefully
3. Non-existent file path → Should error clearly
4. Empty locale directory → Should create files
5. Invalid git repository → Should error clearly
6. Network failure → Should retry or fallback

#### Test Cross-Platform
1. Test on Windows, macOS, Linux
2. Verify path resolution works correctly
3. Verify file operations work
4. Verify git operations work

## 7. Documentation Updates

### 7.1 README.md Updates
✅ **Already Complete** - README.md includes:
- Feature overview
- Installation instructions
- Configuration guide (environment variables and CLI args)
- All 7 MCP tools with example payloads
- Development and testing instructions
- MCP Inspector usage
- Claude Code integration guide
- Debugging tips
- Sample test files

### 7.2 CLAUDE.md Updates
✅ **Already Complete** - CLAUDE.md includes:
- Project overview
- Architecture documentation
- Core components explanation
- Key processing flow
- Configuration details
- Translation file management (legacy and modern)
- Path resolution strategy
- All available MCP tools with parameters
- Development notes

### 7.3 Code Comments
Current status:
- ✅ Core services have inline documentation
- ✅ Tool handlers have JSDoc comments
- ✅ Complex algorithms explained
- ⚠️ Some helper functions could use more comments

Recommended additions:
- Add JSDoc comments to all exported functions
- Document complex type definitions
- Add examples in comments for key functions

### 7.4 Additional Documentation Needed

#### User Guides (Potential Future)
- Step-by-step tutorial for first-time users
- Best practices for i18n key naming
- Translation review workflow guide
- Troubleshooting common issues

#### Developer Guides (Potential Future)
- Contributing guide (CONTRIBUTING.md)
- Architecture decision records (ADRs)
- API documentation (generated from JSDoc)
- Testing guide

## 8. Risks & Mitigations

### 8.1 Technical Risks

#### Risk 1: AI Service Failures
**Impact**: High - Core functionality depends on Google Gemini
**Likelihood**: Medium - API can have outages or rate limits
**Mitigation**:
- ✅ Implemented: Fallback to mock data when API unavailable
- ✅ Implemented: Graceful error handling with detailed messages
- 🔄 Future: Support multiple AI providers (OpenAI, Anthropic)
- 🔄 Future: Implement exponential backoff retry logic

#### Risk 2: File Corruption
**Impact**: High - Could corrupt production translation files
**Likelihood**: Low - But catastrophic if it happens
**Mitigation**:
- ✅ Implemented: Atomic file operations (temp file + rename)
- ✅ Implemented: Dry-run modes for all destructive operations
- ✅ Implemented: Validation before writing JSON
- 🔄 Future: Automatic backup before modifications
- 🔄 Future: Version control integration (auto-commit before changes)

#### Risk 3: AST Parsing Failures
**Impact**: Medium - Cannot process files with syntax errors
**Likelihood**: Medium - User code may have syntax errors
**Mitigation**:
- ✅ Implemented: Try-catch around Babel parser
- ✅ Implemented: Clear error messages indicating syntax issues
- 🔄 Future: Suggest using linter before translation
- 🔄 Future: Partial processing (skip problematic sections)

#### Risk 4: Git Operation Failures
**Impact**: Medium - Workflow tools won't work
**Likelihood**: Low - Git is usually reliable
**Mitigation**:
- ✅ Implemented: Comprehensive error handling
- ✅ Implemented: Dry-run modes to preview operations
- ✅ Implemented: Clear error messages with git output
- 🔄 Future: Validate git status before operations
- 🔄 Future: Automatic conflict detection and resolution

### 8.2 Usability Risks

#### Risk 5: Complex Configuration
**Impact**: Medium - Users may struggle to set up
**Likelihood**: Medium - Many configuration options
**Mitigation**:
- ✅ Implemented: Auto-detection reduces configuration needs
- ✅ Implemented: Sensible defaults for all options
- ✅ Implemented: Detailed documentation with examples
- 🔄 Future: Configuration wizard/generator
- 🔄 Future: Validate configuration and suggest fixes

#### Risk 6: Unclear Error Messages
**Impact**: Medium - Users get stuck, can't debug issues
**Likelihood**: Low - Implemented good error handling
**Mitigation**:
- ✅ Implemented: Detailed error messages with context
- ✅ Implemented: Suggestions for common issues
- 🔄 Future: Error code system with online documentation
- 🔄 Future: Interactive troubleshooting guide

### 8.3 Performance Risks

#### Risk 7: Slow AI API Calls
**Impact**: Medium - Poor user experience for large files
**Likelihood**: High - API calls inherently slow
**Mitigation**:
- ✅ Implemented: Caching system in enhanced tools
- ✅ Implemented: Batch processing with parallelization
- 🔄 Future: Incremental translation (only new texts)
- 🔄 Future: Local AI model option (offline mode)

#### Risk 8: Large File Handling
**Impact**: Medium - Memory issues, slow processing
**Likelihood**: Low - Most source files are reasonable size
**Mitigation**:
- ✅ Implemented: Stream processing where possible
- ✅ Implemented: Concurrency limits for batch operations
- 🔄 Future: File size warnings
- 🔄 Future: Chunking for very large files

### 8.4 Compatibility Risks

#### Risk 9: Breaking Changes in Dependencies
**Impact**: High - Server may stop working
**Likelihood**: Low - Dependencies are mature
**Mitigation**:
- ✅ Implemented: Pinned dependency versions
- ✅ Implemented: Engines requirement (Node.js >=22)
- 🔄 Future: Automated dependency updates with testing
- 🔄 Future: Backwards compatibility testing

#### Risk 10: MCP Protocol Changes
**Impact**: High - Server incompatible with clients
**Likelihood**: Low - MCP is relatively stable
**Mitigation**:
- ✅ Implemented: Follow MCP SDK exactly
- ✅ Implemented: Use latest MCP SDK version
- 🔄 Future: Monitor MCP protocol updates
- 🔄 Future: Version compatibility matrix

---

## Summary

This specification documents the comprehensive i18n MCP Translator system with 7 main tools covering:

1. **Core Translation**: Automated i18n key generation and multi-language translation
2. **Workflow Management**: Git-based diff generation, review, and merge workflows
3. **Git Integration**: Standardized commit and push operations
4. **Enhanced Features**: Caching, batch processing, and optimization

The system is built on:
- **MCP Protocol**: Standard STDIO transport for AI assistant integration
- **Babel AST**: Safe, precise code transformation
- **Google Gemini AI**: Contextual key generation and translation
- **Flexible File Support**: Both legacy and modern i18n file structures
- **Git Integration**: Branch comparison and automated workflows

All features are implemented and documented with comprehensive error handling, dry-run modes, and clear user feedback.

### Key Strengths
- ✅ Fully implemented and functional
- ✅ Comprehensive documentation (README, CLAUDE.md)
- ✅ Flexible configuration with auto-detection
- ✅ Safe operations with dry-run modes
- ✅ Integrated git workflows
- ✅ Support for multiple file structures

### Areas for Future Enhancement
- 🔄 Multiple AI provider support
- 🔄 Enhanced caching and performance optimization
- 🔄 Web UI for translation management
- 🔄 Real-time translation during development
- 🔄 Translation memory and glossary features

---

**Specification Prepared By:** Claude Code (AI Assistant)
**Date:** 2025-11-05
**Status:** Complete - All features documented
**Next Steps:** Use `/speckit-plan` to create implementation plans for future enhancements
