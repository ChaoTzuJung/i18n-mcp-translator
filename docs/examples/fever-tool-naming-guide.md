# i18n Key 命名規範 - fever-tool

本文件提供 fever-tool 專案的 i18n key 命名指南。

## 專案概述

fever-tool 是一個專注於現場助理功能的工具應用程式。它為工作人員提供管理促銷活動、任務獎勵和生成現場促銷素材的工具。

**主要功能：**
- 現場助理 - 現場操作的工作人員工具
- 任務獎勵管理 - 處理基於任務的獎勵
- 促銷碼生成器 - 生成促銷碼和素材
- 促銷連結與 QR Code - 分享促銷連結
- 相機掃描器 - 掃描 QR codes 進行兌換

**目標語言：**
- 繁體中文 (zh-TW) - 主要
- 英文 (en-US) - 次要

## 命名結構

```
{feature}.{page}.{section}.{element}
```

### 結構元件

- **feature**: 頂層功能 (onSiteAssistant, login, common)
- **page**: 功能內的特定頁面 (promotions, missionReward, promoGenerator, tools)
- **section**: 頁面內的區塊或元件 (form, list, dialog, header)
- **element**: UI 元素 (button, title, label, input, message)

## 基於功能的範例

### 現場助理模組

#### 促銷活動頁面
```
onSiteAssistant.promotions.title
onSiteAssistant.promotions.subtitle
onSiteAssistant.promotions.list.empty.message
onSiteAssistant.promotions.list.loading
onSiteAssistant.promotions.card.title
onSiteAssistant.promotions.card.status.active
onSiteAssistant.promotions.card.status.expired
onSiteAssistant.promotions.card.button.view
onSiteAssistant.promotions.card.button.share
onSiteAssistant.promotions.search.placeholder
onSiteAssistant.promotions.filter.all
onSiteAssistant.promotions.filter.active
onSiteAssistant.promotions.filter.expired
```

#### 任務獎勵頁面

**任務獎勵列表：**
```
onSiteAssistant.missionReward.title
onSiteAssistant.missionReward.subtitle
onSiteAssistant.missionReward.list.empty.message
onSiteAssistant.missionReward.item.name
onSiteAssistant.missionReward.item.description
onSiteAssistant.missionReward.item.status
onSiteAssistant.missionReward.item.button.edit
onSiteAssistant.missionReward.item.button.view
```

**任務獎勵編輯：**
```
onSiteAssistant.missionRewardEdit.title
onSiteAssistant.missionRewardEdit.form.label.name
onSiteAssistant.missionRewardEdit.form.label.reward
onSiteAssistant.missionRewardEdit.form.label.quantity
onSiteAssistant.missionRewardEdit.form.placeholder.name
onSiteAssistant.missionRewardEdit.form.placeholder.quantity
onSiteAssistant.missionRewardEdit.button.save
onSiteAssistant.missionRewardEdit.button.cancel
onSiteAssistant.missionRewardEdit.success.saved
onSiteAssistant.missionRewardEdit.error.saveFailed
```

**任務獎勵記錄：**
```
onSiteAssistant.missionRewardRecord.title
onSiteAssistant.missionRewardRecord.table.header.name
onSiteAssistant.missionRewardRecord.table.header.reward
onSiteAssistant.missionRewardRecord.table.header.status
onSiteAssistant.missionRewardRecord.table.header.date
onSiteAssistant.missionRewardRecord.table.empty
onSiteAssistant.missionRewardRecord.status.pending
onSiteAssistant.missionRewardRecord.status.completed
onSiteAssistant.missionRewardRecord.status.rejected
onSiteAssistant.missionRewardRecord.button.approve
onSiteAssistant.missionRewardRecord.button.reject
```

#### 促銷碼生成器

```
onSiteAssistant.promoGenerator.title
onSiteAssistant.promoGenerator.subtitle
onSiteAssistant.promoGenerator.select.label
onSiteAssistant.promoGenerator.select.placeholder
onSiteAssistant.promoGenerator.input.label.quantity
onSiteAssistant.promoGenerator.input.placeholder.quantity
onSiteAssistant.promoGenerator.button.generate
onSiteAssistant.promoGenerator.button.download
onSiteAssistant.promoGenerator.success.generated
onSiteAssistant.promoGenerator.error.generateFailed
onSiteAssistant.promoGenerator.validation.quantityRequired
onSiteAssistant.promoGenerator.validation.maxQuantity
```

#### 促銷碼生成記錄

```
onSiteAssistant.promoGenerateRecord.title
onSiteAssistant.promoGenerateRecord.table.header.promo
onSiteAssistant.promoGenerateRecord.table.header.quantity
onSiteAssistant.promoGenerateRecord.table.header.date
onSiteAssistant.promoGenerateRecord.table.header.actions
onSiteAssistant.promoGenerateRecord.table.empty
onSiteAssistant.promoGenerateRecord.button.view
onSiteAssistant.promoGenerateRecord.button.download
onSiteAssistant.promoGenerateRecord.button.delete
onSiteAssistant.promoGenerateRecord.confirm.delete.title
onSiteAssistant.promoGenerateRecord.confirm.delete.message
```

#### 促銷連結與 QR Code

```
onSiteAssistant.promoLink.title
onSiteAssistant.promoLink.subtitle
onSiteAssistant.promoLink.qrcode.label
onSiteAssistant.promoLink.link.label
onSiteAssistant.promoLink.link.copy
onSiteAssistant.promoLink.link.copied
onSiteAssistant.promoLink.button.download
onSiteAssistant.promoLink.button.share
onSiteAssistant.promoLink.info.scanToJoin
onSiteAssistant.promoLink.info.validUntil
```

#### 工具頁面

```
onSiteAssistant.tools.title
onSiteAssistant.tools.subtitle
onSiteAssistant.tools.section.scanner.title
onSiteAssistant.tools.section.scanner.description
onSiteAssistant.tools.section.generator.title
onSiteAssistant.tools.section.generator.description
onSiteAssistant.tools.section.record.title
onSiteAssistant.tools.section.record.description
onSiteAssistant.tools.card.button.open
```

### 相機與掃描器元件

```
camera.scanner.title
camera.scanner.instruction
camera.scanner.button.scan
camera.scanner.button.cancel
camera.scanner.success.scanned
camera.scanner.error.invalidQR
camera.scanner.error.cameraNotFound
camera.permission.deny.title
camera.permission.deny.message
camera.permission.deny.button.settings
camera.openExternal.title
camera.openExternal.message
camera.openExternal.button.open
```

### 對話框元件

**資訊對話框：**
```
dialog.info.title
dialog.info.button.confirm
dialog.info.button.close
```

**訊息對話框：**
```
dialog.message.title
dialog.message.button.ok
dialog.message.button.cancel
```

**系統錯誤對話框：**
```
dialog.systemError.title
dialog.systemError.message
dialog.systemError.button.retry
dialog.systemError.button.close
```

**控制器對話框：**
```
dialog.controller.title
dialog.controller.message
dialog.controller.button.confirm
dialog.controller.button.cancel
```

### 登入模組

```
login.title
login.subtitle
login.button.google
login.button.facebook
login.button.line
login.button.email
login.error.loginFailed
login.error.network
login.loading.message
login.dev.title
login.dev.button.testLogin
```

### 通用元件

#### 按鈕
```
common.button.save
common.button.cancel
common.button.delete
common.button.edit
common.button.confirm
common.button.close
common.button.back
common.button.next
common.button.submit
common.button.download
common.button.share
common.button.copy
common.button.scan
common.button.generate
```

#### 載入
```
common.loading.message
common.loading.pleaseWait
common.loading.processing
common.loading.uploading
common.loading.downloading
```

#### 空狀態
```
common.empty.noData
common.empty.noResults
common.empty.noRecords
common.empty.message
```

#### 訊息
```
common.success.saved
common.success.deleted
common.success.updated
common.success.copied
common.success.generated
common.error.network
common.error.unauthorized
common.error.notFound
common.error.serverError
common.error.invalidInput
common.error.operationFailed
```

#### 驗證
```
common.validation.required
common.validation.email
common.validation.phone
common.validation.url
common.validation.number
common.validation.minLength
common.validation.maxLength
common.validation.minValue
common.validation.maxValue
```

#### 時間與日期
```
common.time.now
common.time.today
common.time.yesterday
common.time.tomorrow
common.time.validUntil
common.date.format
common.date.startDate
common.date.endDate
```

#### 狀態
```
common.status.active
common.status.inactive
common.status.expired
common.status.pending
common.status.completed
common.status.approved
common.status.rejected
```

#### 動作
```
common.action.view
common.action.edit
common.action.delete
common.action.approve
common.action.reject
common.action.download
common.action.share
common.action.copy
```

### 小工具元件

```
widget.countdown.title
widget.countdown.timeRemaining
widget.countdown.expired
widget.closeIcon.tooltip
```

### 標頭元件

```
header.title.default
header.button.menu
header.button.back
header.button.logout
header.user.greeting
```

### 頁尾元件

```
footer.button.home
footer.button.tools
footer.button.profile
footer.text.copyright
```

### 錯誤頁面

```
error.notFound.title
error.notFound.message
error.notFound.button.home
error.forbidden.title
error.forbidden.message
error.forbidden.button.back
```

## 命名指南

### DO ✅

1. **使用階層式命名：**
   ```
   ✅ onSiteAssistant.promotions.list.empty.message
   ❌ promotionsListEmptyMessage
   ```

2. **明確指定功能：**
   ```
   ✅ onSiteAssistant.missionReward.form.label.name
   ❌ form.name
   ```

3. **將相關項目分組：**
   ```
   ✅ camera.scanner.title
   ✅ camera.scanner.instruction
   ✅ camera.scanner.button.scan
   ```

4. **使用語意化名稱：**
   ```
   ✅ onSiteAssistant.promoGenerator.success.generated
   ❌ onSiteAssistant.promoGenerator.msg1
   ```

5. **保持通用項目一致：**
   ```
   ✅ common.button.save (used everywhere)
   ❌ Different keys for same action in different places
   ```

### DON'T ❌

1. **不要過度使用縮寫：**
   ```
   ❌ osa.promo.gen.btn
   ✅ onSiteAssistant.promoGenerator.button
   ```

2. **不要混用命名風格：**
   ```
   ❌ onSiteAssistant.promo_generator.ButtonSave
   ✅ onSiteAssistant.promoGenerator.button.save
   ```

3. **不要建立過深的巢狀結構：**
   ```
   ❌ onSiteAssistant.page.section.subsection.component.element.button.primary
   ✅ onSiteAssistant.promoGenerator.button.generate
   ```

4. **不要重複通用 keys：**
   ```
   ❌ onSiteAssistant.promotions.button.save
   ❌ onSiteAssistant.missionReward.button.save
   ✅ common.button.save (use this in both places)
   ```

## 特殊模式

### 成功訊息

Format: `{feature}.{page}.success.{action}`

```
onSiteAssistant.missionRewardEdit.success.saved
onSiteAssistant.promoGenerator.success.generated
onSiteAssistant.promoLink.success.copied
```

### 錯誤訊息

Format: `{feature}.{page}.error.{errorType}`

```
onSiteAssistant.missionRewardEdit.error.saveFailed
onSiteAssistant.promoGenerator.error.generateFailed
camera.scanner.error.invalidQR
```

### 驗證訊息

Format: `{feature}.{page}.validation.{rule}` or `common.validation.{rule}`

```
onSiteAssistant.promoGenerator.validation.quantityRequired
onSiteAssistant.promoGenerator.validation.maxQuantity
common.validation.required
common.validation.email
```

### 空狀態

格式： `{feature}.{page}.empty.{context}` 或 `common.empty.{type}`

```
onSiteAssistant.promotions.list.empty.message
onSiteAssistant.missionRewardRecord.table.empty
common.empty.noData
```

### 狀態標籤

格式： `{feature}.{page}.status.{statusName}` 或 `common.status.{statusName}`

```
onSiteAssistant.promotions.card.status.active
onSiteAssistant.missionRewardRecord.status.pending
common.status.completed
```

## AI 翻譯的上下文參考

生成 i18n keys 時，請考慮：

1. **檔案位置上下文：**
   - `src/features/OnSiteAssistant/pages/Promotions.js` → `onSiteAssistant.promotions.*`
   - `src/features/OnSiteAssistant/pages/MissionRewardEdit.js` → `onSiteAssistant.missionRewardEdit.*`
   - `src/components/Camera/CameraScanQRCode.js` → `camera.scanner.*`
   - `src/components/Dialog/DialogInfo.js` → `dialog.info.*`

2. **元件類型：**
   - Button → `.button.*`
   - Form input → `.form.input.*` or `.input.*`
   - Form label → `.form.label.*`
   - Table header → `.table.header.*`
   - Dialog → `dialog.*`

3. **動作上下文：**
   - Save action → `.button.save` or `.success.saved`
   - Delete action → `.button.delete` or `.confirm.delete.*`
   - Generate action → `.button.generate` or `.success.generated`

4. **重用通用 Keys：**
   - Standard buttons → Use `common.button.*`
   - Standard messages → Use `common.success.*` or `common.error.*`
   - Standard validations → Use `common.validation.*`

## 依檔案位置的範例

**檔案：** `src/features/OnSiteAssistant/pages/Promotions.js`
**生成的 keys：**
```
onSiteAssistant.promotions.title
onSiteAssistant.promotions.list.empty.message
onSiteAssistant.promotions.card.button.view
```

**檔案：** `src/features/OnSiteAssistant/pages/PromoGenerator.js`
**生成的 keys：**
```
onSiteAssistant.promoGenerator.title
onSiteAssistant.promoGenerator.input.label.quantity
onSiteAssistant.promoGenerator.button.generate
```

**檔案：** `src/components/Camera/CameraScanQRCode.js`
**生成的 keys：**
```
camera.scanner.title
camera.scanner.instruction
camera.scanner.button.scan
```

**檔案：** `src/components/Dialog/DialogCameraPermissionDeny.js`
**生成的 keys：**
```
camera.permission.deny.title
camera.permission.deny.message
camera.permission.deny.button.settings
```

**檔案：** `src/components/Common/LoadingWrapper.js`
**生成的 keys：**
```
common.loading.message
common.loading.pleaseWait
```

## 專案特定規則

1. **OnSiteAssistant 前綴：**
   - 所有現場助理功能使用 `onSiteAssistant.*` 前綴
   - 頁面名稱匹配檔案名稱：`MissionRewardEdit` → `missionRewardEdit`

2. **相機元件：**
   - 所有相機相關元件使用 `camera.*` 前綴
   - 掃描器：`camera.scanner.*`
   - 權限：`camera.permission.*`

3. **通用元件：**
   - 真正通用的元素使用 `common.*`
   - 盡可能重用通用 keys
   - 不要為相同功能建立重複的 keys

4. **對話框元件：**
   - 所有對話框使用 `dialog.*` 前綴
   - 對話框類型決定第二層級：`dialog.info.*`、`dialog.systemError.*`

5. **頁面命名：**
   - 頁面名稱使用駝峰式命名
   - 匹配元件檔案名稱模式
   - `MissionRewardRecord` → `missionRewardRecord`

## 翻譯檔案結構

fever-tool 使用每種語言單獨的檔案：

```
src/locale/
├── zh-TW.json  (Traditional Chinese)
└── en-US.json  (English)
```

每個檔案都有扁平的 key-value 結構：
```json
{
  "onSiteAssistant.promotions.title": "促銷活動",
  "onSiteAssistant.promotions.list.empty.message": "目前沒有促銷活動",
  "common.button.save": "儲存"
}
```

## 總結

**fever-tool i18n 的主要特點：**
- 功能優先命名：`onSiteAssistant.*`
- 頁面特定 keys：`.missionReward.*`、`.promoGenerator.*`
- 元件特定 keys：`camera.*`、`dialog.*`
- 大量使用通用 keys：`common.*`
- 語意化和階層式結構
- 簡單的雙語言支援 (zh-TW, en-US)

**如有疑問：**
- 首先檢查是否存在通用 key
- 使用功能名稱作為第一層級
- 使用頁面/元件名稱作為第二層級
- 保持簡單和語意化

---

**最後更新：** 2025-11-14
**版本：** 1.0.0
**專案：** fever-tool
**語言：** zh-TW (主要), en-US (次要)
