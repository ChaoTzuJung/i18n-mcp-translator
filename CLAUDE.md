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

## Development Notes

- Built for Node.js v22+ with ES modules
- Uses TypeScript with strict mode enabled
- Babel AST manipulation for precise code transformation
- Prettier integration for code formatting after transformation
- Local-first language management (no external API dependencies)
- Automatic language detection from existing translation files
- Robust fallback system for language configuration