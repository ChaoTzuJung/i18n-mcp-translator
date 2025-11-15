# i18n Key 命名規範 - [您的專案名稱]

本文件提供 [您的專案名稱] 的 i18n key 命名指南。

## 專案概述

[簡要描述您的專案及其主要功能/模組]

範例：
- 模組 1: 使用者管理
- 模組 2: 內容編輯器
- 模組 3: 分析儀表板
- 等等

## 命名結構

選擇適合您專案的結構：

### 選項 1：基於功能 (大型專案推薦)
```
{feature}.{page}.{component}.{element}.{action}
```

### 選項 2：基於頁面 (中型專案適用)
```
{page}.{section}.{element}.{action}
```

### 選項 3：基於元件 (元件庫適用)
```
{component}.{variant}.{element}.{state}
```

## 結構元件

定義命名結構中每個部分的含義：

- **feature**: [您的定義]
- **page**: [您的定義]
- **component**: [您的定義]
- **element**: [您的定義]
- **action**: [您的定義]

## 功能/模組範例

### [功能/模組 1 名稱]

**[頁面/區塊 1]：**
```
[feature].[page].title
[feature].[page].subtitle
[feature].[page].button.[action]
[feature].[page].table.header.[column]
```

**[頁面/區塊 2]：**
```
[feature].[page].form.label.[field]
[feature].[page].form.placeholder.[field]
[feature].[page].error.[errorType]
[feature].[page].success.[action]
```

### [功能/模組 2 名稱]

```
[feature].[page].[element].[action]
```

## 通用元件

定義在整個應用程式中使用的通用 keys：

### 按鈕
```
common.button.save
common.button.cancel
common.button.delete
common.button.edit
common.button.create
common.button.close
common.button.confirm
common.button.back
common.button.next
common.button.submit
```

### 對話框
```
common.dialog.confirm.title
common.dialog.confirm.message
common.dialog.delete.title
common.dialog.delete.message
```

### 表格
```
common.table.noData
common.table.loading
common.table.error
common.table.header.actions
```

### 表單
```
common.form.required
common.form.invalid
common.form.success
common.form.error
```

### 驗證
```
common.validation.required
common.validation.email
common.validation.phone
common.validation.url
common.validation.minLength
common.validation.maxLength
```

### 訊息
```
common.success.created
common.success.updated
common.success.deleted
common.success.saved
common.error.network
common.error.unauthorized
common.error.notFound
common.error.serverError
```

### 狀態標籤
```
common.status.active
common.status.inactive
common.status.draft
common.status.published
```

## 特殊模式

### 錯誤訊息

格式： `{feature}.{page}.error.{errorType}`

範例：
```
[feature].[page].error.[specificError]
```

### 成功訊息

格式： `{feature}.{page}.success.{action}`

範例：
```
[feature].[page].success.[action]
```

### 載入狀態

格式： `{feature}.{page}.loading.{action}`

範例：
```
[feature].[page].loading.[resource]
```

### 空狀態

格式： `{feature}.{page}.empty.{context}`

範例：
```
[feature].[page].empty.[resource]
```

## 命名指南

### DO ✅

1. **使用描述性名稱：**
   ```
   ✅ user.profile.form.email.label
   ❌ user.em
   ```

2. **遵循階層結構：**
   ```
   ✅ dashboard.analytics.chart.title
   ❌ dashboardAnalyticsChartTitle
   ```

3. **保持大小寫一致：**
   ```
   ✅ button.save, button.cancel (all lowercase)
   ❌ button.Save, button.cancel (mixed case)
   ```

4. **使用語意化名稱：**
   ```
   ✅ form.validation.email.invalid
   ❌ form.error1
   ```

5. **保持簡潔但清晰：**
   ```
   ✅ table.header.name
   ❌ table.header.userFirstAndLastNameColumn
   ```

### DON'T ❌

1. **不要過度使用縮寫：**
   ```
   ❌ usr.prof.btn.sv
   ✅ user.profile.button.save
   ```

2. **不要包含語言相關的詞彙：**
   ```
   ❌ user.profile.button.儲存
   ✅ user.profile.button.save
   ```

3. **不要使用模糊不清的名稱：**
   ```
   ❌ page.thing.stuff
   ✅ dashboard.widget.title
   ```

4. **不要建立不必要的深層巢狀：**
   ```
   ❌ app.page.section.subsection.component.element.button.primary.large
   ✅ app.page.button.submit
   ```

5. **不要使用數字作為識別符：**
   ```
   ❌ error.1, error.2
   ✅ error.network, error.validation
   ```

## AI 翻譯的上下文參考

生成 i18n keys 時，請考慮：

1. **檔案位置**：從檔案路徑中提取模組/功能
   - `src/features/[feature]/` → `[feature].*`
   - `src/pages/[page]/` → `[page].*`

2. **元件名稱**：使用元件名稱作為上下文
   - `UserDashboard.tsx` → `user.dashboard.*`
   - `ProfileEditor.tsx` → `profile.editor.*`

3. **UI 上下文**：識別元素類型
   - Button → `.button.*`
   - Input field → `.input.*` or `.form.*`
   - Table header → `.table.header.*`

4. **動作上下文**：如果適用，包含動作
   - Save button → `.button.save`
   - Delete confirm → `.delete.confirm`

## 依檔案位置的範例

**檔案：** `src/features/[feature]/pages/[Page].tsx`
**生成的 keys：**
```
[feature].[page].title
[feature].[page].button.[action]
[feature].[page].table.header.[column]
```

**檔案：** `src/components/[Component].tsx`
**生成的 keys：**
```
[component].title
[component].button.[action]
[component].label.[field]
```

## 專案特定規則

[在此添加任何專案特定的命名規則或慣例]

範例：
- 列表頁面始終使用複數：`users.list.*` 而非 `user.list.*`
- 編輯頁面使用 `form`：`user.form.*` 而非 `user.edit.*`
- 狀態 keys 應在 common 下：`common.status.*`

## 遷移注意事項

[如果從舊系統遷移，請在此添加說明]

範例：
- 舊格式：`USER_PROFILE_SAVE` → 新格式：`user.profile.button.save`
- 參見遷移指南：[遷移文件連結]

---

**使用此範本的說明：**

1. **複製此檔案**到您專案的 docs 資料夾
2. **替換所有 [佔位符]**為您專案特定的資訊
3. **添加範例**從您的實際程式碼庫中
4. **定期更新**隨著專案演進
5. **與您的團隊**和 AI 工具分享

**最後更新：** [日期]
**版本：** [版本]
**專案：** [專案名稱]
**維護者：** [您的名字/團隊]
