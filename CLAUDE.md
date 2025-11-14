# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an MCP (Model Context Protocol) server for automatic i18n translation of source code files. It detects hardcoded Traditional Chinese text, generates i18n keys using Google Gemini AI, and updates language JSON files with translations.

## Essential Commands

### Development
- `npm run build` - Compile TypeScript to build directory and set executable permissions
- `npm run build:watch` - Watch mode compilation
- `npm run typecheck` - Type checking without emitting files
- `npm run start` - Run the server locally with tsx
- `npm run watch` - Watch mode for development

### Testing and Debugging
- `npm run inspector` - Run with MCP inspector for debugging (requires GOOGLE_AI_API_KEY in .env)

## Architecture

### Core Components

**MCP Server Layer** (`src/server/`)
- `mcp-server.ts` - Main MCP server implementation with STDIO transport
- `mcp-tools.ts` - Registers and handles MCP tool definitions

**Translation Engine** (`src/core/`)
- `file-processor.ts` - Processes source files using Babel AST parsing
- `ai-service.ts` - Google Gemini AI integration for key generation and translation
- `lang-manager.ts` - Manages language JSON file operations
- `language-discovery-service.ts` - Discovers languages from existing translation files
- `translation-config-service.ts` - Builds and manages translation configuration

**Tools** (`src/tools/`)
- `translate-file.ts` - Main tool for processing individual files
- `add-translations.ts` - Tool for adding translations to language files
- `generate-locale-diff.ts` - A1 tool for comparing branch changes and generating diff files
- `merge-translations.ts` - Tool for merging reviewed translations back into project files
- `cleanup-diff-directory.ts` - Tool for cleaning up diff directories after merge operations
- `git-commit-push.ts` - Standalone git commit and push operations for i18n workflows

### Key Processing Flow

1. **Language Discovery**: Scans existing translation files to detect configured languages
2. **File Analysis**: Uses Babel parser to create AST from source code
3. **Text Detection**: Identifies hardcoded Traditional Chinese text in i18n function calls (`t()`, `i18n.t()`)
4. **AI Processing**: Google Gemini generates contextual i18n keys and translations
5. **Code Transformation**: Replaces hardcoded text with generated keys
6. **File Updates**: Updates both source files and language JSON files

### Configuration

Environment variables (can also be passed as CLI args):
- `GOOGLE_AI_API_KEY` - Required for AI translation
- `I18N_MCP_BASE_LANGUAGE` - Source language (default: zh-TW)
- `I18N_MCP_TARGET_LANGUAGES` - Comma-separated target languages
- `I18N_MCP_TRANSLATION_DIR` - Directory for language files
- `I18N_MCP_TRANSLATION_FILE` - Specific translation file name (optional)
- `I18N_MCP_TRANSLATION_SUBDIRECTORY` - Subdirectory within translation dir (optional, auto-detected)
- `I18N_MCP_SRC_DIR` - Source code directory
- `I18N_MCP_PROJECT_ROOT` - Project root for path resolution

### Translation File Management

The MCP translator supports both legacy and new i18n file structures:

**Legacy Structure (Single file):**
- Single JSON file: `lang.json`
- Nested language objects with optional "translation" wrappers
- Example: `{"zh-TW": {"translation": {"key": "value"}}}`

**New Structure (Per-language files):**
- Separate JSON files per language, either:
  - Directly in translation directory: `zh-TW.json`, `en-US.json`
  - In subdirectories: `client/zh-TW.json`, `editor/zh-TW.json`
- Flat key-value structure per file: `{"key": "value"}`

**Auto-Detection Logic:**
1. Checks for per-language JSON files directly in translation directory (e.g., `zh-TW.json`)
2. If found, uses new structure without subdirectories
3. Otherwise, checks for subdirectories containing per-language files
4. If found, uses new structure with subdirectories
5. Otherwise, uses legacy structure with single nested file

**Configuration Priority:**
1. Explicit subdirectory via `I18N_MCP_TRANSLATION_SUBDIRECTORY` or `--translation-subdirectory`
2. Auto-detection of per-language files in translation directory (**most common**)
3. Auto-detection of subdirectories containing per-language files
4. Specific file via `I18N_MCP_TRANSLATION_FILE` or `--translation-file` (legacy)
5. Auto-discovery of first valid translation file in directory
6. Creates new files/structure as needed

**Recommended Setup:**
For most projects, simply set `I18N_MCP_TRANSLATION_DIR="./src/assets/locale"` and let the system auto-detect your file structure. No additional configuration needed!

### Path Resolution Strategy

The server handles both absolute and relative paths:
- Uses `projectRoot` as base for all path resolution
- Resolves translation directory relative to project root if not absolute
- Handles cross-platform path differences

## Available MCP Tools

### 1. `translate-file` - Source Code Translation
- Scans source files for hardcoded Traditional Chinese text
- Generates contextual i18n keys using AI
- Updates language JSON files with translations
- Returns refactored code with i18n keys

### 1.5. `generate_locale_diff` - Compare Branch Changes (A1)
- Compares current branch with master/main branch to generate diff files for translation team
- **Use Case**: Generate diff files after making locale changes, for translation team review
- **Parameters**:
  - `localeDir`: Path to locale directory (e.g., "src/assets/locale")
  - `projectRoot`: Project root directory (optional, defaults to current working directory)
  - `baseBranch`: Base branch to compare against (optional, auto-detects master/main)
  - `mainLanguage`: Main language code for diff generation (default: "zh-TW")
  - `dryRun`: Preview mode without creating files (default: false)
  - `autoCommit`: Automatically commit generated diff files (default: false)
  - `commitMessage`: Custom commit message (optional, auto-generated)
  - `autoPush`: Automatically push commits to remote (default: false)
  - `pushBranch`: Branch to push to (optional, defaults to current branch)
- **Features**:
  - Smart detection of master vs main branch
  - Git integration to identify exact changes between branches
  - Identifies added, modified, and deleted translation keys
  - Generates diff files for all language variants
  - Main language shows actual changes, other languages show existing translations or empty strings
  - Creates organized diff directory structure for team review

### 2. `merge_translations` - Merge Reviewed Translations
- Merges reviewed translation files back into project translation files
- **Use Case**: After stakeholders/boss review translations, integrate approved changes
- **Parameters**:
  - `originalDir`: Path to project's translation directory (files to be updated)
  - `reviewedDir`: Path to reviewed translations directory (reviewed files from stakeholders)
  - `dryRun`: Preview changes without modifying files (default: false)
  - `verbose`: Show detailed changes for each translation key (default: false) 
  - `projectRoot`: Project root for path resolution (optional)
  - `cleanupDiffDirectory`: Automatically clean up diff directory after successful merge (default: false)
  - `autoCommit`: Automatically commit merged files (default: false)
  - `commitMessage`: Custom commit message (optional, auto-generated)
  - `autoPush`: Automatically push commits to remote (default: false)
  - `pushBranch`: Branch to push to (optional, defaults to current branch)
- **Features**:
  - Smart file matching by language code (en-US.json ↔ en-US.json)
  - Detailed statistics (new, updated, unchanged keys)
  - Safe dry-run mode for previewing changes
  - Only updates keys that have actually changed
  - Preserves existing translations not present in reviewed files
  - Optional automatic cleanup of diff directory after merge

### 3. `cleanup_diff_directory` - Clean Up Diff Directory
- Removes diff directory and all its contents after translation merge
- **Use Case**: Clean up temporary diff files after merge operations or manual review
- **Parameters**:
  - `diffDir`: Path to diff directory to be removed (e.g., "src/assets/locale/diff")
  - `dryRun`: Preview what would be removed without deleting (default: false)
  - `projectRoot`: Project root for path resolution (optional)
- **Features**:
  - Safe removal of all files in diff directory
  - Preview mode to see what would be removed
  - Detailed logging of removal process
  - Graceful error handling for missing directories

### 4. `git_commit_push` - Git Operations
- Standalone git commit and push operations for i18n workflows
- **Use Case**: Commit and push translation files with standardized messages
- **Parameters**:
  - `files`: Array of file paths to commit (optional, uses staged files if not provided)
  - `commitMessage`: Custom commit message (optional, auto-generated)
  - `operationType`: Operation type for auto-generated message (default: "i18n update")
  - `operationDetails`: Additional details for auto-generated message (optional)
  - `push`: Push commit to remote repository (default: false)
  - `branch`: Branch to push to (optional, defaults to current branch)
  - `projectRoot`: Project root directory (optional)
  - `dryRun`: Preview mode without executing commands (default: false)
- **Features**:
  - Auto-generates standardized i18n commit messages
  - Supports selective file commits or staged file commits
  - Integrated push functionality with branch detection
  - Comprehensive error handling and validation

### 5. Enhanced Translation Tools
- `enhanced_translate_file` - Enhanced version with caching and optimization
- `batch_translate_files` - Batch processing multiple files with parallel processing

## Multi-Project Support

The i18n MCP translator supports working with multiple projects simultaneously. Each project can have:
- Different translation file structures
- Different target languages
- Different naming conventions
- Independent configuration

### Quick Setup

Configure separate MCP server instances for each project in your MCP config file:

```json
{
  "mcpServers": {
    "i18n-project-a": {
      "command": "npx",
      "args": ["-y", "i18n-mcp-translator"],
      "env": {
        "GOOGLE_AI_API_KEY": "your-api-key",
        "I18N_MCP_TARGET_LANGUAGES": "zh-TW,en-US,ja",
        "I18N_MCP_TRANSLATION_DIR": "/path/to/project-a/src/assets/locale",
        "I18N_MCP_PROJECT_ROOT": "/path/to/project-a"
      }
    },
    "i18n-project-b": {
      "command": "npx",
      "args": ["-y", "i18n-mcp-translator"],
      "env": {
        "GOOGLE_AI_API_KEY": "your-api-key",
        "I18N_MCP_TARGET_LANGUAGES": "zh-TW,en-US",
        "I18N_MCP_TRANSLATION_DIR": "/path/to/project-b/src/locale",
        "I18N_MCP_PROJECT_ROOT": "/path/to/project-b"
      }
    }
  }
}
```

### Documentation

- **Quick Start**: See `docs/quick-start-multi-project.md` for 5-minute setup
- **Full Guide**: See `docs/multi-project-setup.md` for comprehensive documentation
- **Naming Conventions**: See `docs/examples/` for naming guide templates and examples

### Project-Specific Naming Conventions

Create a `docs/i18n-naming-guide.md` in each project to guide AI in generating appropriate i18n keys:

```markdown
# i18n Key Naming Convention

## Structure
{feature}.{page}.{element}.{action}

## Examples
user.profile.button.save
dashboard.analytics.chart.title
common.error.network
```

When using the translator, reference your naming guide for consistent key generation.

## Development Notes

- Built for Node.js v22+ with ES modules
- Uses TypeScript with strict mode enabled
- Babel AST manipulation for precise code transformation
- Prettier integration for code formatting after transformation
- Local-first language management (no external API dependencies)
- Automatic language detection from existing translation files
- Robust fallback system for language configuration
- **Multi-project support** - Work with multiple projects simultaneously