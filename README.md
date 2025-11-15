# i18n-mcp-translator

一個基於 Model Context Protocol (MCP) 的自動化 i18n (國際化) 翻譯伺服器，用於處理原始碼檔案。
它會掃描您的程式碼庫中的硬編碼繁體中文文字，生成 i18n 鍵值，更新語言 JSON 檔案，並返回重構後的程式碼。

## 功能特色

- 偵測原始碼檔案中的硬編碼繁體中文文字
- 生成結構化的 i18n 鍵值和翻譯（英文、日文、簡體中文）
- **同時支援 `t()` 函式呼叫和 `<Trans>` 元件** - 適用於 JSX 中的 `i18nKey` 屬性
- **彈性的翻譯檔案支援** - 適用於任何 JSON 檔案名稱（lang.json、lang-editor.json 等）
- **自動探索** - 掃描現有翻譯檔案以偵測已配置的語言
- **本地優先** - 語言管理不需要外部 API 依賴
- **多專案支援** - 同時配置和處理多個專案
- 返回包含 i18n 鍵值的修改後程式碼
- 由 Google Gemini AI 驅動
- 為所有已配置的語言提供完整的語言資訊對應（代碼、本地/英文名稱、地區等）

## 系統需求

- **Node.js** v22.0.0 或以上版本
- **Google Generative AI API Key** (`GOOGLE_AI_API_KEY`)
- 相容 MCP 的客戶端（或搭配 [TaskMaster AI](https://www.npmjs.com/package/task-master-ai) 或類似工具使用）

## 快速入門

🚀 **第一次使用？** 查看我們的快速入門指南：

- **📖 [5 分鐘快速入門](docs/quick-start.md)** - 基本設定和第一個翻譯
- **📖 [多專案快速入門](docs/quick-start-multi-project.md)** - 同時處理多個專案
- **🧪 [測試應用程式](examples/test-app/)** - 包含範例元件的現成測試專案

這些指南會帶您完成設定並測試您的第一個翻譯！

## 安裝

```bash
git clone https://github.com/ChaoTzuJung/i18n-mcp-translator.git
cd i18n-mcp-translator
npm install
npm run build
npm run start
```

## 配置設定

### 1. 設定您的 Google AI API Key

在專案根目錄建立 `.env` 檔案：

GOOGLE_AI_API_KEY=your-google-api-key-here

或在 shell 中匯出：

```bash
export GOOGLE_AI_API_KEY=your-google-api-key-here
```

如果未設定，伺服器將使用本地模擬資料並仍可正常運作。

### 2. 下載並配置 `.mcp.json`

- 從此儲存庫或您的 MCP 客戶端下載範例 `.mcp.json`
- 將其放置在您的主目錄中：`~/.cursor/mcp.json`
- 確保在 `i18n-mcp-translator` 區段中設定了 `GOOGLE_AI_API_KEY`：

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

或使用以下命令來啟動 MCP 伺服器：

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

## 使用方式

### 啟動 MCP 伺服器

```bash
npm start
```

或直接執行：

```bash
npx tsx src/index.ts
```

伺服器將在 stdio 上執行並等待 MCP 請求。

### 可用的 MCP 工具

#### 1. `translate-file` - 原始碼翻譯

您可以透過 MCP 協定呼叫 `translate-file` 工具來翻譯原始碼檔案中的硬編碼中文文字。

範例請求：

```json
{
    "tool": "translate-file",
    "params": {
        "filePath": "src/components/YourComponent.tsx",
        "fileContent": "// your source code here"
    }
}
```

- 此工具將掃描硬編碼的中文文字，替換為 i18n 鍵值，並更新您的翻譯 JSON 檔案
- 回應包含摘要和修改後的程式碼

#### 1.5. `generate_locale_diff` - 比較分支變更

比較當前分支與 master/main 分支，生成供翻譯團隊審查的差異檔案。此工具會自動偵測您的儲存庫使用的是 master 或 main 分支。

範例請求：

```json
{
    "tool": "generate_locale_diff",
    "params": {
        "localeDir": "src/assets/locale",
        "projectRoot": "/path/to/your/project",
        "baseBranch": "master",
        "mainLanguage": "zh-TW"
    }
}
```

**參數說明：**

- `localeDir` - 語言檔案目錄的路徑（例如 "src/assets/locale"）
- `projectRoot` - 專案根目錄（選填，預設為當前工作目錄）
- `baseBranch` - 要比較的基礎分支（選填，自動偵測 master/main）
- `mainLanguage` - 用於生成差異的主要語言代碼（預設："zh-TW"）

**使用情境：**

1. 開發者在功能分支上對語言檔案進行修改
2. 使用 `generate_locale_diff` 與 master/main 分支進行比較
3. 工具自動偵測並處理所有子目錄（例如 `editor/`、`client/`）
4. 工具在 `src/assets/locale/diff/` 目錄中生成差異檔案，保留子目錄結構
5. 與翻譯團隊分享差異檔案進行審查
6. 審查後，使用 `merge_translations` 將變更整合回專案
7. 如需提交並推送差異檔案，可使用 `git_commit_push` 工具

**功能特色：**

- 🌿 **智慧分支偵測**：自動偵測儲存庫使用 master 或 main 分支
- 🔍 **Git 整合**：使用 `git diff` 識別分支間的確切變更
- 📊 **變更分析**：識別新增、修改和刪除的翻譯鍵值
- 🌐 **多語言支援**：為所有語言變體生成差異檔案
- 📁 **多子目錄支援**：一次自動處理多個子目錄（例如 `editor/`、`client/`）
- 🗂️ **結構保留**：在生成的差異檔案中維持子目錄結構
- 📝 **智慧內容**：主要語言顯示實際變更，其他語言顯示現有翻譯或空字串

#### 2. `merge_translations` - 合併已審查的翻譯

將已審查的翻譯檔案合併回專案的原始翻譯檔案。這非常適合整合經過利害關係人審查和核准的翻譯。

範例請求：

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

**參數說明：**

- `originalDir` - 專案翻譯目錄的路徑（要更新的檔案）
- `reviewedDir` - 已審查翻譯目錄的路徑（來自利害關係人的已審查檔案）
- `dryRun` - 預覽變更而不修改檔案（預設：false）
- `verbose` - 顯示每個翻譯鍵值的詳細變更（預設：false）
- `projectRoot` - 用於路徑解析的專案根目錄（選填）
- `cleanupDiffDirectory` - 成功合併後自動清理（移除）差異目錄（預設：false）

**使用情境：**

1. 匯出翻譯檔案給利害關係人審查
2. 利害關係人在單獨的目錄中審查和修改翻譯（例如 `diff/` 資料夾）
3. 使用 `merge_translations` 將核准的變更整合回您的專案
4. 選擇性地在成功合併後清理差異目錄
5. 自動處理新鍵值、更新的翻譯，並保留未變更的內容

**功能特色：**

- 🔍 **智慧比對**：自動比對語言檔案（en-US.json ↔ en-US.json）
- 📊 **詳細報告**：顯示新增、更新和未變更鍵值的統計資訊
- 🛡️ **安全操作**：試運行模式可在套用變更前預覽
- 🎯 **選擇性更新**：僅修改實際變更的鍵值
- 📝 **完整記錄**：使用選填的詳細輸出追蹤所有變更
- 🧹 **自動清理**：選擇性地在成功合併後移除差異目錄
- 🔧 **Git 整合**：選填的自動提交和推送已合併的翻譯檔案

#### 3. `cleanup_diff_directory` - 清理差異目錄

在翻譯合併操作後移除差異目錄及其所有內容。當您想單獨清理暫存差異檔案，或在合併期間未啟用自動清理時，此工具非常有用。

範例請求：

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

**參數說明：**

- `diffDir` - 要移除的差異目錄路徑（例如 "src/assets/locale/diff"）
- `dryRun` - 預覽將被移除的內容而不實際刪除（預設：false）
- `projectRoot` - 用於路徑解析的專案根目錄（選填）

**使用情境：**

1. 手動審查合併結果後，清理剩餘的差異檔案
2. 當合併期間未啟用自動清理時移除差異目錄
3. 清理失敗的合併嘗試或部分差異目錄
4. 透過移除暫存翻譯檔案來維護乾淨的專案結構

**功能特色：**

- 🗑️ **安全移除**：移除差異目錄中的所有檔案和目錄本身
- 🔍 **預覽模式**：試運行選項可查看將被移除的內容
- 📊 **詳細記錄**：顯示每個正在移除的檔案及進度指示器
- 🛡️ **錯誤處理**：妥善處理遺失的目錄或權限問題

#### 4. `git_commit_push` - Git 操作

提交並選擇性地推送檔案到 git 儲存庫，使用針對 i18n 優化的工作流程。此工具提供獨立的 git 操作，可以單獨使用或與其他 i18n 工具結合使用。

範例請求：

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

**參數說明：**

- `files` - 要新增和提交的檔案路徑陣列（選填，如未提供則提交所有已暫存的檔案）
- `commitMessage` - 自訂提交訊息（選填，如未提供則自動生成）
- `operationType` - 自動生成提交訊息的操作類型（預設："i18n update"）
- `operationDetails` - 自動生成提交訊息的額外細節（選填）
- `push` - 將提交推送到遠端儲存庫（預設：false）
- `branch` - 要推送到的分支（選填，預設為當前分支）
- `projectRoot` - 專案根目錄（選填，預設為當前工作目錄）
- `dryRun` - 預覽模式，不執行 git 命令（預設：false）

**使用情境：**

1. 手動編輯後提交特定的翻譯檔案
2. 在團隊中建立標準化的 i18n 提交訊息
3. 自動化翻譯更新的 git 工作流程
4. 使用一致的訊息批次提交多個語言檔案

**功能特色：**

- 📝 **智慧提交訊息**：自動生成標準化的 i18n 提交訊息
- 🎯 **選擇性提交**：僅提交特定檔案或使用已暫存的檔案
- 🚀 **推送整合**：選擇性地直接推送提交到遠端
- 🌿 **分支感知**：自動偵測當前分支或使用自訂分支
- 🔍 **預覽模式**：試運行以查看將被提交/推送的內容
- 🛡️ **錯誤處理**：妥善處理 git 錯誤和邊緣情況

## 開發與測試

### 本地測試 MCP 伺服器

#### 1. 建置並本地測試

```bash
# 建置專案
npm run build

# 使用本地建置進行測試（建議用於開發）
./build/index.js \
    --api-key "your-google-api-key-here" \
    --base-language "zh-TW" \
    --target-languages "en-US,ja" \
    --translation-file "lang.json" \
    --dir "src/assets/locale" \
    --src-dir "/absolute/path/to/your/project/src" \
    --project-root "/absolute/path/to/your/project"
```

#### 2. 使用 MCP Inspector（推薦）

MCP Inspector 提供了一個 Web UI 來測試 MCP 伺服器：

```bash
# 全域安裝 MCP Inspector
npm install -g @modelcontextprotocol/inspector

# 使用您的本地建置執行
npx @modelcontextprotocol/inspector ./build/index.js \
    --api-key "your-google-api-key-here" \
    --base-language "zh-TW" \
    --target-languages "en-US,ja" \
    --translation-file "lang.json" \
    --dir "src/assets/locale" \
    --src-dir "/absolute/path/to/your/project/src" \
    --project-root "/absolute/path/to/your/project"
```

這將開啟一個網頁介面，您可以：

- 檢視可用的工具（`translate-file`）
- 使用範例資料測試工具呼叫
- 檢視伺服器日誌和除錯輸出
- 檢查 MCP 協定訊息

#### 3. 使用 Claude Code 測試

如果您正在使用 Claude Code (claude.ai/code)：

1. **配置您的 MCP 客戶端**

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
claude mcp add --transport stdio i18n-mcp-translator --scope project --env GOOGLE_AI_API_KEY=your-google-api-key-here --env I18N_MCP_BASE_LANGUAGE=zh-TW --env I18N_MCP_TARGET_LANGUAGES=en-US,ja --env I18N_MCP_TRANSLATION_DIR=/absolute/path/to/your/translation/directory --env I18N_MCP_SRC_DIR=/absolute/path/to/your/project/src --env I18N_MCP_PROJECT_ROOT=/absolute/path/to/your/project -- npx -y i18n-mcp-translator
```

2. **使用範例檔案測試**：
    - 開啟一個包含硬編碼中文文字的檔案
    - 要求 Claude 使用 MCP 工具翻譯該檔案
    - 檢查生成的翻譯和修改後的程式碼

#### 4. CLI 測試（直接命令）

快速測試而無需 MCP 協定：

```bash
# 測試已發布的版本
npx -y i18n-mcp-translator \
    --api-key "your-google-api-key-here" \
    --base-language "zh-TW" \
    --target-languages "en-US,ja" \
    --translation-file "lang.json" \
    --dir "src/assets/locale" \
    --src-dir "/absolute/path/to/your/project/src" \
    --project-root "/absolute/path/to/your/project"

# 測試本地建置（用於開發）
./build/index.js \
    --api-key "your-google-api-key-here" \
    --base-language "zh-TW" \
    --target-languages "en-US,ja" \
    --translation-file "lang.json" \
    --dir "src/assets/locale" \
    --src-dir "/absolute/path/to/your/project/src" \
    --project-root "/absolute/path/to/your/project"
```

### 配置參數

| 參數                 | 環境變數                    | 說明                   | 範例                |
| -------------------- | --------------------------- | ---------------------- | ------------------- |
| `--api-key`          | `GOOGLE_AI_API_KEY`         | Google AI API 金鑰     | `AIzaSyC...`        |
| `--base-language`    | `I18N_MCP_BASE_LANGUAGE`    | 來源語言               | `zh-TW`             |
| `--target-languages` | `I18N_MCP_TARGET_LANGUAGES` | 逗號分隔的目標語言列表 | `en-US,ja,zh-CN`    |
| `--translation-file` | `I18N_MCP_TRANSLATION_FILE` | 翻譯檔案名稱           | `lang.json`         |
| `--dir`              | `I18N_MCP_TRANSLATION_DIR`  | 翻譯目錄               | `src/assets/locale` |
| `--src-dir`          | `I18N_MCP_SRC_DIR`          | 原始碼目錄             | `/path/to/src`      |
| `--project-root`     | `I18N_MCP_PROJECT_ROOT`     | 專案根目錄             | `/path/to/project`  |

### 除錯

#### 啟用除錯日誌

伺服器會將詳細日誌輸出到 stderr。關鍵日誌模式：

- `[CLI] Parsed target languages:` - 顯示解析的 CLI 參數
- `[TranslationConfigService] Translation configuration built successfully:` - 顯示最終配置
- `[AI SERVICE] Constructor called with config:` - 顯示 AI 服務初始化
- `[AI SERVICE] Built translationsSchema:` - 顯示發送到 AI 的架構
- `AI Parsed Result:` - 顯示帶有翻譯的 AI 回應

#### 常見問題

1. **生成了錯誤的語言**：
    - 檢查是否使用本地建置（`./build/index.js`）與已發布版本（`npx -y`）
    - 驗證目標語言是否以逗號分隔：`"en-US,ja"` 而非 `"en-US ja"`

2. **找不到翻譯目錄**：
    - 確保路徑是絕對路徑或相對於 `--project-root`
    - 檢查目錄權限

3. **API 金鑰問題**：
    - 驗證 `GOOGLE_AI_API_KEY` 是否正確設定
    - 檢查 API 金鑰的權限和配額

#### 範例測試檔案

建立一個包含硬編碼中文的測試檔案：

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

預期輸出應該將中文文字替換為 i18n 鍵值，並僅為您配置的目標語言生成翻譯。

## 運作原理

- 伺服器接收一個檔案及其內容
- 它解析程式碼，尋找硬編碼的繁體中文，並使用 Google Gemini AI 來：
    - 生成 i18n 鍵值（點號分隔、具備上下文感知）
    - 翻譯成英文、日文、簡體中文和其他已配置的語言
- 支援函式呼叫和 JSX 元件：
    - **函式呼叫**：`t('硬編碼文字')`、`i18n.t('硬編碼文字')`
    - **Trans 元件**：`<Trans i18nKey="硬編碼文字" />`
- 使用所有翻譯更新您的翻譯 JSON 檔案
- 返回重構後的程式碼和摘要
- **啟動時：**
    - 從環境變數/參數載入您的語言配置
    - 從翻譯檔案中探索現有語言
    - 將所有已配置的語言對應到完整資訊（代碼、名稱等）

## 翻譯檔案管理

### 彈性的檔案支援

MCP 支援不同的翻譯檔案命名模式：

- `lang.json`（預設）
- `lang-editor.json`、`lang-client.json`、`lang-shared.json`
- 任何自訂的 JSON 檔案名稱

### 配置選項

```bash
# 指定確切的檔案名稱
I18N_MCP_TRANSLATION_FILE=lang-editor.json

# 或使用命令列
--translation-file lang-client.json
```

### 自動探索

如果未配置特定檔案，MCP 將：

1. 掃描翻譯目錄中的所有 `.json` 檔案
2. 偵測語言結構（以語言代碼作為頂層鍵值的檔案）
3. 使用找到的第一個有效翻譯檔案
4. 根據需要建立新檔案

### 語言偵測

系統會自動從現有翻譯檔案中偵測已配置的語言，並支援：

- 常見的語言代碼：`zh-TW`、`zh-CN`、`en-US`、`ja-JP`、`ko-KR`、`pt-BR`、`es-419`、`th-TH` 等
- 未知語言代碼的後備生成

## 多專案支援

i18n MCP 翻譯器可以同時處理多個專案。每個專案可以有自己的配置、命名規範和目標語言。

### 快速設定

為每個專案配置單獨的 MCP 伺服器實例：

```json
{
  "mcpServers": {
    "i18n-new-canvas-admin": {
      "command": "npx",
      "args": ["-y", "i18n-mcp-translator"],
      "env": {
        "GOOGLE_AI_API_KEY": "your-api-key",
        "I18N_MCP_BASE_LANGUAGE": "zh-TW",
        "I18N_MCP_TARGET_LANGUAGES": "zh-TW,en-US,ja,zh-CN",
        "I18N_MCP_TRANSLATION_DIR": "/path/to/new-canvas-admin/src/assets/locale",
        "I18N_MCP_PROJECT_ROOT": "/path/to/new-canvas-admin"
      }
    },
    "i18n-fever-tool": {
      "command": "npx",
      "args": ["-y", "i18n-mcp-translator"],
      "env": {
        "GOOGLE_AI_API_KEY": "your-api-key",
        "I18N_MCP_BASE_LANGUAGE": "zh-TW",
        "I18N_MCP_TARGET_LANGUAGES": "zh-TW,en-US",
        "I18N_MCP_TRANSLATION_DIR": "/path/to/fever-tool/src/locale",
        "I18N_MCP_PROJECT_ROOT": "/path/to/fever-tool"
      }
    },
    "i18n-form": {
      "command": "npx",
      "args": ["-y", "i18n-mcp-translator"],
      "env": {
        "GOOGLE_AI_API_KEY": "your-api-key",
        "I18N_MCP_BASE_LANGUAGE": "zh-TW",
        "I18N_MCP_TARGET_LANGUAGES": "zh-TW,en-US",
        "I18N_MCP_TRANSLATION_DIR": "/path/to/form/src/locale",
        "I18N_MCP_PROJECT_ROOT": "/path/to/form"
      }
    }
  }
}
```

### 優勢

- ✅ **專案隔離** - 每個專案都有獨立的配置
- ✅ **無衝突** - 每個專案可使用不同的命名規範
- ✅ **彈性語言** - 每個專案可以針對不同的語言
- ✅ **自動偵測** - Claude Code 自動選擇正確的伺服器

### 文件

- **快速入門**：[docs/quick-start-multi-project.md](docs/quick-start-multi-project.md) - 5 分鐘設定指南
- **完整指南**：[docs/multi-project-setup.md](docs/multi-project-setup.md) - 完整文件
- **命名範本**：[docs/examples/](docs/examples/) - i18n 鍵值命名規範的範本和範例

### 專案特定的命名規範

在每個專案中建立命名指南（例如 `docs/i18n-naming-guide.md`）：

```markdown
# i18n Key Naming Convention

## Structure
{feature}.{page}.{element}.{action}

## Examples
user.profile.button.save
dashboard.analytics.chart.title
common.error.network
```

在使用翻譯器時參考此指南，以確保鍵值生成的一致性。

## 授權

ISC

## 作者

Alan Chao
