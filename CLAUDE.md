# CLAUDE.md

本文件為 Claude Code (claude.ai/code) 在此儲存庫中工作時提供指引。

## 專案概覽

這是一個用於自動化原始碼檔案 i18n 翻譯的 MCP (Model Context Protocol) 伺服器。它會偵測硬編碼的繁體中文文字,使用 Google Gemini AI 生成 i18n 鍵值,並更新語言 JSON 檔案及翻譯內容。

## 基本指令

### 開發

- `npm run build` - 將 TypeScript 編譯到 build 目錄並設定執行權限
- `npm run build:watch` - 監看模式編譯
- `npm run typecheck` - 類型檢查而不輸出檔案
- `npm run start` - 使用 tsx 在本地執行伺服器
- `npm run watch` - 開發監看模式

### 測試與除錯

- `npm run inspector` - 使用 MCP inspector 執行除錯(需要在 .env 中設定 GOOGLE_AI_API_KEY)

## 架構

### 核心元件

**MCP 伺服器層** (`src/server/`)
- `mcp-server.ts` - 主要的 MCP 伺服器實作,使用 STDIO 傳輸
- `mcp-tools.ts` - 註冊並處理 MCP 工具定義

**翻譯引擎** (`src/core/`)
- `file-processor.ts` - 使用 Babel AST 解析處理原始檔案
- `ai-service.ts` - Google Gemini AI 整合,用於鍵值生成和翻譯
- `lang-manager.ts` - 管理語言 JSON 檔案操作
- `language-discovery-service.ts` - 從現有翻譯檔案中探索語言
- `translation-config-service.ts` - 建立並管理翻譯配置

**工具** (`src/tools/`)
- `translate-file.ts` - 處理個別檔案的主要工具
- `add-translations.ts` - 將翻譯新增到語言檔案的工具
- `generate-locale-diff.ts` - A1 工具,用於比較分支變更並生成差異檔案
- `merge-translations.ts` - 將審核過的翻譯合併回專案檔案的工具
- `cleanup-diff-directory.ts` - 合併操作後清理差異目錄的工具
- `git-commit-push.ts` - 用於 i18n 工作流程的獨立 git commit 和 push 操作

### 關鍵處理流程

1. **語言探索**: 掃描現有翻譯檔案以偵測已配置的語言
2. **檔案分析**: 使用 Babel parser 從原始碼建立 AST
3. **文字偵測**: 在 i18n 函數呼叫中識別硬編碼的繁體中文文字(`t()`, `i18n.t()`)
4. **AI 處理**: Google Gemini 生成符合上下文的 i18n 鍵值和翻譯
5. **程式碼轉換**: 用生成的鍵值替換硬編碼文字
6. **檔案更新**: 更新原始檔案和語言 JSON 檔案

### 配置

環境變數(也可以透過 CLI 參數傳遞):
- `GOOGLE_AI_API_KEY` - AI 翻譯必需
- `I18N_MCP_BASE_LANGUAGE` - 來源語言(預設: zh-TW)
- `I18N_MCP_TARGET_LANGUAGES` - 逗號分隔的目標語言
- `I18N_MCP_TRANSLATION_DIR` - 語言檔案目錄
- `I18N_MCP_TRANSLATION_FILE` - 特定翻譯檔案名稱(選用)
- `I18N_MCP_TRANSLATION_SUBDIRECTORY` - 翻譯目錄內的子目錄(選用,自動偵測)
- `I18N_MCP_SRC_DIR` - 原始碼目錄
- `I18N_MCP_PROJECT_ROOT` - 專案根目錄,用於路徑解析

### 翻譯檔案管理

MCP 翻譯器支援舊版和新版 i18n 檔案結構:

**舊版結構(單一檔案):**
- 單一 JSON 檔案: `lang.json`
- 巢狀語言物件,可選的 "translation" 包裝器
- 範例: `{"zh-TW": {"translation": {"key": "value"}}}`

**新版結構(每語言獨立檔案):**
- 每個語言分別的 JSON 檔案,可以是:
  - 直接在翻譯目錄中: `zh-TW.json`, `en-US.json`
  - 在子目錄中: `client/zh-TW.json`, `editor/zh-TW.json`
- 每個檔案的扁平鍵值結構: `{"key": "value"}`

**自動偵測邏輯:**
1. 檢查翻譯目錄中是否直接有每語言的 JSON 檔案(例如 `zh-TW.json`)
2. 若找到,使用新結構而不使用子目錄
3. 否則,檢查是否有包含每語言檔案的子目錄
4. 若找到,使用新結構與子目錄
5. 否則,使用舊版結構的單一巢狀檔案

**配置優先順序:**
1. 透過 `I18N_MCP_TRANSLATION_SUBDIRECTORY` 或 `--translation-subdirectory` 明確指定子目錄
2. 自動偵測翻譯目錄中的每語言檔案(**最常見**)
3. 自動偵測包含每語言檔案的子目錄
4. 透過 `I18N_MCP_TRANSLATION_FILE` 或 `--translation-file` 指定特定檔案(舊版)
5. 自動探索目錄中第一個有效的翻譯檔案
6. 根據需要建立新檔案/結構

**建議設定:**
對於大多數專案,只需設定 `I18N_MCP_TRANSLATION_DIR="./src/assets/locale"` 並讓系統自動偵測您的檔案結構。不需要額外配置!

### 路徑解析策略

伺服器處理絕對路徑和相對路徑:
- 使用 `projectRoot` 作為所有路徑解析的基礎
- 如果翻譯目錄不是絕對路徑,則相對於專案根目錄解析
- 處理跨平台路徑差異

## 可用的 MCP 工具

### 1. `translate-file` - 原始碼翻譯
- 掃描原始檔案中的硬編碼繁體中文文字
- 使用 AI 生成符合上下文的 i18n 鍵值
- 更新語言 JSON 檔案及翻譯
- 返回包含 i18n 鍵值的重構程式碼

### 1.5. `generate_locale_diff` - 比較分支變更 (A1)
- 比較當前分支與 master/main 分支,為翻譯團隊生成差異檔案
- **使用情境**: 在進行語言檔案變更後生成差異檔案,供翻譯團隊審核
- **參數**:
  - `localeDir`: 語言檔案目錄的路徑(例如 "src/assets/locale")
  - `projectRoot`: 專案根目錄(選用,預設為當前工作目錄)
  - `baseBranch`: 要比較的基礎分支(選用,自動偵測 master/main)
  - `mainLanguage`: 用於生成差異的主要語言代碼(預設: "zh-TW")
  - `dryRun`: 預覽模式,不建立檔案(預設: false)
  - `autoCommit`: 自動提交生成的差異檔案(預設: false)
  - `commitMessage`: 自訂提交訊息(選用,自動生成)
  - `autoPush`: 自動推送提交到遠端(預設: false)
  - `pushBranch`: 要推送到的分支(選用,預設為當前分支)
- **功能**:
  - 智慧偵測 master 與 main 分支
  - Git 整合以識別分支之間的精確變更
  - 識別新增、修改和刪除的翻譯鍵值
  - 為所有語言變體生成差異檔案
  - 主要語言顯示實際變更,其他語言顯示現有翻譯或空字串
  - 建立組織化的差異目錄結構供團隊審核

### 2. `merge_translations` - 合併審核過的翻譯
- 將審核過的翻譯檔案合併回專案翻譯檔案
- **使用情境**: 在利害關係人/主管審核翻譯後,整合核准的變更
- **參數**:
  - `originalDir`: 專案翻譯目錄的路徑(要更新的檔案)
  - `reviewedDir`: 審核過的翻譯目錄的路徑(來自利害關係人的審核檔案)
  - `dryRun`: 預覽變更而不修改檔案(預設: false)
  - `verbose`: 顯示每個翻譯鍵值的詳細變更(預設: false)
  - `projectRoot`: 用於路徑解析的專案根目錄(選用)
  - `cleanupDiffDirectory`: 成功合併後自動清理差異目錄(預設: false)
  - `autoCommit`: 自動提交合併的檔案(預設: false)
  - `commitMessage`: 自訂提交訊息(選用,自動生成)
  - `autoPush`: 自動推送提交到遠端(預設: false)
  - `pushBranch`: 要推送到的分支(選用,預設為當前分支)
- **功能**:
  - 透過語言代碼智慧檔案配對(en-US.json ↔ en-US.json)
  - 詳細統計(新增、更新、未變更的鍵值)
  - 安全的預演模式以預覽變更
  - 只更新實際變更的鍵值
  - 保留審核檔案中不存在的現有翻譯
  - 可選的合併後自動清理差異目錄

### 3. `cleanup_diff_directory` - 清理差異目錄
- 在翻譯合併後移除差異目錄及其所有內容
- **使用情境**: 在合併操作或手動審核後清理臨時差異檔案
- **參數**:
  - `diffDir`: 要移除的差異目錄路徑(例如 "src/assets/locale/diff")
  - `dryRun`: 預覽將被移除的內容而不刪除(預設: false)
  - `projectRoot`: 用於路徑解析的專案根目錄(選用)
- **功能**:
  - 安全移除差異目錄中的所有檔案
  - 預覽模式以查看將被移除的內容
  - 詳細的移除過程記錄
  - 對於缺少的目錄有優雅的錯誤處理

### 4. `git_commit_push` - Git 操作
- 用於 i18n 工作流程的獨立 git commit 和 push 操作
- **使用情境**: 使用標準化訊息提交和推送翻譯檔案
- **參數**:
  - `files`: 要提交的檔案路徑陣列(選用,若未提供則使用已暫存的檔案)
  - `commitMessage`: 自訂提交訊息(選用,自動生成)
  - `operationType`: 用於自動生成訊息的操作類型(預設: "i18n update")
  - `operationDetails`: 自動生成訊息的額外詳細資訊(選用)
  - `push`: 推送提交到遠端儲存庫(預設: false)
  - `branch`: 要推送到的分支(選用,預設為當前分支)
  - `projectRoot`: 專案根目錄(選用)
  - `dryRun`: 預覽模式,不執行命令(預設: false)
- **功能**:
  - 自動生成標準化的 i18n 提交訊息
  - 支援選擇性檔案提交或已暫存檔案提交
  - 整合推送功能與分支偵測
  - 全面的錯誤處理和驗證

### 5. 增強型翻譯工具
- `enhanced_translate_file` - 具有快取和最佳化的增強版本
- `batch_translate_files` - 批次處理多個檔案,支援並行處理

## 多專案支援

i18n MCP 翻譯器支援同時處理多個專案。每個專案可以有:
- 不同的翻譯檔案結構
- 不同的目標語言
- 不同的命名規範
- 獨立的配置

### 快速設定

在您的 MCP 配置檔案中為每個專案配置獨立的 MCP 伺服器實例:

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

### 文件

- **快速入門**: 參見 `docs/quick-start-multi-project.md` 以進行 5 分鐘設定
- **完整指南**: 參見 `docs/multi-project-setup.md` 以獲取完整文件
- **命名規範**: 參見 `docs/examples/` 以獲取命名指南範本和範例

### 專案特定的命名規範

在每個專案中建立 `docs/i18n-naming-guide.md` 以指導 AI 生成適當的 i18n 鍵值:

```markdown
# i18n Key Naming Convention

## Structure
{feature}.{page}.{element}.{action}

## Examples
user.profile.button.save
dashboard.analytics.chart.title
common.error.network
```

使用翻譯器時,參考您的命名指南以生成一致的鍵值。

## 開發注意事項

- 為 Node.js v22+ 建置,使用 ES modules
- 使用啟用嚴格模式的 TypeScript
- Babel AST 操作以實現精確的程式碼轉換
- Prettier 整合以在轉換後進行程式碼格式化
- 本地優先的語言管理(無外部 API 依賴)
- 從現有翻譯檔案自動偵測語言
- 強健的語言配置回退系統
- **多專案支援** - 同時處理多個專案
