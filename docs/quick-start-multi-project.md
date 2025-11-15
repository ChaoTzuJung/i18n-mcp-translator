# 快速上手：多專案設置

本指南幫助您快速為多個專案設置 i18n MCP 翻譯器。

## 5 分鐘設置

### 步驟 1：為每個專案配置 MCP（2 分鐘）

編輯您的 MCP 配置檔案：
- **Claude Code**：`~/.config/claude/mcp.json`
- **Cursor**：`.cursor/mcp.json` 或 `~/.cursor/mcp.json`

為每個專案新增獨立的伺服器：

```json
{
  "mcpServers": {
    "i18n-project-a": {
      "command": "npx",
      "args": ["-y", "i18n-mcp-translator"],
      "env": {
        "GOOGLE_AI_API_KEY": "your-api-key",
        "I18N_MCP_BASE_LANGUAGE": "zh-TW",
        "I18N_MCP_TARGET_LANGUAGES": "zh-TW,en-US,ja,zh-CN",
        "I18N_MCP_TRANSLATION_DIR": "/absolute/path/to/project-a/src/assets/locale",
        "I18N_MCP_SRC_DIR": "/absolute/path/to/project-a/src",
        "I18N_MCP_PROJECT_ROOT": "/absolute/path/to/project-a"
      }
    },
    "i18n-project-b": {
      "command": "npx",
      "args": ["-y", "i18n-mcp-translator"],
      "env": {
        "GOOGLE_AI_API_KEY": "your-api-key",
        "I18N_MCP_BASE_LANGUAGE": "zh-TW",
        "I18N_MCP_TARGET_LANGUAGES": "zh-TW,en-US,ja",
        "I18N_MCP_TRANSLATION_DIR": "/absolute/path/to/project-b/src/locale",
        "I18N_MCP_SRC_DIR": "/absolute/path/to/project-b/src",
        "I18N_MCP_PROJECT_ROOT": "/absolute/path/to/project-b"
      }
    }
  }
}
```

**重點提示：**
- 使用唯一名稱：`i18n-project-a`、`i18n-project-b`
- 所有目錄使用**絕對路徑**
- 為每個專案設置適當的目標語言

### 步驟 2：建立命名規範指南（2 分鐘）

在每個專案中建立 `docs/i18n-naming-guide.md`：

**最小範本：**
```markdown
# i18n Key Naming Convention

## Structure
{feature}.{page}.{element}.{action}

## Examples

### Feature Module
feature.page.button.save
feature.page.title
feature.page.form.label.name

### Common
common.button.save
common.button.cancel
common.error.network
```

**複製自：**
- 完整範本：`docs/examples/i18n-naming-guide-template.md`
- new-canvas-admin 範例：`docs/examples/new-canvas-admin-naming-guide.md`

### 步驟 3：測試設置（1 分鐘）

```bash
# 開啟專案 A
cd /path/to/project-a

# 詢問 Claude：
# "Please translate this file using i18n MCP"
# （對任何包含硬編碼中文文字的檔案）

# 驗證：
# 1. 正確的語言檔案已更新
# 2. 金鑰遵循您的命名規範
# 3. 翻譯沒有錯誤

# 對專案 B 重複相同步驟
cd /path/to/project-b
```

## 常見使用情境

### 使用情境 1：翻譯檔案

```bash
# 1. 在您的專案中開啟檔案
# 2. 詢問 Claude：
"Please use i18n MCP to translate the hardcoded Chinese text in this file"

# Claude 會：
# - 偵測您所在的專案
# - 使用正確的 MCP 伺服器
# - 依照您的規範生成金鑰
# - 更新正確的翻譯檔案
```

### 使用情境 2：生成語言差異檔

```bash
# 在功能分支上進行語言變更後
# 詢問 Claude：
"Generate locale diff comparing my current branch to main"

# Claude 會：
# - 使用 generate_locale_diff 工具
# - 在 locale/diff/ 建立差異檔案
# - 包含所有語言變體
# - 保留子目錄結構
```

### 使用情境 3：合併審核後的翻譯

```bash
# 收到審核後的翻譯後
# 詢問 Claude：
"Merge the reviewed translations from locale/diff/ back to the original files"

# Claude 會：
# - 使用 merge_translations 工具
# - 顯示詳細統計資訊
# - 僅更新已變更的金鑰
# - 可選自動提交
```

## 專案配置檢查清單

對於每個專案，確保：

- [ ] 在 mcp.json 中配置 MCP 伺服器
- [ ] 唯一的伺服器名稱（例如：`i18n-fever-admin`）
- [ ] 已設置 GOOGLE_AI_API_KEY
- [ ] 所有路徑都是絕對路徑
- [ ] 正確設置 TARGET_LANGUAGES
- [ ] 翻譯目錄存在
- [ ] 已建立 i18n 命名指南
- [ ] 在範例檔案上測試翻譯
- [ ] 驗證正確的檔案已更新

## 配置範例

### 範例 1：new-canvas-admin

包含成就、活動、積分系統的綜合管理面板。

```json
"i18n-new-canvas-admin": {
  "command": "npx",
  "args": ["-y", "i18n-mcp-translator"],
  "env": {
    "GOOGLE_AI_API_KEY": "AIza...",
    "I18N_MCP_BASE_LANGUAGE": "zh-TW",
    "I18N_MCP_TARGET_LANGUAGES": "zh-TW,en-US,ja,zh-CN",
    "I18N_MCP_TRANSLATION_DIR": "/path/to/new-canvas-admin/src/assets/locale",
    "I18N_MCP_SRC_DIR": "/path/to/new-canvas-admin/src",
    "I18N_MCP_PROJECT_ROOT": "/path/to/new-canvas-admin"
  }
}
```

**命名規範：**
```
{feature}.{page}.{component}.{element}.{action}

Examples:
achievement.dashboard.title
campaign.onsite.editor.message.placeholder
point.mechanism.behavior.add
promo.list.table.header.name
common.button.save
```

**文件：** 參見 [new-canvas-admin-naming-guide.md](../examples/new-canvas-admin-naming-guide.md)

### 範例 2：fever-tool

用於員工操作的 OnSite 助手工具。

```json
"i18n-fever-tool": {
  "command": "npx",
  "args": ["-y", "i18n-mcp-translator"],
  "env": {
    "GOOGLE_AI_API_KEY": "AIza...",
    "I18N_MCP_BASE_LANGUAGE": "zh-TW",
    "I18N_MCP_TARGET_LANGUAGES": "zh-TW,en-US",
    "I18N_MCP_TRANSLATION_DIR": "/path/to/fever-tool/src/locale",
    "I18N_MCP_SRC_DIR": "/path/to/fever-tool/src",
    "I18N_MCP_PROJECT_ROOT": "/path/to/fever-tool"
  }
}
```

**命名規範：**
```
{feature}.{page}.{section}.{element}

Examples:
onSiteAssistant.promotions.title
onSiteAssistant.missionReward.form.label.name
onSiteAssistant.promoGenerator.button.generate
camera.scanner.instruction
common.button.save
```

**文件：** 參見 [fever-tool-naming-guide.md](../examples/fever-tool-naming-guide.md)

### 範例 3：form

具有編輯器和客戶端模式的表單建構器。

```json
"i18n-form": {
  "command": "npx",
  "args": ["-y", "i18n-mcp-translator"],
  "env": {
    "GOOGLE_AI_API_KEY": "AIza...",
    "I18N_MCP_BASE_LANGUAGE": "zh-TW",
    "I18N_MCP_TARGET_LANGUAGES": "zh-TW,en-US",
    "I18N_MCP_TRANSLATION_DIR": "/path/to/form/src/locale",
    "I18N_MCP_SRC_DIR": "/path/to/form/src",
    "I18N_MCP_PROJECT_ROOT": "/path/to/form"
  }
}
```

**命名規範：**
```
{mode}.{domain}.{component}.{element}.{property}

Examples:
editor.navbar.button.save
editor.fieldSetting.singleLine.placeholder.label
client.field.fileUpload.error.fileSize
client.validation.required
common.button.save
```

**注意：** Form 專案具有雙模式結構：
- `editor.*` - 表單建構器（建立/編輯）
- `client.*` - 表單檢視器（顯示/填寫）
- `common.*` - 共用元件

**文件：** 參見 [form-naming-guide.md](../examples/form-naming-guide.md)

## 疑難排解

### 問題：Claude 更新了錯誤專案的檔案

**解決方案：**
1. 檢查當前目錄是否符合專案
2. 重新啟動 Claude Code
3. 驗證 MCP 伺服器名稱是唯一的

```bash
# 檢查當前目錄
pwd

# 應該輸出：/path/to/current-project
```

### 問題：金鑰不遵循命名規範

**解決方案：**
1. 確保 `docs/i18n-naming-guide.md` 存在
2. 詢問 Claude 時參考它：
   ```
   "Please translate using the naming conventions in docs/i18n-naming-guide.md"
   ```
3. 在您的請求中提供範例

### 問題：找不到翻譯目錄

**解決方案：**
1. 驗證路徑是絕對路徑（以 `/` 開頭）
2. 檢查目錄是否存在：
   ```bash
   ls /absolute/path/to/project/src/assets/locale
   ```
3. 檢查權限：
   ```bash
   ls -la /absolute/path/to/project/src/assets/
   ```

### 問題：生成了錯誤的語言

**解決方案：**
1. 檢查 mcp.json 中的 `I18N_MCP_TARGET_LANGUAGES`
2. 確保語言以逗號分隔（無空格）
3. 使用正確的語言代碼：
   - ✅ `zh-TW,en-US,ja`
   - ❌ `zh-tw, en, ja`

## 最佳實踐

### 1. 使用一致的語言代碼

在所有專案中標準化：
```
zh-TW (繁體中文)
zh-CN (簡體中文)
en-US (英文 - 美國)
ja-JP or ja (日文)
ko-KR (韓文)
pt-BR (葡萄牙文 - 巴西)
es-419 (西班牙文 - 拉丁美洲)
th-TH (泰文)
```

### 2. 組織翻譯檔案

**建議的結構：**
```
src/
└── assets/
    └── locale/
        ├── zh-TW.json
        ├── en-US.json
        ├── ja-JP.json
        └── zh-CN.json
```

或使用子目錄：
```
src/
└── assets/
    └── locale/
        ├── client/
        │   ├── zh-TW.json
        │   └── en-US.json
        └── editor/
            ├── zh-TW.json
            └── en-US.json
```

### 3. 記錄規範

在每個專案中維護：
- `docs/i18n-naming-guide.md` - 命名規範
- `docs/i18n-workflow.md` - 團隊工作流程
- `README.md` - 快速參考

### 4. 版本控制

**包含在 git 中：**
- 翻譯檔案（`*.json`）
- 命名指南（`docs/*.md`）
- 範例

**從 git 中排除：**
- 差異目錄（`locale/diff/`）
- 臨時檔案

```gitignore
# .gitignore
**/locale/diff/
**/locale/*.tmp
```

### 5. 團隊工作流程

1. **開發人員**：
   - 編寫包含硬編碼文字的程式碼
   - 使用 i18n MCP 生成金鑰和翻譯
   - 提交程式碼 + 基礎語言翻譯

2. **翻譯團隊**：
   - 使用 `generate_locale_diff` 生成差異檔
   - 審核和修改翻譯
   - 返回審核後的檔案

3. **開發人員**：
   - 使用 `merge_translations` 合併翻譯
   - 驗證並提交
   - 推送到儲存庫

## 進階配置

### 環境變數

在 shell 設定檔中設置通用變數：

```bash
# ~/.bashrc or ~/.zshrc
export GOOGLE_AI_API_KEY="your-api-key"
export I18N_MCP_BASE_LANGUAGE="zh-TW"

# 然後在 mcp.json 中，僅設置專案特定的變數
{
  "i18n-project": {
    "env": {
      "I18N_MCP_TARGET_LANGUAGES": "zh-TW,en-US",
      "I18N_MCP_PROJECT_ROOT": "/path/to/project"
    }
  }
}
```

### 條件式配置

針對不同環境：

```bash
# 開發環境
export I18N_MCP_TARGET_LANGUAGES="zh-TW,en-US"

# 生產環境（所有語言）
export I18N_MCP_TARGET_LANGUAGES="zh-TW,en-US,ja,zh-CN,pt-BR,es-419,th-TH"
```

## 下一步

1. **閱讀完整文件**：`docs/multi-project-setup.md`
2. **查看範例**：`docs/examples/`
3. **加入討論**：[GitHub Issues](https://github.com/ChaoTzuJung/i18n-mcp-translator/issues)
4. **分享回饋**：協助改進工具！

## 資源

- **完整設置指南**：[multi-project-setup.md](./multi-project-setup.md)
- **命名指南範本**：[i18n-naming-guide-template.md](./examples/i18n-naming-guide-template.md)
- **new-canvas-admin 範例**：[new-canvas-admin-naming-guide.md](./examples/new-canvas-admin-naming-guide.md)
- **主要 README**：[../README.md](../README.md)
- **CLAUDE.md**：[../CLAUDE.md](../CLAUDE.md)

---

**有問題或疑問？**

- GitHub Issues：https://github.com/ChaoTzuJung/i18n-mcp-translator/issues
- 文件：https://github.com/ChaoTzuJung/i18n-mcp-translator/tree/main/docs

**最後更新：** 2025-11-14
