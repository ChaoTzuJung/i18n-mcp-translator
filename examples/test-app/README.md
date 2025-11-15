# i18n MCP Translator - 測試應用程式

這是一個用於測試 **i18n MCP Translator** 功能的範例專案。包含多個 React 元件，展示不同類型的硬編碼中文文字場景。

## 📁 專案結構

```
test-app/
├── src/
│   ├── components/
│   │   ├── Button.tsx          # 簡單按鈕元件（基本測試）
│   │   ├── Form.tsx             # 表單元件（複雜表單欄位）
│   │   └── Dashboard.tsx        # 儀表板元件（大型複雜 UI）
│   └── assets/
│       └── locale/
│           ├── zh-TW.json       # 繁體中文翻譯
│           ├── en-US.json       # 英文翻譯
│           └── ja.json          # 日文翻譯
├── .cursor/
│   └── mcp.json                 # MCP 配置檔案（Cursor）
├── .env.example                 # 環境變數範本
├── package.json
└── README.md                    # 本檔案
```

## 🚀 快速開始

### 步驟 1：配置 MCP 伺服器

#### 選項 A：使用 Cursor

1. **複製 MCP 配置檔案**：
   ```bash
   # 在此目錄中已經有 .cursor/mcp.json
   # 編輯它並更新路徑
   ```

2. **更新絕對路徑**：

   編輯 `.cursor/mcp.json`，將所有路徑替換為此專案的絕對路徑：
   ```json
   {
     "mcpServers": {
       "i18n-mcp-translator": {
         "command": "npx",
         "args": ["-y", "i18n-mcp-translator"],
         "env": {
           "GOOGLE_AI_API_KEY": "your-google-api-key-here",
           "I18N_MCP_BASE_LANGUAGE": "zh-TW",
           "I18N_MCP_TARGET_LANGUAGES": "zh-TW,en-US,ja",
           "I18N_MCP_TRANSLATION_DIR": "/absolute/path/to/this/test-app/src/assets/locale",
           "I18N_MCP_SRC_DIR": "/absolute/path/to/this/test-app/src",
           "I18N_MCP_PROJECT_ROOT": "/absolute/path/to/this/test-app"
         }
       }
     }
   }
   ```

3. **取得絕對路徑**：
   ```bash
   # 在此目錄中執行：
   pwd
   # 輸出範例：/Users/yourname/projects/i18n-mcp-translator/examples/test-app

   # 然後更新 mcp.json 中的路徑：
   # "I18N_MCP_TRANSLATION_DIR": "/Users/yourname/projects/i18n-mcp-translator/examples/test-app/src/assets/locale"
   # "I18N_MCP_SRC_DIR": "/Users/yourname/projects/i18n-mcp-translator/examples/test-app/src"
   # "I18N_MCP_PROJECT_ROOT": "/Users/yourname/projects/i18n-mcp-translator/examples/test-app"
   ```

4. **設定 API Key**：

   將 `your-google-api-key-here` 替換為您的實際 Google AI API Key
   - 前往 [Google AI Studio](https://aistudio.google.com/app/apikey) 取得 API Key

#### 選項 B：使用 Claude Code

使用 CLI 命令配置（記得先獲取此目錄的絕對路徑）：

```bash
# 先獲取絕對路徑
TESTAPP_PATH=$(pwd)

# 使用 Claude Code CLI 新增 MCP 伺服器
claude mcp add --transport stdio i18n-mcp-translator \
  --scope project \
  --env GOOGLE_AI_API_KEY=your-google-api-key-here \
  --env I18N_MCP_BASE_LANGUAGE=zh-TW \
  --env I18N_MCP_TARGET_LANGUAGES=zh-TW,en-US,ja \
  --env I18N_MCP_TRANSLATION_DIR=$TESTAPP_PATH/src/assets/locale \
  --env I18N_MCP_SRC_DIR=$TESTAPP_PATH/src \
  --env I18N_MCP_PROJECT_ROOT=$TESTAPP_PATH \
  -- npx -y i18n-mcp-translator
```

### 步驟 2：重新啟動編輯器

重新啟動 Cursor 或 Claude Code 以載入 MCP 配置。

### 步驟 3：測試翻譯功能

#### 測試 1：簡單按鈕（初學者）

1. **開啟檔案**：`src/components/Button.tsx`
2. **詢問 Claude**：
   ```
   Please use i18n MCP to translate the hardcoded Chinese text in this file
   ```
3. **預期結果**：
   - 按鈕文字被替換為 `t('...')` 呼叫
   - 翻譯檔案被更新
   - 生成的 i18n 鍵值類似：
     - `button.save`
     - `button.cancel`
     - `button.delete`

#### 測試 2：表單元件（中級）

1. **開啟檔案**：`src/components/Form.tsx`
2. **詢問 Claude**：
   ```
   Please translate all Chinese text in this form component using i18n MCP
   ```
3. **預期結果**：
   - 標籤、placeholder、錯誤訊息都被翻譯
   - 生成的 i18n 鍵值類似：
     - `form.registration.title`
     - `form.registration.username.label`
     - `form.registration.username.placeholder`
     - `form.registration.error.required`

#### 測試 3：儀表板（進階）

1. **開啟檔案**：`src/components/Dashboard.tsx`
2. **詢問 Claude**：
   ```
   Please translate this dashboard component using i18n MCP. Pay attention to maintaining the component structure.
   ```
3. **預期結果**：
   - 所有中文文字被翻譯
   - 表格標題、統計卡片、通知訊息等都正確處理
   - 生成的 i18n 鍵值類似：
     - `dashboard.title`
     - `dashboard.stats.totalUsers`
     - `dashboard.table.header.name`

### 步驟 4：驗證翻譯結果

1. **檢查翻譯檔案**：
   ```bash
   cat src/assets/locale/zh-TW.json
   cat src/assets/locale/en-US.json
   cat src/assets/locale/ja.json
   ```

2. **驗證重構後的程式碼**：
   - 開啟元件檔案
   - 確認中文文字被替換為 `t('...')` 呼叫
   - 確認程式碼結構保持完整

3. **檢查翻譯品質**：
   - 英文翻譯是否準確？
   - 日文翻譯是否自然？
   - i18n 鍵值是否語義化且易讀？

## 📋 測試檢查清單

使用此檢查清單驗證 i18n MCP Translator 的所有功能：

- [ ] **基本翻譯**
  - [ ] 簡單文字被正確替換為 `t()` 呼叫
  - [ ] 翻譯檔案被正確更新
  - [ ] 生成了 zh-TW、en-US、ja 三種語言

- [ ] **i18n 鍵值品質**
  - [ ] 鍵值使用點號分隔（例如：`button.save`）
  - [ ] 鍵值語義化且易讀
  - [ ] 鍵值遵循階層結構

- [ ] **翻譯品質**
  - [ ] 英文翻譯準確
  - [ ] 日文翻譯自然
  - [ ] 保留原始語義

- [ ] **程式碼品質**
  - [ ] 程式碼結構保持完整
  - [ ] 格式正確（縮排、換行）
  - [ ] TypeScript 類型保留

- [ ] **不同場景**
  - [ ] 按鈕文字
  - [ ] 表單標籤
  - [ ] Placeholder
  - [ ] 錯誤訊息
  - [ ] 表格標題
  - [ ] 通知訊息

## 🧪 進階測試

### 測試：生成翻譯差異檔

1. **修改翻譯檔案**（模擬功能分支）：
   ```bash
   # 手動編輯 src/assets/locale/zh-TW.json，新增一些鍵值
   ```

2. **生成差異檔**：
   詢問 Claude：
   ```
   Generate locale diff comparing my current changes
   ```

3. **驗證差異檔**：
   ```bash
   ls -la src/assets/locale/diff/
   cat src/assets/locale/diff/zh-TW.json
   ```

### 測試：合併審核後的翻譯

1. **模擬審核過的翻譯**：
   ```bash
   # 編輯 src/assets/locale/diff/en-US.json
   # 修改一些翻譯
   ```

2. **合併翻譯**：
   詢問 Claude：
   ```
   Merge the reviewed translations from locale/diff/ back to the original files with verbose output
   ```

3. **驗證合併結果**：
   ```bash
   cat src/assets/locale/en-US.json
   # 確認修改已合併
   ```

## 🐛 疑難排解

### 問題：MCP 工具找不到

**解決方案**：
1. 確認 MCP 配置檔案路徑正確
2. 確認 API Key 正確設定
3. 重新啟動編輯器
4. 詢問 Claude：`Can you list the available MCP tools?`

### 問題：找不到翻譯目錄

**解決方案**：
1. 確認路徑是絕對路徑
2. 確認目錄存在：
   ```bash
   ls -la src/assets/locale/
   ```
3. 檢查目錄權限

### 問題：生成了錯誤的語言

**解決方案**：
1. 檢查 `I18N_MCP_TARGET_LANGUAGES` 設定
2. 確保格式正確：`zh-TW,en-US,ja`（無空格）
3. 重新啟動編輯器

### 問題：翻譯品質不佳

**解決方案**：
1. 提供更多上下文給 Claude
2. 建立專案特定的命名指南（參考 `../../docs/examples/`）
3. 使用更具體的提示詞

## 📚 相關文件

- **快速入門指南**：[../../docs/quick-start.md](../../docs/quick-start.md)
- **多專案設定**：[../../docs/quick-start-multi-project.md](../../docs/quick-start-multi-project.md)
- **完整文件**：[../../README.md](../../README.md)
- **命名規範範本**：[../../docs/examples/i18n-naming-guide-template.md](../../docs/examples/i18n-naming-guide-template.md)

## 🤝 回饋與貢獻

如果您在測試過程中發現問題或有改進建議：

- 🐛 **回報問題**：[GitHub Issues](https://github.com/ChaoTzuJung/i18n-mcp-translator/issues)
- 💬 **討論**：[GitHub Discussions](https://github.com/ChaoTzuJung/i18n-mcp-translator/discussions)
- 📖 **貢獻文件**：歡迎提交 PR！

---

**祝測試順利！🎉**

如果一切正常，您應該能在幾分鐘內完成所有測試，並看到 i18n MCP Translator 如何自動化您的國際化工作流程。
