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
- `I18N_MCP_SRC_DIR` - Source code directory
- `I18N_MCP_PROJECT_ROOT` - Project root for path resolution

### Translation File Management

**Flexible File Support:**
- Supports any JSON file naming: `lang.json`, `lang-editor.json`, `lang-client.json`, etc.
- Auto-discovery: Scans all `.json` files in translation directory if no specific file specified
- Language detection: Identifies language codes from existing file structure

**Configuration Priority:**
1. Specific file via `I18N_MCP_TRANSLATION_FILE` or `--translation-file`
2. Auto-discovery of first valid translation file in directory
3. Creates new file with default name if none exist

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