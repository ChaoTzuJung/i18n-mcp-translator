# i18n-mcp-translator

A Model Context Protocol (MCP) server for automatic i18n translation of source code files.  
It scans your codebase for hardcoded Traditional Chinese text, generates i18n keys, updates a language JSON file, and returns the refactored code.

## Features

- Detects hardcoded Traditional Chinese text in source files.
- Generates structured i18n keys and translations (English, Japanese, Simplified Chinese).
- Updates a centralized `lang.json` file.
- Returns modified code with i18n keys.
- Powered by Google Gemini AI.
- **NEW:** Auto-detects supported languages from OneSky API on startup.
- **NEW:** Caches OneSky locale data for 24 hours (memory + file cache).
- **NEW:** Full language info mapping (code, local/english name, region, etc) for all configured languages.
- **NEW:** Robust fallback/override: always uses your config, but validates and enriches with OneSky data.
- **NEW:** Graceful fallback to local mock data if OneSky API fails.

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

### 2. OneSky API Key (optional, for auto language detection)

If you want to auto-detect and validate languages from OneSky, set:

```bash
export ONESKY_API_KEY=your-onesky-api-key
export ONESKY_API_SECRET=your-onesky-api-secret
```

If not set, the server will use local mock data and still work.

### 3. Download and configure `.mcp.json`

- Download the sample `.mcp.json` from this repository or your MCP client.
- Place it in your home directory: `~/.cursor/mcp.json`
- Make sure the `GOOGLE_AI_API_KEY` is set in the `i18n-mcp-translator` section:

```json
"i18n-mcp-translator": {
  "command": "node",
  "args": ["/absolute/path/to/i18n-mcp-translator/build/index.js"],
  "env": {
    "GOOGLE_AI_API_KEY": "your-google-api-key-here",
    "ONESKY_API_KEY": "your-onesky-api-key",
    "ONESKY_API_SECRET": "your-onesky-api-secret",
    "I18N_MCP_BASE_LANGUAGE": "zh-TW",
    "I18N_MCP_TARGET_LANGUAGES": "zh-TW,zh-CN,zh-HK,en-US,ja,pt-BR,es-419,th-TH",
    "I18N_MCP_TRANSLATION_DIR": "/absolute/path/to/your/translation/dir",
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
        "/Users/fever_alanchao/feversocial/i18n-mcp-translator/build/index.js",
        "--api-key", "your-google-api-key-here",
        "--base-language", "zh-TW",
        "--target-languages", "zh-TW,zh-CN,zh-HK,en-US,ja,pt-BR,es-419,th-TH",
        "--dir", "/absolute/path/to/your/translation/dir",
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

- The tool will scan for hardcoded Chinese, replace with i18n keys, and update `src/assets/locale/lang.json`.
- The response includes a summary and the modified code.

## How it works

- The server receives a file and its content.
- It parses the code, finds hardcoded Traditional Chinese, and uses Google Gemini AI to:
    - Generate i18n keys (dot.case, context-aware)
    - Translate to English, Japanese, Simplified Chinese
- Updates `src/assets/locale/lang.json` with all translations.
- Returns the refactored code and a summary.
- **On startup:**
    - Loads your language config from env/args
    - Fetches all supported locales from OneSky (if API key present)
    - Caches locale data for 24h (memory + file)
    - Maps all configured languages to full info (code, name, etc)
    - If OneSky API fails, uses local fallback data
    - Always respects your config, but warns if a language is not found in OneSky

## Advanced: Caching & Fallback

- **Cache file:** `.cache/onesky-locales.json` (auto-created)
- **Cache duration:** 24 hours
- **Fallback:** If OneSky API or cache fails, uses built-in mock data
- **Your config always wins:** You can specify any language codes; the system will try to enrich with OneSky info, but never blocks your workflow

## License

ISC

## Author

Alan Chao
