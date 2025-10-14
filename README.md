# i18n-mcp-translator

A Model Context Protocol (MCP) server for automatic i18n translation of source code files.  
It scans your codebase for hardcoded Traditional Chinese text, generates i18n keys, updates language JSON files, and returns the refactored code.

## Features

- Detects hardcoded Traditional Chinese text in source files.
- Generates structured i18n keys and translations (English, Japanese, Simplified Chinese).
- **Flexible translation file support** - works with any JSON file name (lang.json, lang-editor.json, etc.)
- **Auto-discovery** - scans existing translation files to detect configured languages
- **Local-first** - no external API dependencies for language management
- Returns modified code with i18n keys.
- Powered by Google Gemini AI.
- Full language info mapping (code, local/english name, region, etc) for all configured languages.

## Requirements

- **Node.js** v22.0.0 or above
- **Google Generative AI API Key** (`GOOGLE_AI_API_KEY`)
- MCP-compatible client (or use with [TaskMaster AI](https://www.npmjs.com/package/task-master-ai) or similar)

## Installation

```bash
git clone https://github.com/ChaoTzuJung/i18n-mcp-translator.git
cd i18n-mcp-translator
npm install
npm run build
npm run start
```

## Configuration

### 1. Set up your Google AI API Key

Create a `.env` file in the project root:

GOOGLE_AI_API_KEY=your-google-api-key-here

Or export it in your shell:

```bash
export GOOGLE_AI_API_KEY=your-google-api-key-here
```

If not set, the server will use local mock data and still work.

### 2. Download and configure `.mcp.json`

- Download the sample `.mcp.json` from this repository or your MCP client.
- Place it in your home directory: `~/.cursor/mcp.json`
- Make sure the `GOOGLE_AI_API_KEY` is set in the `i18n-mcp-translator` section:

```json
"i18n-mcp-translator": {
  "command": "npx",
  "args": ["-y", "i18n-mcp-translator"],
  "env": {
    "GOOGLE_AI_API_KEY": "your-google-api-key-here",
    "I18N_MCP_BASE_LANGUAGE": "zh-TW",
    "I18N_MCP_TARGET_LANGUAGES": "zh-TW,zh-CN,zh-HK,en-US,ja,pt-BR,es-419,th-TH",
    "I18N_MCP_TRANSLATION_DIR": "/absolute/path/to/your/translation/dir",
    "I18N_MCP_TRANSLATION_FILE": "lang.json",
    "I18N_MCP_SRC_DIR": "/absolute/path/to/your/project/src",
    "I18N_MCP_PROJECT_ROOT": "/absolute/path/to/your/project"
  }
}
```

Or use the following command to start the MCP server:

```json
 "i18n-mcp-translator": {
      "command": "npx",
      "args": [
        "-y",
        "i18n-mcp-translator",
        "--api-key", "your-google-api-key-here",
        "--base-language", "zh-TW",
        "--target-languages", "zh-TW,zh-CN,zh-HK,en-US,ja,pt-BR,es-419,th-TH",
        "--dir", "/absolute/path/to/your/translation/dir",
        "--translation-file", "lang.json",
        "--src-dir", "/absolute/path/to/your/project/src",
        "--project-root", "/absolute/path/to/your/project"
      ]
 }
```

## Usage

### Start the MCP Server

```bash
npm start
```

Or directly:

```bash
npx tsx src/index.ts
```

The server will run on stdio and wait for MCP requests.

### Available MCP Tools

#### 1. `translate-file` - Source Code Translation

You can call the `translate-file` tool via MCP protocol to translate hardcoded Chinese text in source files.

Example payload:

```json
{
    "tool": "translate-file",
    "params": {
        "filePath": "src/components/YourComponent.tsx",
        "fileContent": "// your source code here"
    }
}
```

- The tool will scan for hardcoded Chinese, replace with i18n keys, and update your translation JSON file(s).
- The response includes a summary and the modified code.

#### 1.5. `generate_locale_diff` - Compare Branch Changes

Compare current branch with master/main branch to generate diff files for translation team review. This tool automatically detects which branch (master or main) your repository uses.

Example payload:

```json
{
    "tool": "generate_locale_diff",
    "params": {
        "localeDir": "src/assets/locale",
        "projectRoot": "/path/to/your/project",
        "baseBranch": "master",
        "mainLanguage": "zh-TW",
        "dryRun": true
    }
}
```

**Parameters:**

- `localeDir` - Path to the locale directory (e.g., "src/assets/locale")
- `projectRoot` - Project root directory (optional, defaults to current working directory)
- `baseBranch` - Base branch to compare against (optional, auto-detects master/main)
- `mainLanguage` - Main language code for diff generation (default: "zh-TW")
- `dryRun` - Preview mode - show what would be generated without creating files (default: false)

**Use Case:**

1. Developer makes changes to locale files on feature branch
2. Use `generate_locale_diff` to compare against master/main branch
3. Tool generates diff files in `src/assets/locale/diff/` directory
4. Share diff files with translation team for review
5. After review, use `merge_translations` to integrate changes back

**Features:**

- 🌿 **Smart branch detection**: Automatically detects whether repo uses master or main branch
- 🔍 **Git integration**: Uses `git diff` to identify exact changes between branches
- 📊 **Change analysis**: Identifies added, modified, and deleted translation keys
- 🌐 **Multi-language support**: Generates diff files for all language variants
- 📝 **Intelligent content**: Main language shows actual changes, others show existing translations or empty strings
- 🛡️ **Safe preview**: Dry-run mode to preview changes before generating files
- 🔧 **Git integration**: Optional automatic commit and push of generated diff files

#### 2. `merge_translations` - Merge Reviewed Translations

Merge reviewed translation files back into your project's original translation files. This is perfect for integrating translations that have been reviewed and approved by stakeholders.

Example payload:

```json
{
    "tool": "merge_translations",
    "params": {
        "originalDir": "src/assets/locale",
        "reviewedDir": "src/assets/locale/diff",
        "dryRun": true,
        "verbose": true,
        "projectRoot": "/path/to/your/project",
        "cleanupDiffDirectory": true
    }
}
```

**Parameters:**

- `originalDir` - Path to your project's translation directory (files to be updated)
- `reviewedDir` - Path to the reviewed translations directory (reviewed files from stakeholders)
- `dryRun` - Preview changes without modifying files (default: false)
- `verbose` - Show detailed changes for each translation key (default: false)
- `projectRoot` - Project root for path resolution (optional)
- `cleanupDiffDirectory` - Automatically clean up (remove) the diff directory after successful merge (default: false)

**Use Case:**

1. Export translation files to stakeholders for review
2. Stakeholders review and modify translations in a separate directory (e.g., `diff/` folder)
3. Use `merge_translations` to integrate approved changes back into your project
4. Optionally clean up the diff directory after successful merge
5. Automatically handles new keys, updated translations, and preserves unchanged content

**Features:**

- 🔍 **Smart matching**: Automatically matches language files (en-US.json ↔ en-US.json)
- 📊 **Detailed reporting**: Shows statistics for new, updated, and unchanged keys
- 🛡️ **Safe operation**: Dry-run mode to preview changes before applying
- 🎯 **Selective updates**: Only modifies keys that have actually changed
- 📝 **Comprehensive logging**: Track all changes with optional verbose output
- 🧹 **Auto cleanup**: Optionally remove diff directory after successful merge
- 🔧 **Git integration**: Optional automatic commit and push of merged translation files

#### 3. `cleanup_diff_directory` - Clean Up Diff Directory

Remove diff directory and all its contents after translation merge operations. This tool is useful when you want to clean up temporary diff files separately or when automatic cleanup wasn't enabled during merge.

Example payload:

```json
{
    "tool": "cleanup_diff_directory",
    "params": {
        "diffDir": "src/assets/locale/diff",
        "dryRun": true,
        "projectRoot": "/path/to/your/project"
    }
}
```

**Parameters:**

- `diffDir` - Path to the diff directory to be removed (e.g., "src/assets/locale/diff")
- `dryRun` - Preview what would be removed without actually deleting (default: false)
- `projectRoot` - Project root for path resolution (optional)

**Use Case:**

1. After manually reviewing merge results, clean up leftover diff files
2. Remove diff directory when automatic cleanup was not enabled during merge
3. Clean up failed merge attempts or partial diff directories
4. Maintain clean project structure by removing temporary translation files

**Features:**

- 🗑️ **Safe removal**: Removes all files in the diff directory and the directory itself
- 🔍 **Preview mode**: Dry-run option to see what would be removed
- 📊 **Detailed logging**: Shows each file being removed with progress indicators
- 🛡️ **Error handling**: Graceful handling of missing directories or permission issues

#### 4. `git_commit_push` - Git Operations

Commit and optionally push files to git repository with i18n-optimized workflow. This tool provides standalone git operations that can be used independently or in combination with other i18n tools.

Example payload:

```json
{
    "tool": "git_commit_push",
    "params": {
        "files": ["src/assets/locale/zh-TW.json", "src/assets/locale/en-US.json"],
        "commitMessage": "i18n: update translations after review",
        "push": true,
        "branch": "feature/i18n-updates",
        "dryRun": true
    }
}
```

**Parameters:**

- `files` - Array of file paths to add and commit (optional, commits all staged files if not provided)
- `commitMessage` - Custom commit message (optional, auto-generated if not provided)
- `operationType` - Type of operation for auto-generated commit message (default: "i18n update")
- `operationDetails` - Additional details for auto-generated commit message (optional)
- `push` - Push the commit to remote repository (default: false)
- `branch` - Branch to push to (optional, defaults to current branch)
- `projectRoot` - Project root directory (optional, defaults to current working directory)
- `dryRun` - Preview mode without executing git commands (default: false)

**Use Case:**

1. Commit specific translation files after manual edits
2. Create standardized i18n commit messages across the team
3. Automate git workflows for translation updates
4. Batch commit multiple language files with consistent messaging

**Features:**

- 📝 **Smart commit messages**: Auto-generates standardized i18n commit messages
- 🎯 **Selective commits**: Commit only specific files or use staged files
- 🚀 **Push integration**: Optionally push commits directly to remote
- 🌿 **Branch aware**: Automatically detects current branch or use custom branch
- 🔍 **Preview mode**: Dry-run to see what would be committed/pushed
- 🛡️ **Error handling**: Graceful handling of git errors and edge cases

## Development & Testing

### Testing MCP Server Locally

#### 1. Build and Test Locally

```bash
# Build the project
npm run build

# Test with local build (recommended for development)
./build/index.js \
    --api-key "your-google-api-key-here" \
    --base-language "zh-TW" \
    --target-languages "en-US,ja" \
    --translation-file "lang.json" \
    --dir "src/assets/locale" \
    --src-dir "/absolute/path/to/your/project/src" \
    --project-root "/absolute/path/to/your/project"
```

#### 2. Using MCP Inspector (Recommended)

The MCP Inspector provides a web UI for testing MCP servers:

```bash
# Install MCP Inspector globally
npm install -g @modelcontextprotocol/inspector

# Run with your local build
npx @modelcontextprotocol/inspector ./build/index.js \
    --api-key "your-google-api-key-here" \
    --base-language "zh-TW" \
    --target-languages "en-US,ja" \
    --translation-file "lang.json" \
    --dir "src/assets/locale" \
    --src-dir "/absolute/path/to/your/project/src" \
    --project-root "/absolute/path/to/your/project"
```

This will open a web interface where you can:

- View available tools (`translate-file`)
- Test tool calls with sample data
- View server logs and debug output
- Inspect the MCP protocol messages

#### 3. Testing with Claude Code

If you're using Claude Code (claude.ai/code):

1. **Configure your MCP client**

##### `.cursor/mcp.json`

```json
{
    "i18n-mcp-translator": {
        "command": "npx",
        "args": [
            "-y",
            "i18n-mcp-translator",
            "--api-key",
            "your-google-api-key-here",
            "--base-language",
            "zh-TW",
            "--target-languages",
            "en-US,ja",
            "--dir",
            "/absolute/path/to/your/translation/directory",
            "--src-dir",
            "/absolute/path/to/your/project/src",
            "--project-root",
            "/absolute/path/to/your/project"
        ]
    }
}
```

##### `claude code`

```shell
claude mcp add --transport stdio i18n-mcp-translator --env GOOGLE_AI_API_KEY=your-google-api-key-here --env I18N_MCP_BASE_LANGUAGE=zh-TW --env I18N_MCP_TARGET_LANGUAGES=en-US,ja --env I18N_MCP_TRANSLATION_DIR=/absolute/path/to/your/translation/directory --env I18N_MCP_SRC_DIR=/absolute/path/to/your/project/src --env I18N_MCP_PROJECT_ROOT=/absolute/path/to/your/project -- npx -y i18n-mcp-translator
```

2. **Test with a sample file**:
    - Open a file with hardcoded Chinese text
    - Ask Claude to translate the file using the MCP tool
    - Check the generated translations and modified code

#### 4. CLI Testing (Direct Command)

For quick testing without MCP protocol:

```bash
# Test published version
npx -y i18n-mcp-translator \
    --api-key "your-google-api-key-here" \
    --base-language "zh-TW" \
    --target-languages "en-US,ja" \
    --translation-file "lang.json" \
    --dir "src/assets/locale" \
    --src-dir "/absolute/path/to/your/project/src" \
    --project-root "/absolute/path/to/your/project"

# Test local build (for development)
./build/index.js \
    --api-key "your-google-api-key-here" \
    --base-language "zh-TW" \
    --target-languages "en-US,ja" \
    --translation-file "lang.json" \
    --dir "src/assets/locale" \
    --src-dir "/absolute/path/to/your/project/src" \
    --project-root "/absolute/path/to/your/project"
```

### Configuration Parameters

| Parameter            | Environment Variable        | Description                      | Example             |
| -------------------- | --------------------------- | -------------------------------- | ------------------- |
| `--api-key`          | `GOOGLE_AI_API_KEY`         | Google AI API key                | `AIzaSyC...`        |
| `--base-language`    | `I18N_MCP_BASE_LANGUAGE`    | Source language                  | `zh-TW`             |
| `--target-languages` | `I18N_MCP_TARGET_LANGUAGES` | Comma-separated target languages | `en-US,ja,zh-CN`    |
| `--translation-file` | `I18N_MCP_TRANSLATION_FILE` | Translation file name            | `lang.json`         |
| `--dir`              | `I18N_MCP_TRANSLATION_DIR`  | Translation directory            | `src/assets/locale` |
| `--src-dir`          | `I18N_MCP_SRC_DIR`          | Source code directory            | `/path/to/src`      |
| `--project-root`     | `I18N_MCP_PROJECT_ROOT`     | Project root directory           | `/path/to/project`  |

### Debugging

#### Enable Debug Logs

The server outputs detailed logs to stderr. Key log patterns:

- `[CLI] Parsed target languages:` - Shows parsed CLI arguments
- `[TranslationConfigService] Translation configuration built successfully:` - Shows final config
- `[AI SERVICE] Constructor called with config:` - Shows AI service initialization
- `[AI SERVICE] Built translationsSchema:` - Shows schema sent to AI
- `AI Parsed Result:` - Shows AI response with translations

#### Common Issues

1. **Wrong languages generated**:
    - Check if using local build (`./build/index.js`) vs published version (`npx -y`)
    - Verify target languages are comma-separated: `"en-US,ja"` not `"en-US ja"`

2. **Translation directory not found**:
    - Ensure paths are absolute or relative to `--project-root`
    - Check directory permissions

3. **API key issues**:
    - Verify `GOOGLE_AI_API_KEY` is set correctly
    - Check API key permissions and quotas

#### Sample Test File

Create a test file with hardcoded Chinese:

```javascript
// test-component.js
export function TestComponent() {
    return (
        <div>
            <h1>結果頁顯示時機</h1>
            <p>答對題數</p>
            <input placeholder="題數" />
            <button>{count} 題(含)以上</button>
        </div>
    );
}
```

Expected output should replace Chinese text with i18n keys and generate translations for your configured target languages only.

## How it works

- The server receives a file and its content.
- It parses the code, finds hardcoded Traditional Chinese, and uses Google Gemini AI to:
    - Generate i18n keys (dot.case, context-aware)
    - Translate to English, Japanese, Simplified Chinese, and other configured languages
- Updates your translation JSON file(s) with all translations.
- Returns the refactored code and a summary.
- **On startup:**
    - Loads your language config from env/args
    - Discovers existing languages from translation files
    - Maps all configured languages to full info (code, name, etc)

## Translation File Management

### Flexible File Support

The MCP supports different translation file naming patterns:

- `lang.json` (default)
- `lang-editor.json`, `lang-client.json`, `lang-shared.json`
- Any custom JSON file name

### Configuration Options

```bash
# Specify exact file name
I18N_MCP_TRANSLATION_FILE=lang-editor.json

# Or use command line
--translation-file lang-client.json
```

### Auto-Discovery

If no specific file is configured, the MCP will:

1. Scan all `.json` files in the translation directory
2. Detect language structure (files with language codes as top-level keys)
3. Use the first valid translation file found
4. Create new files as needed

### Language Detection

The system automatically detects configured languages from existing translation files and supports:

- Common language codes: `zh-TW`, `zh-CN`, `en-US`, `ja-JP`, `ko-KR`, `pt-BR`, `es-419`, `th-TH`, etc.
- Fallback generation for unknown language codes

## License

ISC

## Author

Alan Chao
