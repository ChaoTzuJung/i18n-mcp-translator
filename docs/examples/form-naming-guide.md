# i18n Key 命名規範 - 表單專案

本文件提供表單專案的 i18n key 命名指南。

## 專案概述

表單專案是一個綜合性的表單建立器，具有兩種不同的模式：

**編輯器模式** - 用於建立和編輯表單：
- 拖放式欄位建立器
- 版面配置和樣式自訂
- 多頁面支援
- 欄位設定和驗證
- 表單發佈和分享

**客戶端模式** - 用於顯示和填寫表單：
- 響應式表單渲染
- 欄位驗證
- 進度追蹤
- 表單提交

**目標語言：**
- 繁體中文 (zh-TW) - 主要
- 英文 (en-US) - 次要
- 其他需要的語言

**i18n 檔案結構：**
```
src/locale/
├── client/     # 客戶端模式翻譯
│   ├── zh-TW.json
│   └── en-US.json
└── editor/     # 編輯器模式翻譯
    ├── zh-TW.json
    └── en-US.json
```

## 命名結構

```
{mode}.{domain}.{component}.{element}.{property}
```

### 結構元件

- **mode**: `editor`、`client` 或 `common` (共用)
- **domain**: 功能領域 (field, setting, panel, navbar, 等)
- **component**: 特定元件 (singleLine, multiLine, dropdown, 等)
- **element**: UI 元素 (button, label, input, message, 等)
- **property**: 屬性或狀態 (placeholder, title, error, success, 等)

## 編輯器模式 Keys

### 導覽列 (Navigation Bar)

```
editor.navbar.title
editor.navbar.button.save
editor.navbar.button.preview
editor.navbar.button.publish
editor.navbar.button.settings
editor.navbar.button.back
editor.navbar.profile.menu.logout
editor.navbar.profile.menu.account
editor.navbar.save.success
editor.navbar.save.error
editor.navbar.save.autoSaved
editor.navbar.publish.success
editor.navbar.publish.error
editor.navbar.publish.confirm.title
editor.navbar.publish.confirm.message
```

### 欄位面板 (Field Selection)

```
editor.fieldPanel.title
editor.fieldPanel.search.placeholder
editor.fieldPanel.category.basic
editor.fieldPanel.category.advanced
editor.fieldPanel.category.layout
```

### 問題面板 (Field Types)

```
editor.questionPanel.title
editor.questionPanel.field.singleLine.name
editor.questionPanel.field.singleLine.description
editor.questionPanel.field.multiLine.name
editor.questionPanel.field.multiLine.description
editor.questionPanel.field.dropdown.name
editor.questionPanel.field.dropdown.description
editor.questionPanel.field.checkbox.name
editor.questionPanel.field.checkbox.description
editor.questionPanel.field.radio.name
editor.questionPanel.field.radio.description
editor.questionPanel.field.fileUpload.name
editor.questionPanel.field.fileUpload.description
editor.questionPanel.field.datePicker.name
editor.questionPanel.field.datePicker.description
editor.questionPanel.field.rating.name
editor.questionPanel.field.rating.description
editor.questionPanel.field.imageChoice.name
editor.questionPanel.field.imageChoice.description
editor.questionPanel.field.textChoice.name
editor.questionPanel.field.textChoice.description
editor.questionPanel.field.term.name
editor.questionPanel.field.term.description
editor.questionPanel.field.doubleDropdown.name
editor.questionPanel.field.doubleDropdown.description
```

### 欄位設定

**一般設定：**
```
editor.fieldSetting.general.title
editor.fieldSetting.general.label.name
editor.fieldSetting.general.label.description
editor.fieldSetting.general.placeholder.name
editor.fieldSetting.general.placeholder.description
editor.fieldSetting.general.required.label
editor.fieldSetting.general.required.hint
```

**驗證設定：**
```
editor.fieldSetting.validation.title
editor.fieldSetting.validation.required
editor.fieldSetting.validation.email
editor.fieldSetting.validation.phone
editor.fieldSetting.validation.url
editor.fieldSetting.validation.minLength.label
editor.fieldSetting.validation.maxLength.label
editor.fieldSetting.validation.pattern.label
editor.fieldSetting.validation.pattern.hint
editor.fieldSetting.validation.checkDuplicate.label
editor.fieldSetting.validation.checkDuplicate.hint
```

**欄位特定設定：**

**單行文字：**
```
editor.fieldSetting.singleLine.placeholder.label
editor.fieldSetting.singleLine.placeholder.placeholder
editor.fieldSetting.singleLine.textAlign.label
editor.fieldSetting.singleLine.width.label
```

**多行文字：**
```
editor.fieldSetting.multiLine.placeholder.label
editor.fieldSetting.multiLine.rows.label
editor.fieldSetting.multiLine.maxLength.label
```

**下拉選單：**
```
editor.fieldSetting.dropdown.options.title
editor.fieldSetting.dropdown.options.add
editor.fieldSetting.dropdown.options.placeholder
editor.fieldSetting.dropdown.multiChoice.label
editor.fieldSetting.dropdown.optionsLimited.label
editor.fieldSetting.dropdown.optionsLimited.hint
```

**檔案上傳：**
```
editor.fieldSetting.fileUpload.fileType.label
editor.fieldSetting.fileUpload.maxSize.label
editor.fieldSetting.fileUpload.maxFiles.label
editor.fieldSetting.fileUpload.cropType.label
editor.fieldSetting.fileUpload.cropType.square
editor.fieldSetting.fileUpload.cropType.free
```

**日期選擇器：**
```
editor.fieldSetting.datePicker.format.label
editor.fieldSetting.datePicker.minDate.label
editor.fieldSetting.datePicker.maxDate.label
editor.fieldSetting.datePicker.defaultToday.label
```

**評分：**
```
editor.fieldSetting.rating.number.label
editor.fieldSetting.rating.type.label
editor.fieldSetting.rating.type.star
editor.fieldSetting.rating.type.heart
editor.fieldSetting.rating.type.custom
editor.fieldSetting.rating.customIcon.label
editor.fieldSetting.rating.customIcon.upload
```

**圖片/文字選擇：**
```
editor.fieldSetting.choice.options.title
editor.fieldSetting.choice.option.add
editor.fieldSetting.choice.option.addImage
editor.fieldSetting.choice.rowItemNumber.label
editor.fieldSetting.choice.multiChoice.label
```

**雙層下拉選單：**
```
editor.fieldSetting.doubleDropdown.firstLevel.label
editor.fieldSetting.doubleDropdown.secondLevel.label
editor.fieldSetting.doubleDropdown.required.first
editor.fieldSetting.doubleDropdown.required.second
editor.fieldSetting.doubleDropdown.placeholder.first
editor.fieldSetting.doubleDropdown.placeholder.second
```

### 設定面板 (Form Settings)

**一般設定：**
```
editor.settingPanel.general.title
editor.settingPanel.general.name.label
editor.settingPanel.general.name.placeholder
editor.settingPanel.general.description.label
editor.settingPanel.general.description.placeholder
editor.settingPanel.general.language.label
editor.settingPanel.general.language.hint
editor.settingPanel.general.metaImage.label
editor.settingPanel.general.metaImage.hint
```

**版面配置設定：**
```
editor.settingPanel.layout.title
editor.settingPanel.layout.backgroundColor.label
editor.settingPanel.layout.backgroundImage.label
editor.settingPanel.layout.backgroundMode.label
editor.settingPanel.layout.backgroundMode.color
editor.settingPanel.layout.backgroundMode.image
editor.settingPanel.layout.formContentBackground.label
editor.settingPanel.layout.questionLayout.label
editor.settingPanel.layout.answerLayout.label
editor.settingPanel.layout.buttonLayout.label
```

**樣式設定：**
```
editor.settingPanel.style.title
editor.settingPanel.style.primaryColor.label
editor.settingPanel.style.secondaryColor.label
editor.settingPanel.style.textColor.label
editor.settingPanel.style.buttonColor.label
editor.settingPanel.style.buttonTextColor.label
```

**電子郵件通知：**
```
editor.settingPanel.emailNotify.title
editor.settingPanel.emailNotify.enable.label
editor.settingPanel.emailNotify.recipients.label
editor.settingPanel.emailNotify.recipients.placeholder
editor.settingPanel.emailNotify.recipients.hint
editor.settingPanel.emailNotify.subject.label
editor.settingPanel.emailNotify.subject.placeholder
```

### 頁面選單 (Multi-page Forms)

```
editor.pageMenu.title
editor.pageMenu.button.add
editor.pageMenu.page.title
editor.pageMenu.page.delete.confirm.title
editor.pageMenu.page.delete.confirm.message
editor.pageMenu.page.duplicate
editor.pageMenu.page.rename
editor.pageMenu.page.move.up
editor.pageMenu.page.move.down
editor.pageMenu.result.title
editor.pageMenu.result.description
```

### 全域區塊面板

```
editor.globalSection.title
editor.globalSection.description
editor.globalSection.convert.button
editor.globalSection.convert.confirm.title
editor.globalSection.convert.confirm.message
editor.globalSection.field.select
editor.globalSection.field.selected
```

### 隱藏欄位面板

```
editor.hiddenField.title
editor.hiddenField.description
editor.hiddenField.add.button
editor.hiddenField.name.label
editor.hiddenField.name.placeholder
editor.hiddenField.value.label
editor.hiddenField.value.placeholder
editor.hiddenField.queryString.title
editor.hiddenField.queryString.enable
editor.hiddenField.info.title
editor.hiddenField.info.message
```

### 標籤設定面板

```
editor.tagSetting.title
editor.tagSetting.search.placeholder
editor.tagSetting.add.button
editor.tagSetting.tag.edit
editor.tagSetting.tag.delete
editor.tagSetting.tag.color
editor.tagSetting.dialog.add.title
editor.tagSetting.dialog.edit.title
editor.tagSetting.dialog.delete.confirm
editor.tagSetting.dialog.name.label
editor.tagSetting.dialog.name.placeholder
```

### 上傳元件

```
editor.upload.dropzone.title
editor.upload.dropzone.description
editor.upload.dropzone.button
editor.upload.progress.uploading
editor.upload.progress.processing
editor.upload.success.uploaded
editor.upload.error.fileType
editor.upload.error.fileSize
editor.upload.error.upload
editor.upload.cropper.title
editor.upload.cropper.button.crop
editor.upload.cropper.button.cancel
editor.upload.cropper.button.reset
```

### 對話框

**批次上傳對話框：**
```
editor.dialog.batchUpload.title
editor.dialog.batchUpload.download.template
editor.dialog.batchUpload.upload.file
editor.dialog.batchUpload.preview
editor.dialog.batchUpload.button.import
editor.dialog.batchUpload.button.cancel
editor.dialog.batchUpload.success
editor.dialog.batchUpload.error
```

**未儲存警告對話框：**
```
editor.dialog.alertNoSave.title
editor.dialog.alertNoSave.message
editor.dialog.alertNoSave.button.save
editor.dialog.alertNoSave.button.discard
editor.dialog.alertNoSave.button.cancel
```

**Webhook 表單設定對話框：**
```
editor.dialog.webhookSetting.title
editor.dialog.webhookSetting.url.label
editor.dialog.webhookSetting.method.label
editor.dialog.webhookSetting.additionalFields.title
editor.dialog.webhookSetting.button.save
editor.dialog.webhookSetting.button.test
editor.dialog.webhookSetting.test.success
editor.dialog.webhookSetting.test.error
```

**贊助商不可用對話框：**
```
editor.dialog.sponsorNotAvailable.title
editor.dialog.sponsorNotAvailable.message
editor.dialog.sponsorNotAvailable.button.upgrade
editor.dialog.sponsorNotAvailable.button.close
```

### 表單內容 (Editor View)

```
editor.formContent.add.field
editor.formContent.add.section
editor.formContent.section.title.placeholder
editor.formContent.section.button.delete
editor.formContent.section.button.duplicate
editor.formContent.section.button.moveUp
editor.formContent.section.button.moveDown
editor.formContent.field.button.delete
editor.formContent.field.button.duplicate
editor.formContent.field.button.settings
editor.formContent.textbox.placeholder
editor.formContent.textbox.image.upload
```

### 通知

```
editor.notification.save.success
editor.notification.save.error
editor.notification.publish.success
editor.notification.publish.error
editor.notification.field.added
editor.notification.field.deleted
editor.notification.field.duplicated
editor.notification.section.added
editor.notification.section.deleted
editor.notification.page.added
editor.notification.page.deleted
```

## 客戶端模式 Keys

### 表單顯示

```
client.form.title
client.form.description
client.form.progress.title
client.form.progress.step
client.form.progress.of
client.form.page.next
client.form.page.previous
client.form.page.submit
```

### 欄位

**單行文字：**
```
client.field.singleLine.placeholder
client.field.singleLine.error.required
client.field.singleLine.error.invalid
```

**多行文字：**
```
client.field.multiLine.placeholder
client.field.multiLine.remainingChars
client.field.multiLine.error.required
client.field.multiLine.error.maxLength
```

**下拉選單：**
```
client.field.dropdown.placeholder
client.field.dropdown.select
client.field.dropdown.noOptions
client.field.dropdown.error.required
client.field.dropdown.error.maxSelections
```

**檔案上傳：**
```
client.field.fileUpload.button
client.field.fileUpload.dropzone
client.field.fileUpload.dragHere
client.field.fileUpload.uploading
client.field.fileUpload.uploaded
client.field.fileUpload.error.required
client.field.fileUpload.error.fileType
client.field.fileUpload.error.fileSize
client.field.fileUpload.error.maxFiles
```

**日期選擇器：**
```
client.field.datePicker.placeholder
client.field.datePicker.selectDate
client.field.datePicker.error.required
client.field.datePicker.error.invalidDate
client.field.datePicker.error.minDate
client.field.datePicker.error.maxDate
```

**評分：**
```
client.field.rating.label
client.field.rating.error.required
```

**圖片選擇：**
```
client.field.imageChoice.select
client.field.imageChoice.error.required
client.field.imageChoice.error.maxSelections
```

**文字選擇：**
```
client.field.textChoice.select
client.field.textChoice.error.required
client.field.textChoice.error.maxSelections
```

**條款：**
```
client.field.term.agree
client.field.term.error.required
```

**雙層下拉選單：**
```
client.field.doubleDropdown.first.placeholder
client.field.doubleDropdown.second.placeholder
client.field.doubleDropdown.first.error.required
client.field.doubleDropdown.second.error.required
```

### 驗證訊息

```
client.validation.required
client.validation.email.invalid
client.validation.phone.invalid
client.validation.url.invalid
client.validation.pattern.invalid
client.validation.minLength
client.validation.maxLength
client.validation.minValue
client.validation.maxValue
client.validation.duplicate
```

### 表單提交

```
client.submit.button
client.submit.submitting
client.submit.success.title
client.submit.success.message
client.submit.error.title
client.submit.error.message
client.submit.error.network
client.submit.error.validation
```

### 對話框

```
client.dialog.error.title
client.dialog.error.message
client.dialog.error.button.close
client.dialog.error.button.retry
```

## 通用 Keys (編輯器與客戶端共用)

### 按鈕

```
common.button.save
common.button.cancel
common.button.delete
common.button.edit
common.button.duplicate
common.button.confirm
common.button.close
common.button.back
common.button.next
common.button.previous
common.button.submit
common.button.upload
common.button.download
common.button.add
common.button.remove
common.button.select
common.button.clear
common.button.apply
common.button.reset
```

### Dialogs

```
common.dialog.confirm.title
common.dialog.confirm.message
common.dialog.delete.title
common.dialog.delete.message
common.dialog.cancel.title
common.dialog.cancel.message
```

### 訊息

```
common.success.saved
common.success.deleted
common.success.updated
common.success.created
common.success.uploaded
common.error.network
common.error.server
common.error.unauthorized
common.error.notFound
common.error.invalidInput
common.error.operationFailed
```

### 載入

```
common.loading.message
common.loading.pleaseWait
common.loading.processing
common.loading.uploading
common.loading.downloading
```

### 空狀態

```
common.empty.noData
common.empty.noResults
common.empty.noFields
common.empty.noPages
common.empty.message
```

### 日期與時間

```
common.date.today
common.date.yesterday
common.date.tomorrow
common.date.format
common.time.format
```

### 狀態

```
common.status.active
common.status.inactive
common.status.draft
common.status.published
common.status.archived
```

### 顏色 (for color picker)

```
common.color.red
common.color.blue
common.color.green
common.color.yellow
common.color.purple
common.color.orange
common.color.pink
common.color.custom
```

## 命名指南

### DO ✅

1. **依模式分離：**
   ```
   ✅ editor.navbar.button.save
   ✅ client.form.page.submit
   ❌ navbar.button.save (missing mode)
   ```

2. **使用階層式結構：**
   ```
   ✅ editor.fieldSetting.singleLine.placeholder.label
   ❌ editorFieldSettingSingleLinePlaceholder
   ```

3. **明確指定欄位類型：**
   ```
   ✅ client.field.fileUpload.error.fileSize
   ❌ client.field.error.size
   ```

4. **將相關設定分組：**
   ```
   ✅ editor.fieldSetting.validation.required
   ✅ editor.fieldSetting.validation.email
   ✅ editor.fieldSetting.validation.minLength
   ```

5. **重用通用 keys：**
   ```
   ✅ common.button.save (used in both modes)
   ❌ editor.button.save + client.button.save (duplicate)
   ```

### DON'T ❌

1. **不要混用模式：**
   ```
   ❌ editor.client.field.name
   ✅ editor.field.name or client.field.name
   ```

2. **不要建立過深的巢狀結構：**
   ```
   ❌ editor.panel.setting.section.field.input.label.placeholder
   ✅ editor.fieldSetting.singleLine.placeholder
   ```

3. **不要過度使用縮寫：**
   ```
   ❌ ed.fld.sl.ph
   ✅ editor.field.singleLine.placeholder
   ```

4. **不要重複通用功能：**
   ```
   ❌ editor.button.delete + client.button.delete
   ✅ common.button.delete (use in both)
   ```

## 特殊模式

### 錯誤訊息

**編輯器模式：**
Format: `editor.{domain}.{component}.error.{errorType}`
```
editor.navbar.save.error
editor.upload.error.fileSize
editor.fieldSetting.validation.error.pattern
```

**客戶端模式：**
格式： `client.field.{fieldType}.error.{errorType}` 或 `client.validation.{rule}`
```
client.field.fileUpload.error.fileSize
client.field.datePicker.error.invalidDate
client.validation.required
client.validation.email.invalid
```

### 成功訊息

**編輯器模式：**
Format: `editor.{domain}.{action}.success`
```
editor.navbar.save.success
editor.upload.success.uploaded
editor.notification.field.added
```

**客戶端模式：**
格式： `client.{domain}.success.{context}`
```
client.submit.success.title
client.submit.success.message
```

### 佔位符

格式： `{mode}.{domain}.{component}.placeholder`
```
editor.fieldSetting.general.placeholder.name
editor.settingPanel.general.name.placeholder
client.field.singleLine.placeholder
client.field.dropdown.placeholder
```

### 標籤

格式： `{mode}.{domain}.{component}.label` 或 `{mode}.{domain}.{component}.{property}.label`
```
editor.fieldSetting.general.label.name
editor.fieldSetting.validation.required
editor.settingPanel.layout.backgroundColor.label
```

## AI 翻譯的上下文參考

生成 i18n keys 時，請考慮：

1. **模式上下文：**
   - Editor files (`src/editor/`) → Use `editor.*`
   - Client files (`src/client/`) → Use `client.*`
   - Common files (`src/common/`) → Use `common.*`

2. **領域上下文：**
   - Navbar components → `.navbar.*`
   - Field settings → `.fieldSetting.*`
   - Form settings → `.settingPanel.*`
   - Field components → `.field.*`
   - Validation → `.validation.*`

3. **元件類型：**
   - Field types → Specific field name (singleLine, multiLine, dropdown, etc.)
   - Buttons → `button.{action}`
   - Dialogs → `dialog.{dialogType}.*`

4. **重用策略：**
   - Standard buttons → Use `common.button.*`
   - Standard messages → Use `common.success.*` or `common.error.*`
   - Mode-specific functionality → Use `editor.*` or `client.*`

## 依檔案位置的範例

**檔案：** `src/editor/components/Navbar/Navbar.js`
**生成的 keys：**
```
editor.navbar.title
editor.navbar.button.save
editor.navbar.button.publish
```

**檔案：** `src/editor/components/SettingPanel/LayoutSetting/FormStyleSetting.js`
**生成的 keys：**
```
editor.settingPanel.layout.title
editor.settingPanel.layout.backgroundColor.label
editor.settingPanel.layout.backgroundImage.label
```

**檔案：** `src/client/components/FormContent/Field/FieldSingleLine.js`
**生成的 keys：**
```
client.field.singleLine.placeholder
client.field.singleLine.error.required
```

**檔案：** `src/common/components/Mui/Button.js`
**生成的 keys：**
```
common.button.save
common.button.cancel
common.button.delete
```

## 專案特定規則

1. **模式優先命名：**
   - Always start with mode: `editor.*`, `client.*`, or `common.*`
   - Never mix modes in a single key

2. **欄位類型特定性：**
   - 每個欄位類型都有自己的 key 空間
   - 範例：`editor.fieldSetting.singleLine.*`、`editor.fieldSetting.dropdown.*`

3. **通用 Key 策略：**
   - 對真正共用的功能使用 `common.*`
   - 按鈕、標準訊息和通用對話框
   - 不要過度使用 - 需要時請具體指定

4. **驗證訊息：**
   - 一般驗證 → `common.validation.*`
   - 欄位特定驗證 → `client.field.{type}.error.*`

5. **設定面板結構：**
   - 遵循面板階層
   - `editor.settingPanel.{category}.{property}.label`

## 遷移注意事項

如果從現有的 i18n 結構遷移：
- 檢查 `editor/` 和 `client/` 兩個目錄
- 保持模式分離
- 整合通用 keys
- 更新元件引用以使用新的 key 結構

---

**最後更新：** 2025-11-14
**版本：** 1.0.0
**專案：** 表單
**語言：** zh-TW (主要), en-US (次要), 以及其他語言
**模式：** 編輯器 (表單建立器), 客戶端 (表單檢視器/填寫器)
