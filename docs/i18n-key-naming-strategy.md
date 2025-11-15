# i18n Key 命名策略 - 增強的 AI Key 生成

## 執行摘要

本文件提出 MCP Translator 的增強 i18n key 命名策略，基於文件結構和程式碼上下文生成上下文感知的階層式 key，而不是簡單的基於元素類型的命名。

**當前問題：**
- AI 僅根據元素類型生成像 `label.xxx_aaa_sss_ddd` 這樣的 key
- 不考慮文件路徑、元件階層或命名空間
- 導致平坦、非語義的 key 名稱，無法反映專案架構

**提議解決方案：**
- 使用文件路徑分析進行上下文感知的 key 生成
- 階層結構：`{namespace}.{module}.{component}.{element}.{state}`
- 最大深度為 4-5 層以達到最佳平衡
- 命名空間優先方法，與專案架構保持一致

---

## 研究發現：行業最佳實踐

### 1. 按功能/領域命名空間 ⭐（最重要）
**來源：** Locize、DEV Community、React i18next 文件

最穩健的策略是**按功能或領域命名空間**（例如，`checkout`、`adminDashboard`、`userProfile`）。這種方法：
- 使 i18n 結構與應用程式架構保持一致
- 對 UI 重構具有彈性
- 支援程式碼分割和懶載入
- 改善團隊協作（開發者處理特定功能的文件）

**範例：**
```json
{
  "checkout": {
    "paymentForm": {
      "submitButton": "Complete Purchase",
      "cardNumber": "Card Number"
    }
  },
  "adminDashboard": {
    "userTable": {
      "columns": {
        "name": "Name",
        "email": "Email"
      }
    }
  }
}
```

### 2. 階層巢狀（2-3 層最佳）
**來源：** Tolgee、Lokalise、Phrase

**最佳深度：** 2-3 層提供最佳的組織性和簡單性平衡。

**良好範例：**
```
✅ checkout.paymentForm.submitButton
✅ user.profile.editButton
✅ errors.validation.emailInvalid
```

**避免過度巢狀：**
```
❌ app.pages.checkout.forms.payment.fields.card.number.label（過深）
```

### 3. 使用描述性和語義化名稱
**來源：** POEditor、Transifex、Stack Overflow

Key 應清楚描述**內容或目的**，而不僅僅是位置或元素類型。

**良好：**
```
✅ user.login.welcomeMessage
✅ product.addToCart.button
✅ error.networkTimeout
```

**不良：**
```
❌ label_1, text123, key_abc
❌ button.click.here
```

### 4. 一致的命名慣例
**來源：** Phrase、Lokalise

選擇一種慣例並堅持使用：
- **camelCase：** `userLoginForm`
- **snake_case：** `user_login_form`
- **dot.notation：** `user.login.form`

**建議：** 使用**點標記法**作為階層 + 段落內使用 **camelCase**。

範例：`user.loginForm.submitButton`

### 5. 通用翻譯文件
**來源：** React i18next、ButterCMS

維護一個 `common.json` 命名空間用於頻繁重複使用的字串：
```json
{
  "button": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "confirm": "Confirm"
  },
  "dialog": {
    "close": "Close",
    "confirm": "Are you sure?"
  }
}
```

### 6. 需要時包含上下文
**來源：** Tolgee、DEV Community

如果術語有多種含義，請包含上下文：
```
✅ address.user（使用者地址）
✅ address.shipping（送貨地址）
✅ date.created（建立日期）
✅ date.modified（修改日期）
```

### 7. 規劃複數和性別
**來源：** i18next 文件

使用 ICU 訊息格式或特定 key 處理複數：
```json
{
  "item": {
    "count_one": "{{count}} item",
    "count_other": "{{count}} items"
  }
}
```

---

## Fever Admin 專案分析

### 專案架構概述

**三個主要流程：**
1. **Editor Flow** - 管理後台（活動編輯器）
2. **Client Flow** - 使用者前台（活動參與）
3. **UGC Flow** - UGC 內容展示和投票

**當前 i18n 結構：**
```
src/locale/
├── i18n.js
├── client/          # 前端命名空間
│   ├── zh-TW.json
│   ├── en-US.json
│   └── ...（7 種語言）
└── editor/          # 後端命名空間
    ├── zh-TW.json
    ├── en-US.json
    └── ...（7 種語言）
```

### 主要特徵

1. **清晰的命名空間分離：** Editor vs Client
2. **25+ 種遊戲類型：** 每種都需要獨特的 i18n key
3. **模組化架構：** 清晰的流程 > 模組 > 元件階層
4. **共享元件：** 在 editor 和 client 之間使用的元件

### 範例文件路徑

```
src/client/game_aiWebGame/...                    # Client 流程
src/editor/game_aiWebGame/...                    # Editor 流程
src/components/AIWebGame/...                     # 共享元件
src/editor/components/SideBar/Prize/...          # Editor 專用
src/client/components/Result/Actions/...         # Client 專用
```

---

## Fever Admin 提議的 i18n Key 命名策略

### 格式結構

```
{namespace}.{module}.{component}.{element}.{variant}
```

**最大深度：** 4-5 層

### 階層層級的命名規則

#### 層級 1：命名空間（必需）
- `editor` - Editor 流程（管理後台）
- `client` - Client 流程（使用者前台）
- `ugc` - UGC 流程
- `common` - 所有流程共享

#### 層級 2：模組（必需）
基於功能區域或遊戲類型：
- **遊戲類型：** `aiWebGame`、`quiz`、`vote`、`checkIn`、`lottery` 等
- **功能區域：** `prize`、`qualify`、`result`、`task`、`mgm` 等
- **共享模組：** `auth`、`navigation`、`dialog` 等

#### 層級 3：元件/上下文（必需）
- camelCase 的元件名稱：`gameConfig`、`settingPanel`、`prizeList`
- 或功能上下文：`validation`、`error`、`success`

#### 層級 4：元素/目的（必需）
- 描述性元素識別符：`title`、`description`、`submitButton`
- 或特定目的：`placeholder`、`tooltip`、`errorMessage`

#### 層級 5：變體/狀態（可選）
- 狀態變化：`loading`、`success`、`error`
- UI 變體：`primary`、`secondary`、`disabled`
- 複數：`singular`、`plural`

### 基於 Fever Admin 結構的範例

#### Editor Flow 範例

**文件：** `src/editor/game_aiWebGame/SettingPanel/Panels/GameConfigPanel.jsx`

```javascript
// 標題
t('editor.aiWebGame.gameConfig.title')
// "AI 網頁遊戲配置"

// 描述欄位
t('editor.aiWebGame.gameConfig.description.label')
t('editor.aiWebGame.gameConfig.description.placeholder')

// 沙盒模式核取方塊
t('editor.aiWebGame.settingPanel.sandbox.label')
t('editor.aiWebGame.settingPanel.sandbox.tooltip')

// 全螢幕切換
t('editor.aiWebGame.display.fullscreen.label')
t('editor.aiWebGame.display.fullscreen.description')
```

**文件：** `src/editor/components/SideBar/Prize/Dialog/PrizeInfoDialog.jsx`

```javascript
// 對話框標題
t('editor.prize.infoDialog.title')

// 獎品名稱欄位
t('editor.prize.infoDialog.prizeName.label')
t('editor.prize.infoDialog.prizeName.placeholder')

// 獎品圖片上傳
t('editor.prize.infoDialog.image.uploadButton')
t('editor.prize.infoDialog.image.requirement')

// 動作
t('editor.prize.infoDialog.saveButton')
t('editor.prize.infoDialog.cancelButton')
```

**文件：** `src/editor/components/SideBar/Qualify/limitQualify/index.jsx`

```javascript
// 區塊標題
t('editor.qualify.limitQualify.title')

// 會員等級限制
t('editor.qualify.limitQualify.memberLevel.label')
t('editor.qualify.limitQualify.memberLevel.placeholder')

// 標籤資格
t('editor.qualify.limitQualify.tags.label')
t('editor.qualify.limitQualify.tags.addButton')
t('editor.qualify.limitQualify.tags.emptyState')
```

#### Client Flow 範例

**文件：** `src/client/game_aiWebGame/GameContainer.jsx`

```javascript
// 載入狀態
t('client.aiWebGame.loading')
t('client.aiWebGame.loading.message')

// 錯誤狀態
t('client.aiWebGame.error.loadFailed')
t('client.aiWebGame.error.networkTimeout')
t('client.aiWebGame.error.notFound')

// 全螢幕控制
t('client.aiWebGame.fullscreen.enterButton')
t('client.aiWebGame.fullscreen.exitButton')
```

**文件：** `src/client/components/Result/Actions/ShareButton.jsx`

```javascript
// 分享按鈕
t('client.result.actions.shareButton')
t('client.result.actions.shareButton.tooltip')

// 分享成功
t('client.result.actions.share.success')
t('client.result.actions.share.error')
```

**文件：** `src/client/game_checkIn/CheckInCard.jsx`

```javascript
// 卡片標題
t('client.checkIn.card.title')

// 簽到按鈕狀態
t('client.checkIn.card.button.checkIn')
t('client.checkIn.card.button.checkedIn')
t('client.checkIn.card.button.disabled')

// 狀態訊息
t('client.checkIn.card.status.success')
t('client.checkIn.card.status.alreadyCheckedIn')
t('client.checkIn.card.status.notQualified')
```

**文件：** `src/client/fever_form/FeverForm/DatePicker/index.jsx`

```javascript
// 日期選擇器標籤
t('client.form.datePicker.label')
t('client.form.datePicker.placeholder')

// 驗證
t('client.form.datePicker.validation.required')
t('client.form.datePicker.validation.invalid')
t('client.form.datePicker.validation.pastDate')
```

#### Common（共享）範例

**文件：** 所有流程中可重複使用

```javascript
// 按鈕
t('common.button.save')
t('common.button.cancel')
t('common.button.delete')
t('common.button.confirm')
t('common.button.close')
t('common.button.edit')
t('common.button.submit')

// 對話框
t('common.dialog.confirm.title')
t('common.dialog.confirm.message')
t('common.dialog.delete.title')
t('common.dialog.delete.message')
t('common.dialog.unsavedChanges.title')
t('common.dialog.unsavedChanges.message')

// 表單驗證
t('common.validation.required')
t('common.validation.emailInvalid')
t('common.validation.phoneInvalid')
t('common.validation.urlInvalid')
t('common.validation.minLength')
t('common.validation.maxLength')

// 狀態訊息
t('common.message.saveSuccess')
t('common.message.saveFailed')
t('common.message.deleteSuccess')
t('common.message.deleteFailed')
t('common.message.networkError')

// 日期/時間
t('common.date.today')
t('common.date.yesterday')
t('common.date.tomorrow')
```

#### UGC Flow 範例

**文件：** `src/ugc/components/ugcGallery/waterfall/index.jsx`

```javascript
// 畫廊標題
t('ugc.gallery.waterfall.title')

// 篩選選項
t('ugc.gallery.filter.latest')
t('ugc.gallery.filter.popular')
t('ugc.gallery.filter.myWorks')

// 動作
t('ugc.gallery.uploadButton')
t('ugc.gallery.voteButton')
```

---

## AI Service 的 Key 生成演算法

### 所需輸入數據

1. **文件路徑：** 源文件的絕對路徑
2. **程式碼上下文：** 周圍的 JSX/TSX 程式碼
3. **文字內容：** 要翻譯的硬編碼文字
4. **專案根目錄：** 相對路徑計算的基礎目錄

### 路徑分析演算法

```typescript
interface PathContext {
  namespace: 'editor' | 'client' | 'ugc' | 'common' | 'shared';
  module: string;        // 例如，'aiWebGame'、'prize'、'checkIn'
  component: string;     // 例如，'gameConfig'、'settingPanel'
  subpath: string[];     // 額外的路徑段落
}

function analyzeFilePath(filePath: string, projectRoot: string): PathContext {
  const relativePath = path.relative(projectRoot, filePath);
  const segments = relativePath.split(path.sep);

  // 決定命名空間
  let namespace: PathContext['namespace'] = 'common';
  let startIdx = 0;

  if (segments.includes('client')) {
    namespace = 'client';
    startIdx = segments.indexOf('client') + 1;
  } else if (segments.includes('editor')) {
    namespace = 'editor';
    startIdx = segments.indexOf('editor') + 1;
  } else if (segments.includes('ugc')) {
    namespace = 'ugc';
    startIdx = segments.indexOf('ugc') + 1;
  } else if (segments.includes('components')) {
    namespace = 'common';
    startIdx = segments.indexOf('components') + 1;
  }

  // 從 game_xxx 或功能目錄提取模組
  let module = '';
  let componentStartIdx = startIdx;

  for (let i = startIdx; i < segments.length; i++) {
    const segment = segments[i];

    // 檢查遊戲類型
    if (segment.startsWith('game_')) {
      module = segment.replace('game_', '');
      componentStartIdx = i + 1;
      break;
    }

    // 檢查已知的功能模組
    const knownModules = [
      'prize', 'qualify', 'task', 'mgm', 'achievement',
      'point', 'rewards', 'collected', 'login', 'fever_form'
    ];
    if (knownModules.includes(segment)) {
      module = segment;
      componentStartIdx = i + 1;
      break;
    }

    // 檢查元件目錄
    if (segment === 'components') {
      componentStartIdx = i + 1;
      break;
    }
  }

  // 提取元件和子路徑
  const remainingSegments = segments.slice(componentStartIdx);
  const component = remainingSegments[0] || '';
  const subpath = remainingSegments.slice(1).filter(s => s !== 'index.jsx' && s !== 'index.tsx');

  return {
    namespace,
    module: toCamelCase(module),
    component: toCamelCase(component),
    subpath: subpath.map(toCamelCase)
  };
}

function toCamelCase(str: string): string {
  return str
    .replace(/[-_](.)/g, (_, char) => char.toUpperCase())
    .replace(/^(.)/, (_, char) => char.toLowerCase());
}
```

### 元素類型偵測

```typescript
interface ElementContext {
  type: 'button' | 'title' | 'label' | 'placeholder' | 'tooltip' | 'error' | 'message';
  parent: string;        // 父元素類型（例如，'Dialog'、'Form'）
  attributes: Record<string, string>;  // 元素屬性
}

function detectElementContext(codeContext: string): ElementContext {
  // 分析 JSX 結構
  const buttonRegex = /<button|<Button|onClick=/;
  const titleRegex = /<h[1-6]|<Title|<Typography variant="h/;
  const placeholderRegex = /placeholder=|placeholder:/;
  const tooltipRegex = /tooltip=|Tooltip|title=/;
  const errorRegex = /error|Error|invalid|Invalid/;

  if (buttonRegex.test(codeContext)) {
    return { type: 'button', parent: '', attributes: {} };
  } else if (titleRegex.test(codeContext)) {
    return { type: 'title', parent: '', attributes: {} };
  } else if (placeholderRegex.test(codeContext)) {
    return { type: 'placeholder', parent: '', attributes: {} };
  } else if (tooltipRegex.test(codeContext)) {
    return { type: 'tooltip', parent: '', attributes: {} };
  } else if (errorRegex.test(codeContext)) {
    return { type: 'error', parent: '', attributes: {} };
  }

  return { type: 'label', parent: '', attributes: {} };
}
```

### Key 建構

```typescript
function constructI18nKey(
  pathContext: PathContext,
  elementContext: ElementContext,
  semanticName: string  // AI 從文字生成的語義名稱
): string {
  const parts: string[] = [];

  // 1. 命名空間（必需）
  parts.push(pathContext.namespace);

  // 2. 模組（如果存在）
  if (pathContext.module) {
    parts.push(pathContext.module);
  }

  // 3. 元件（如果存在）
  if (pathContext.component) {
    parts.push(pathContext.component);
  }

  // 4. 子路徑（如果存在且有意義）
  if (pathContext.subpath.length > 0 && pathContext.subpath.length <= 2) {
    parts.push(...pathContext.subpath);
  }

  // 5. 語義名稱 + 元素類型
  // 如果元素類型是通用的（label），只使用語義名稱
  // 否則附加元素類型（button、title 等）
  if (elementContext.type === 'label' || elementContext.type === 'message') {
    parts.push(semanticName);
  } else {
    parts.push(`${semanticName}.${elementContext.type}`);
  }

  // 確保最大深度為 5 層
  if (parts.length > 5) {
    // 保留命名空間、模組和最後 3 個部分
    parts.splice(2, parts.length - 5);
  }

  return parts.join('.');
}
```

### AI Prompt 增強

**更新的 Prompt 範本：**

```
You are an expert i18n (internationalization) assistant for a React project.
Your task is to generate a structured i18n key and translate text.

**Context Information:**
- File Path: {relativePath}
- Namespace: {namespace} (editor/client/ugc/common)
- Module: {module} (e.g., aiWebGame, prize, checkIn)
- Component: {component}
- Element Type: {elementType} (button, title, label, etc.)
- Original Text: "{text}"
- Source Language: {sourceLanguage}
- Target Languages: {targetLanguages}

**Code Context:**
```jsx
{codeContext}
```

**Key Generation Rules:**

1. **Use Provided Context:**
   - Start with namespace: {namespace}
   - Follow with module (if applicable): {module}
   - Then component (if applicable): {component}

2. **Semantic Naming:**
   - Generate a SHORT, descriptive English name for the text content
   - Use camelCase for the semantic part
   - Focus on MEANING, not literal translation
   - Examples:
     * "關閉" → "close"
     * "保存設定" → "saveSettings"
     * "上傳圖片" → "uploadImage"
     * "確認刪除" → "confirmDelete"

3. **Element Type Suffix:**
   - For buttons: append nothing (it's clear from context)
   - For specific types: append .placeholder, .tooltip, .error as needed
   - For generic text: no suffix needed

4. **Complete Key Format:**
   {namespace}.{module}.{component}.{semanticName}
   OR
   {namespace}.{module}.{component}.{semanticName}.{elementType}

5. **Common Phrases:**
   - If the text is a very common phrase (Save, Cancel, Close, Delete, etc.)
   - Consider if it should use common namespace: common.button.{action}
   - Only if it's truly reusable across the entire application

**Output:**
Provide ONLY valid JSON with no additional text:
```json
{
  "i18nKey": "string",
  "translations": {
    "zh-TW": "string",
    "en-US": "string",
    ...
  },
  "originalText": "string",
  "reasoning": "Brief explanation of key choice (optional)"
}
```

**Examples:**

Input: "AI 網頁遊戲配置" in editor/game_aiWebGame/SettingPanel/GameConfig.jsx <h2>
Output Key: editor.aiWebGame.gameConfig.title

Input: "保存" button in editor/components/SideBar/Prize/Dialog/PrizeInfoDialog.jsx
Output Key: editor.prize.infoDialog.save

Input: "載入中..." in client/game_aiWebGame/GameContainer.jsx
Output Key: client.aiWebGame.loading

Input: "取消" button (common usage across app)
Output Key: common.button.cancel
```

---

## 實施計劃

### 階段 1：使用路徑分析增強 AI Service

**要修改的文件：**
- `src/core/ai-service.ts` - 新增路徑分析邏輯
- `src/types/i18n.ts` - 新增新的類型定義

**新參數：**
- 將 `filePath: string` 新增到 `getAiSuggestions()` 方法
- 將 `projectRoot: string` 新增到 AiService 建構函數

**變更：**
1. 實作 `analyzeFilePath()` 函數
2. 實作 `detectElementContext()` 函數
3. 實作 `constructI18nKey()` 函數
4. 使用路徑上下文更新 AI prompt

### 階段 2：更新 File Processor

**要修改的文件：**
- `src/core/file-processor.ts` - 將文件路徑傳遞給 AI service

**變更：**
1. 將 `filePath` 傳遞給 `aiService.getAiSuggestions()`
2. 初始化 AiService 時傳遞 `projectRoot`

### 階段 3：測試

**測試案例：**
1. Editor flow 文件 → Key 以 `editor.` 開頭
2. Client flow 文件 → Key 以 `client.` 開頭
3. 共享元件 → Key 以 `common.` 開頭
4. 遊戲特定文件 → 包含遊戲模組名稱
5. 深度巢狀元件 → 遵守最大深度 5 層

### 階段 4：文件

**要建立/更新的文件：**
- 使用新的 key 命名慣例更新 `CLAUDE.md`
- 在 `docs/examples/` 中建立範例
- 更新 MCP 工具描述

---

## 這種方法的優點

### 1. 語義化且可維護
- Key 反映應用程式結構和含義
- 易於理解和定位
- 在重構中存活（如果結構得以維護）

### 2. 可擴展
- 適用於任何規模的專案
- 支援按命名空間/模組進行程式碼分割
- 團隊成員可以獨立處理不同的模組

### 3. 一致
- 自動生成確保一致性
- 清晰的規則減少人為錯誤
- AI 遵循專案慣例

### 4. 上下文感知
- 文件路徑提供自然階層
- 包含模組和元件上下文
- 元素類型增加語義清晰度

### 5. 對開發者友善
- 直觀的 key 結構
- 易於預測 key 名稱
- IDE 中的自動完成友善

---

## 遷移指南（對於現有專案）

### 選項 1：逐步遷移
- 新翻譯使用新格式
- 保持現有 key 不變
- 在重構期間逐步遷移

### 選項 2：自動化遷移
- 建立遷移腳本以分析和重新命名 key
- 更新程式碼庫中的所有引用
- 使用測試進行驗證

### 選項 3：雙格式支援
- 支援舊格式和新格式
- 隨時間淘汰舊格式
- 顯示舊樣式 key 的警告

---

## 附錄：比較表

| 方面 | 當前方法 | 提議方法 |
|--------|-----------------|-------------------|
| **結構** | 平坦、基於元素類型 | 階層式、上下文感知 |
| **範例** | `label.xxx_aaa_sss_ddd` | `editor.aiWebGame.gameConfig.title` |
| **上下文** | 僅元素類型 | 文件路徑 + 模組 + 元件 |
| **可擴展性** | 差（平坦命名空間） | 優秀（巢狀結構） |
| **可維護性** | 困難 | 容易 |
| **語義性** | 低（通用名稱） | 高（有意義的名稱） |
| **程式碼分割** | 不支援 | 完全支援 |
| **團隊協作** | 可能發生衝突 | 按模組隔離 |
| **最大深度** | 無限制 | 4-5 層 |

---

## 參考資料

1. **Locize** - "The Art of the Key: A Definitive Guide to i18n Key Naming"
2. **Tolgee** - "The Key to Translation: The Ultimate Guide to Naming Translation Keys"
3. **Lokalise** - "Translation keys: naming conventions and organizing"
4. **POEditor** - "Best Practices for Naming String Identifiers"
5. **React i18next** - "Multiple Translation Files" & "Namespaces"
6. **DEV Community** - "Three ways to name i18n translation keys"
7. **ButterCMS** - "React Internationalization for Large Scale Apps"

---

**文件版本：** 1.0
**最後更新：** 2025-01-13
**狀態：** 提議
**下一步：** 審查 → 實作 → 測試 → 部署
