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
  "command": "node",
  "args": ["/absolute/path/to/i18n-mcp-translator/build/index.js"],
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
      "command": "node",
      "args": [
        "/absolute/path/to/i18n-mcp-translator/build/index.js",
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

### Using the Translation Tool

You can call the `translate-file` tool via MCP protocol.  
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

1. **Configure your MCP client** (`.cursor/mcp.json` or similar):

```json
{
    "i18n-mcp-translator": {
        "command": "node",
        "args": [
            "/absolute/path/to/i18n-mcp-translator/build/index.js",
            "--api-key",
            "your-google-api-key-here",
            "--base-language",
            "zh-TW",
            "--target-languages",
            "en-US,ja",
            "--translation-file",
            "lang.json",
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
