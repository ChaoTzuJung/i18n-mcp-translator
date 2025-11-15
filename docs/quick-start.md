# 快速入門指南

5 分鐘設定 i18n MCP 翻譯器並開始翻譯您的第一個檔案。

## 前置需求

- **Node.js** v22.0.0 或以上版本
- **Google Generative AI API Key** - [取得 API Key](https://aistudio.google.com/app/apikey)
- **Claude Code** 或其他支援 MCP 的編輯器

## 步驟 1：取得 Google AI API Key（1 分鐘）

1. 前往 [Google AI Studio](https://aistudio.google.com/app/apikey)
2. 點擊 "Create API Key"
3. 複製 API Key（格式類似：`AIzaSyC...`）

## 步驟 2：配置 MCP 伺服器（2 分鐘）

### 使用 Claude Code

編輯您的 MCP 配置檔案：`~/.config/claude/mcp.json` 或使用 CLI 命令：

```bash
claude mcp add --transport stdio i18n-mcp-translator \
  --scope project \
  --env GOOGLE_AI_API_KEY=your-google-api-key-here \
  --env I18N_MCP_BASE_LANGUAGE=zh-TW \
  --env I18N_MCP_TARGET_LANGUAGES=zh-TW,en-US,ja \
  --env I18N_MCP_TRANSLATION_DIR=/absolute/path/to/your/project/src/assets/locale \
  --env I18N_MCP_SRC_DIR=/absolute/path/to/your/project/src \
  --env I18N_MCP_PROJECT_ROOT=/absolute/path/to/your/project \
  -- npx -y i18n-mcp-translator
```

### 使用 Cursor

編輯 `.cursor/mcp.json` 或 `~/.cursor/mcp.json`：

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
        "I18N_MCP_TRANSLATION_DIR": "/absolute/path/to/your/project/src/assets/locale",
        "I18N_MCP_SRC_DIR": "/absolute/path/to/your/project/src",
        "I18N_MCP_PROJECT_ROOT": "/absolute/path/to/your/project"
      }
    }
  }
}
```

**重要提示：**
- 將 `your-google-api-key-here` 替換為您的實際 API Key
- 將路徑替換為您專案的**絕對路徑**
- 確保翻譯目錄存在（如不存在會自動建立）

### 配置參數說明

| 參數 | 說明 | 範例 |
|------|------|------|
| `GOOGLE_AI_API_KEY` | Google AI API 金鑰（必填） | `AIzaSyC...` |
| `I18N_MCP_BASE_LANGUAGE` | 來源語言 | `zh-TW` |
| `I18N_MCP_TARGET_LANGUAGES` | 目標語言（逗號分隔） | `zh-TW,en-US,ja` |
| `I18N_MCP_TRANSLATION_DIR` | 翻譯檔案目錄 | `/path/to/src/assets/locale` |
| `I18N_MCP_SRC_DIR` | 原始碼目錄 | `/path/to/src` |
| `I18N_MCP_PROJECT_ROOT` | 專案根目錄 | `/path/to/project` |

## 步驟 3：測試翻譯功能（2 分鐘）

### 選項 A：使用測試範例專案

我們提供了一個現成的測試專案：

```bash
# 1. 切換到範例專案
cd examples/test-app

# 2. 查看測試元件
cat src/components/Button.tsx
# 這個檔案包含硬編碼的中文文字

# 3. 在 Claude Code 中開啟這個檔案並詢問：
# "Please use i18n MCP to translate the hardcoded Chinese text in this file"
```

### 選項 B：使用您自己的專案

1. **開啟包含中文文字的檔案**

例如：
```tsx
// src/components/Welcome.tsx
export function Welcome() {
  return (
    <div>
      <h1>歡迎使用</h1>
      <p>這是一個測試頁面</p>
      <button>點擊這裡</button>
    </div>
  );
}
```

2. **詢問 Claude 進行翻譯**

在 Claude Code 中輸入：
```
Please use i18n MCP to translate the hardcoded Chinese text in this file
```

3. **驗證結果**

Claude 會：
- ✅ 生成符合上下文的 i18n 鍵值
- ✅ 更新翻譯 JSON 檔案
- ✅ 返回重構後的程式碼

重構後的程式碼範例：
```tsx
export function Welcome() {
  return (
    <div>
      <h1>{t('welcome.title')}</h1>
      <p>{t('welcome.description')}</p>
      <button>{t('welcome.button.click')}</button>
    </div>
  );
}
```

翻譯檔案會自動更新：
```json
// src/assets/locale/zh-TW.json
{
  "welcome.title": "歡迎使用",
  "welcome.description": "這是一個測試頁面",
  "welcome.button.click": "點擊這裡"
}

// src/assets/locale/en-US.json
{
  "welcome.title": "Welcome",
  "welcome.description": "This is a test page",
  "welcome.button.click": "Click Here"
}
```

## 常見使用情境

### 1. 翻譯單一檔案

```
"Please translate this file using i18n MCP"
```

### 2. 批次翻譯多個檔案

```
"Please translate all TypeScript files in src/components/ using i18n MCP"
```

### 3. 生成翻譯差異檔案

在功能分支上修改後：
```
"Generate locale diff comparing my current branch to main"
```

### 4. 合併審核後的翻譯

收到審核後的翻譯後：
```
"Merge the reviewed translations from locale/diff/ back to the original files"
```

## 驗證設定

### 檢查 MCP 是否正常運作

1. **重新啟動編輯器**（Claude Code 或 Cursor）
2. **開啟專案**
3. **詢問 Claude**：
   ```
   Can you list the available MCP tools?
   ```
4. **確認輸出**包含：
   - `translate-file`
   - `generate_locale_diff`
   - `merge_translations`
   - `cleanup_diff_directory`
   - `git_commit_push`

### 除錯常見問題

#### 問題 1：找不到 MCP 工具

**解決方案：**
- 確認 MCP 配置檔案路徑正確
- 重新啟動編輯器
- 檢查 API Key 是否正確設定

#### 問題 2：找不到翻譯目錄

**解決方案：**
- 確保路徑是**絕對路徑**
- 檢查目錄權限
- 手動建立目錄：
  ```bash
  mkdir -p src/assets/locale
  ```

#### 問題 3：生成了錯誤的語言

**解決方案：**
- 檢查 `I18N_MCP_TARGET_LANGUAGES` 設定
- 確保語言代碼以逗號分隔（無空格）
- 正確格式：`zh-TW,en-US,ja`
- 錯誤格式：`zh-tw, en, ja`

#### 問題 4：API Key 錯誤

**解決方案：**
- 驗證 API Key 是否有效
- 檢查 API Key 配額
- 確認環境變數正確設定

## 支援的語言代碼

常用語言代碼：

| 語言 | 代碼 |
|------|------|
| 繁體中文 | `zh-TW` |
| 簡體中文 | `zh-CN` |
| 香港中文 | `zh-HK` |
| 英文（美國） | `en-US` |
| 日文 | `ja` 或 `ja-JP` |
| 韓文 | `ko-KR` |
| 葡萄牙文（巴西） | `pt-BR` |
| 西班牙文（拉丁美洲） | `es-419` |
| 泰文 | `th-TH` |

## 下一步

### 進階功能

- 📖 [多專案設定](./quick-start-multi-project.md) - 同時處理多個專案
- 📖 [完整文件](../README.md) - 所有功能和參數說明
- 📖 [命名規範指南](./examples/i18n-naming-guide-template.md) - i18n 鍵值命名最佳實踐
- 📖 [測試指南](./testing-guide.md) - 開發者測試指南

### 最佳實踐

1. **建立命名規範**
   - 在專案中建立 `docs/i18n-naming-guide.md`
   - 定義一致的鍵值結構
   - 範例：`{feature}.{page}.{element}.{action}`

2. **版本控制**
   - 提交翻譯檔案到 Git
   - 排除差異目錄：在 `.gitignore` 加入 `**/locale/diff/`

3. **團隊協作**
   - 使用 `generate_locale_diff` 生成差異檔
   - 讓翻譯團隊審核
   - 使用 `merge_translations` 整合變更

## 需要幫助？

- 🐛 **回報問題**：[GitHub Issues](https://github.com/ChaoTzuJung/i18n-mcp-translator/issues)
- 📖 **完整文件**：[README.md](../README.md)
- 💬 **討論**：[GitHub Discussions](https://github.com/ChaoTzuJung/i18n-mcp-translator/discussions)

---

**開始翻譯吧！🚀**

只要 5 分鐘，您就能自動化整個 i18n 工作流程。
