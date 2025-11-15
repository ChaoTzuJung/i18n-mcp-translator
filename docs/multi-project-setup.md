# 多專案設置指南

本指南說明如何為多個專案配置 i18n MCP 翻譯器。

## 概述

i18n MCP 翻譯器透過靈活的配置支援多個專案。每個專案可以有：
- 不同的翻譯檔案結構
- 不同的目標語言
- 不同的命名規範
- 不同的檔案位置

## 配置策略

### 策略 1：為每個專案設置獨立的 MCP 伺服器（推薦）

在您的 MCP 配置檔案中為每個專案建立獨立的 MCP 伺服器實例。

#### 範例：Claude Code 配置

**位置：** `~/.config/claude/mcp.json` 或 `.cursor/mcp.json`

```json
{
  "mcpServers": {
    "i18n-fever-admin": {
      "command": "npx",
      "args": ["-y", "i18n-mcp-translator"],
      "env": {
        "GOOGLE_AI_API_KEY": "your-api-key",
        "I18N_MCP_BASE_LANGUAGE": "zh-TW",
        "I18N_MCP_TARGET_LANGUAGES": "zh-TW,en-US,ja,zh-CN,pt-BR,es-419,th-TH",
        "I18N_MCP_TRANSLATION_DIR": "/absolute/path/to/fever-admin/src/assets/locale",
        "I18N_MCP_SRC_DIR": "/absolute/path/to/fever-admin/src",
        "I18N_MCP_PROJECT_ROOT": "/absolute/path/to/fever-admin"
      }
    },
    "i18n-new-canvas-admin": {
      "command": "npx",
      "args": ["-y", "i18n-mcp-translator"],
      "env": {
        "GOOGLE_AI_API_KEY": "your-api-key",
        "I18N_MCP_BASE_LANGUAGE": "zh-TW",
        "I18N_MCP_TARGET_LANGUAGES": "zh-TW,en-US,ja,zh-CN",
        "I18N_MCP_TRANSLATION_DIR": "/absolute/path/to/new-canvas-admin/src/assets/locale",
        "I18N_MCP_SRC_DIR": "/absolute/path/to/new-canvas-admin/src",
        "I18N_MCP_PROJECT_ROOT": "/absolute/path/to/new-canvas-admin"
      }
    },
    "i18n-fever-tool": {
      "command": "npx",
      "args": ["-y", "i18n-mcp-translator"],
      "env": {
        "GOOGLE_AI_API_KEY": "your-api-key",
        "I18N_MCP_BASE_LANGUAGE": "zh-TW",
        "I18N_MCP_TARGET_LANGUAGES": "zh-TW,en-US,ja",
        "I18N_MCP_TRANSLATION_DIR": "/absolute/path/to/fever-tool/src/locale",
        "I18N_MCP_SRC_DIR": "/absolute/path/to/fever-tool/src",
        "I18N_MCP_PROJECT_ROOT": "/absolute/path/to/fever-tool"
      }
    },
    "i18n-form": {
      "command": "npx",
      "args": ["-y", "i18n-mcp-translator"],
      "env": {
        "GOOGLE_AI_API_KEY": "your-api-key",
        "I18N_MCP_BASE_LANGUAGE": "zh-TW",
        "I18N_MCP_TARGET_LANGUAGES": "zh-TW,en-US,ja,zh-CN",
        "I18N_MCP_TRANSLATION_DIR": "/absolute/path/to/form/src/i18n",
        "I18N_MCP_SRC_DIR": "/absolute/path/to/form/src",
        "I18N_MCP_PROJECT_ROOT": "/absolute/path/to/form"
      }
    }
  }
}
```

#### 優點
- ✅ **清晰分離** - 每個專案都有自己的配置
- ✅ **不會混淆** - 不會有混淆專案配置的風險
- ✅ **專案特定設定** - 每個專案可以有不同的語言和路徑
- ✅ **自動選擇** - Claude Code 會根據工作目錄自動選擇正確的伺服器

#### 運作原理
1. 當您開啟一個專案時，Claude Code 會偵測工作目錄
2. 它會將目錄與適當的 MCP 伺服器進行配對
3. 所有 i18n 操作都會使用該專案的配置
4. 切換專案會自動切換 MCP 伺服器上下文

### 策略 2：使用單一 MCP 伺服器並動態傳遞參數

使用一個 MCP 伺服器，並在每次工具呼叫時傳遞專案特定的參數。

#### 使用範例

```typescript
// When working on fever-admin
await mcp.call('translate-file', {
  filePath: 'src/admin/components/Button.tsx',
  fileContent: '...',
  projectRoot: '/path/to/fever-admin',
  translationDir: '/path/to/fever-admin/src/assets/locale',
  baseLanguage: 'zh-TW',
  targetLanguages: ['zh-TW', 'en-US', 'ja', 'zh-CN']
});

// When working on fever-tool
await mcp.call('translate-file', {
  filePath: 'src/tools/Editor.tsx',
  fileContent: '...',
  projectRoot: '/path/to/fever-tool',
  translationDir: '/path/to/fever-tool/src/locale',
  baseLanguage: 'zh-TW',
  targetLanguages: ['zh-TW', 'en-US', 'ja']
});
```

#### 優點
- ✅ **資源效率高** - 只有一個 MCP 伺服器實例
- ✅ **最大靈活性** - 可以在每次呼叫時覆寫任何參數
- ✅ **設置更簡單** - 只需一個配置項目

#### 缺點
- ❌ **更冗長** - 每次都需要指定參數
- ❌ **容易出錯** - 容易忘記或混淆參數
- ❌ **無自動偵測** - 必須手動指定專案上下文

## 專案特定的命名規範

### 用於 AI 指導的上下文檔案

在每個專案中建立一個命名規範指南，以幫助 AI 生成適當的 i18n 鍵值。

#### 範例：fever-admin

**位置：** `fever-admin/docs/i18n-naming-guide.md`

```markdown
# i18n Key Naming Convention - fever-admin

## Structure
{module}.{page}.{section}.{element}.{state}

## Examples

### Admin Module
- admin.users.table.header.name
- admin.users.table.header.email
- admin.users.dialog.create.title
- admin.users.button.add

### Settings Module
- settings.profile.form.label.username
- settings.profile.form.placeholder.email
- settings.profile.button.save

### Common Components
- common.button.save
- common.button.cancel
- common.dialog.confirm
- common.error.network
- common.validation.required
```

#### 範例：new-canvas-admin

**位置：** `new-canvas-admin/docs/i18n-naming-guide.md`

```markdown
# i18n Key Naming Convention - new-canvas-admin

## Structure
{feature}.{page}.{component}.{element}.{action}

## Examples

### Achievement Feature
- achievement.dashboard.title
- achievement.create.button.save
- achievement.level.visual.upload.hint

### Campaign Feature
- campaign.onsite.editor.message.placeholder
- campaign.chat.analytics.chart.label

### Point System
- point.mechanism.behavior.title
- point.statistical.chart.label

### Common Components
- common.button.save
- common.table.noData
- common.upload.hint
```

### 將上下文傳遞給 AI

在使用 MCP 翻譯器時，您可以參考這些指南：

```bash
# In your project's prompt or context
Please follow the i18n naming conventions specified in docs/i18n-naming-guide.md
when generating translation keys.
```

## 專案比較表

| 專案 | 基礎語言 | 目標語言 | 翻譯目錄 | 結構類型 | 命名規範 |
|---------|-----------|------------------|-----------------|----------------|-------------------|
| new-canvas-admin | zh-TW | zh-TW, en-US, ja, zh-CN | src/assets/locale | 每種語言獨立檔案 | `{feature}.{page}.{component}.{element}.{action}` |
| fever-tool | zh-TW | zh-TW, en-US | src/locale | 每種語言獨立檔案 | `{feature}.{page}.{section}.{element}` |
| form | zh-TW | zh-TW, en-US | src/locale/client, src/locale/editor | 每種語言獨立檔案（依模式分割） | `{mode}.{domain}.{component}.{element}.{property}` |

## 工作流程範例

### 範例 1：在 fever-admin 中翻譯檔案

```bash
# Claude will automatically use i18n-fever-admin MCP server

1. Open file: fever-admin/src/admin/Users.tsx
2. Ask Claude: "Please translate this file using i18n MCP"
3. Claude calls: translate-file tool with fever-admin config
4. Result: Keys generated following fever-admin conventions
5. Files updated: fever-admin/src/assets/locale/*.json
```

### 範例 2：為 new-canvas-admin 生成語言差異檔

```bash
# Working on feature branch in new-canvas-admin

1. Make locale changes on feature branch
2. Ask Claude: "Generate locale diff comparing to main branch"
3. Claude calls: generate_locale_diff with new-canvas-admin config
4. Result: Diff files created in new-canvas-admin/src/assets/locale/diff/
5. Share diff files with translation team
```

### 範例 3：為 fever-tool 合併翻譯

```bash
# After translation team review

1. Receive reviewed translations in fever-tool/src/locale/diff/
2. Ask Claude: "Merge reviewed translations back to original files"
3. Claude calls: merge_translations with fever-tool config
4. Result: Original files updated with reviewed translations
5. Optional: Auto-commit and push changes
```

## 最佳實踐

### 1. 使用絕對路徑
在 MCP 配置中始終使用絕對路徑以避免歧義：

```json
"I18N_MCP_PROJECT_ROOT": "/Users/alan/projects/fever-admin"
```

而不是：
```json
"I18N_MCP_PROJECT_ROOT": "../fever-admin"  // ❌ Avoid relative paths
```

### 2. 一致的語言代碼
在所有專案中使用一致的語言代碼：
- ✅ `zh-TW`, `en-US`, `ja-JP`, `zh-CN`
- ❌ `zh-tw`, `en`, `ja`, `cn`

### 3. 文件化規範
在每個專案中維護 i18n 命名規範文件：
- `docs/i18n-naming-guide.md`
- `docs/i18n-structure.md`
- 在專案 README 中連結這些文件

### 4. 命名規範對齊
雖然每個專案可以有不同的規範，但儘量對齊共用模式：

**共用元素（所有專案）：**
- `common.button.save`
- `common.button.cancel`
- `common.error.network`
- `common.validation.required`

**專案特定（可以不同）：**
- fever-admin: `admin.users.table.header.name`
- new-canvas-admin: `achievement.dashboard.title`

### 5. 測試配置
測試每個專案的 MCP 配置：

```bash
# Test fever-admin config
cd /path/to/fever-admin
# Ask Claude to translate a small test file

# Test new-canvas-admin config
cd /path/to/new-canvas-admin
# Ask Claude to translate a small test file
```

### 6. 版本控制
將 MCP 配置加入版本控制（如果適合）：

```bash
# In each project
.cursor/mcp.json  # If using Cursor
.claude/mcp.json  # If using Claude Code
```

或在專案 README 中記錄所需的 MCP 配置。

## 疑難排解

### 問題：錯誤專案的翻譯檔案被更新

**原因：** MCP 伺服器選擇了錯誤的專案配置

**解決方案：**
1. 檢查當前工作目錄是否與專案相符
2. 驗證 MCP 伺服器名稱是否唯一
3. 重新啟動 Claude Code 以重新載入 MCP 配置

### 問題：找不到翻譯目錄

**原因：** 配置中的路徑不正確

**解決方案：**
1. 在 MCP 配置中使用絕對路徑
2. 驗證目錄是否存在：`ls /path/to/project/src/assets/locale`
3. 檢查檔案權限

### 問題：AI 生成錯誤的鍵值格式

**原因：** AI 不知道專案特定的命名規範

**解決方案：**
1. 在專案中建立/更新 `docs/i18n-naming-guide.md`
2. 在詢問 Claude 時參考該指南
3. 提供所需鍵值格式的範例
4. 考慮將命名規範新增到專案的 CLAUDE.md

### 問題：混合了來自不同專案的語言

**原因：** 使用單一 MCP 伺服器而沒有適當的參數隔離

**解決方案：**
1. 切換到為每個專案設置獨立的 MCP 伺服器策略（策略 1）
2. 或確保所有工具呼叫都包含明確的專案參數

## 進階：共用配置

對於共用相似 i18n 設置的專案，您可以使用環境變數：

```bash
# In your shell profile (.bashrc, .zshrc)
export GOOGLE_AI_API_KEY="your-api-key"
export I18N_MCP_BASE_LANGUAGE="zh-TW"

# Then in MCP config, only specify project-specific settings
{
  "i18n-fever-admin": {
    "command": "npx",
    "args": ["-y", "i18n-mcp-translator"],
    "env": {
      "I18N_MCP_TARGET_LANGUAGES": "zh-TW,en-US,ja,zh-CN,pt-BR,es-419,th-TH",
      "I18N_MCP_TRANSLATION_DIR": "/path/to/fever-admin/src/assets/locale",
      "I18N_MCP_PROJECT_ROOT": "/path/to/fever-admin"
    }
  }
}
```

## 總結

**推薦設置：**
1. ✅ 使用策略 1（為每個專案設置獨立的 MCP 伺服器）
2. ✅ 在每個專案中建立 i18n 命名指南
3. ✅ 在配置中使用絕對路徑
4. ✅ 獨立測試每個專案的設置
5. ✅ 文件化專案特定的規範

**結果：**
- 清晰的專案分離
- 沒有配置衝突
- AI 為每個專案生成適當的鍵值
- 高效的多專案工作流程
