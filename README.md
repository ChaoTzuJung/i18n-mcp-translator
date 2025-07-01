# i18n-mcp-translator

A Model Context Protocol (MCP) server for automatic i18n translation of source code files.  
It scans your codebase for hardcoded Traditional Chinese text, generates i18n keys, updates a language JSON file, and returns the refactored code.

## Features

- Detects hardcoded Traditional Chinese text in source files.
- Generates structured i18n keys and translations (English, Japanese, Simplified Chinese).
- Updates a centralized `lang.json` file.
- Returns modified code with i18n keys.
- Powered by Google Gemini AI.

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

### 2. Download and configure `.mcp.json`

- Download the sample `.mcp.json` from this repository or your MCP client.
- Place it in your home directory: `~/.cursor/mcp.json`
- Make sure the `GOOGLE_AI_API_KEY` is set in the `i18n-mcp-translator` section:

```json
"i18n-mcp-translator": {
  "command": "node",
  "args": ["/absolute/path/to/build/index.js"],
  "env": {
    "GOOGLE_AI_API_KEY": "your-google-api-key-here"
  }
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

## License

ISC

## Author

Alan Chao
