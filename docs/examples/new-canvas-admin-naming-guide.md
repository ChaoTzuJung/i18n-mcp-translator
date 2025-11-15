# i18n Key 命名規範 - new-canvas-admin

本文件提供 new-canvas-admin 專案的 i18n key 命名指南。

## 專案概述

new-canvas-admin 是一個綜合性的管理面板，包含多個功能模組：
- 成就系統
- 活動管理 (聊天、站內)
- 點數系統
- 促銷管理
- 表單建立器
- Webhook 管理
- 以及更多...

## 命名結構

```
{feature}.{page}.{component}.{element}.{action}
```

### 結構元件

- **feature**: 頂層功能模組 (achievement, campaign, point, 等)
- **page**: 功能內的特定頁面 (dashboard, create, setting, 等)
- **component**: 元件名稱 (如果適用)
- **element**: UI 元素類型 (button, title, label, input, 等)
- **action**: 動作或狀態 (save, cancel, edit, loading, error, 等)

## 基於功能的範例

### 成就模組

**儀表板：**
```
achievement.dashboard.title
achievement.dashboard.subtitle
achievement.dashboard.button.create
achievement.dashboard.table.header.name
achievement.dashboard.table.header.status
achievement.dashboard.empty.message
```

**建立頁面：**
```
achievement.create.title
achievement.create.form.label.name
achievement.create.form.placeholder.name
achievement.create.form.label.description
achievement.create.button.save
achievement.create.button.cancel
achievement.create.error.saveFailed
achievement.create.success.created
```

**等級設定：**
```
achievement.level.title
achievement.level.visual.upload.hint
achievement.level.visual.upload.error
achievement.level.description.placeholder
achievement.level.points.label
achievement.level.points.validation.required
```

**狀態：**
```
achievement.status.draft
achievement.status.published
achievement.status.archived
```

### 活動模組

**站內活動：**
```
campaign.onsite.editor.message.placeholder
campaign.onsite.editor.button.addMessage
campaign.onsite.dialog.publish.title
campaign.onsite.dialog.publish.message
campaign.onsite.dialog.publish.confirm
campaign.onsite.dialog.plugin.title
campaign.onsite.dialog.plugin.snippet.copy
campaign.onsite.setting.display.position.label
campaign.onsite.setting.trigger.timing.label
campaign.onsite.analytics.chart.label
```

**聊天活動：**
```
campaign.chat.dashboard.title
campaign.chat.editor.message.label
campaign.chat.editor.keyword.placeholder
campaign.chat.analytics.overview
campaign.chat.members.table.header.name
```

**通用活動：**
```
campaign.list.table.header.name
campaign.list.table.header.type
campaign.list.table.header.status
campaign.list.button.create
campaign.create.dialog.title
campaign.create.type.select.label
```

### 點數系統

**機制：**
```
point.mechanism.title
point.mechanism.behavior.title
point.mechanism.behavior.add
point.mechanism.behavior.table.header.action
point.mechanism.behavior.table.header.points
point.mechanism.channel.title
point.mechanism.campaign.title
point.mechanism.expire.title
```

**統計：**
```
point.statistical.title
point.statistical.chart.label
point.statistical.date.select
point.statistical.export.button
point.statistical.info.totalPoints
point.statistical.info.activeUsers
```

**設定：**
```
point.setting.info.label.name
point.setting.info.label.unit
point.setting.ratio.label
point.setting.style.background.label
point.setting.style.button.label
```

### 促銷模組

**列表：**
```
promo.list.table.header.name
promo.list.table.header.type
promo.list.table.header.status
promo.list.table.header.startDate
promo.list.table.header.endDate
promo.list.button.create
promo.list.filter.status
promo.list.filter.type
promo.list.empty.message
```

**建立/編輯：**
```
promo.create.title
promo.create.section.info.title
promo.create.section.reward.title
promo.create.section.qualification.title
promo.create.section.game.title
promo.create.button.save
promo.create.button.preview
```

**遊戲類型：**
```
promo.game.comment.title
promo.game.contest.title
promo.game.multiChallenge.title
promo.game.photoUpload.title
promo.game.vote.title
```

**獎品管理：**
```
promo.prize.draw.title
promo.prize.draw.button.random
promo.prize.participate.title
promo.prize.participate.table.header.name
promo.prize.redemption.title
```

**分析：**
```
promo.analytics.overview.title
promo.analytics.chart.views
promo.analytics.chart.participants
promo.analytics.export.button
```

### 表單模組

**編輯器：**
```
form.editor.title
form.editor.field.add
form.editor.field.delete
form.editor.field.duplicate
form.editor.section.add
form.editor.preview.button
form.editor.publish.button
```

**欄位類型：**
```
form.field.singleLine.label
form.field.multiLine.label
form.field.dropdown.label
form.field.checkbox.label
form.field.fileUpload.label
form.field.dateПicker.label
```

**Settings:**
```
form.setting.general.title
form.setting.style.title
form.setting.success.title
form.setting.webhook.title
```

### Webhook 模組

```
webhook.list.table.header.name
webhook.list.table.header.event
webhook.list.table.header.status
webhook.list.button.create
webhook.setting.event.label
webhook.setting.url.label
webhook.setting.test.button
webhook.test.success.message
webhook.test.error.message
```

### 分配點數模組

```
allocationPoint.console.title
allocationPoint.allocation.title
allocationPoint.addition.title
allocationPoint.allocation.table.header.sponsor
allocationPoint.allocation.table.header.points
allocationPoint.allocation.button.allocate
allocationPoint.addition.button.add
allocationPoint.dialog.permission.title
```

### 登入模組

```
login.email.label
login.email.placeholder
login.password.label
login.password.placeholder
login.button.submit
login.button.google
login.button.facebook
login.error.invalidCredentials
login.error.network
login.signup.link
login.forgotPassword.link
```

### 贊助商設定

```
sponsor.setting.info.title
sponsor.setting.plan.title
sponsor.setting.social.title
sponsor.setting.tracking.title
sponsor.setting.admin.title
sponsor.admin.table.header.name
sponsor.admin.table.header.role
sponsor.admin.button.invite
```

## 通用元件

這些 keys 在多個功能中使用，應保持一致：

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
common.button.download
common.button.upload
```

### 對話框
```
common.dialog.confirm.title
common.dialog.confirm.message
common.dialog.delete.title
common.dialog.delete.message
common.dialog.unsaved.title
common.dialog.unsaved.message
```

### 表格
```
common.table.noData
common.table.loading
common.table.error
common.table.header.actions
common.table.rowsPerPage
common.table.pagination
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
common.validation.pattern
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
common.loading.message
```

### 上傳
```
common.upload.hint
common.upload.dragHere
common.upload.button
common.upload.error.size
common.upload.error.type
common.upload.success
```

### 狀態標籤
```
common.status.active
common.status.inactive
common.status.draft
common.status.published
common.status.archived
common.status.pending
```

## 特殊模式

### 錯誤訊息

Format: `{feature}.{page}.error.{errorType}`

```
achievement.create.error.nameTooLong
achievement.create.error.invalidPoints
campaign.onsite.error.noMessage
promo.create.error.invalidDateRange
```

### 成功訊息

Format: `{feature}.{page}.success.{action}`

```
achievement.create.success.created
achievement.update.success.updated
campaign.publish.success.published
promo.delete.success.deleted
```

### 載入狀態

Format: `{feature}.{page}.loading.{action}`

```
achievement.dashboard.loading.data
campaign.analytics.loading.chart
promo.list.loading.promos
```

### 空狀態

Format: `{feature}.{page}.empty.{context}`

```
achievement.dashboard.empty.noAchievements
campaign.list.empty.noCampaigns
promo.list.empty.noPromos
form.editor.empty.noFields
```

## 命名指南

### DO ✅

1. **使用描述性名稱：**
   ```
   ✅ campaign.onsite.editor.message.placeholder
   ❌ campaign.msg.ph
   ```

2. **遵循層級結構：**
   ```
   ✅ point.mechanism.behavior.add
   ❌ pointMechanismBehaviorAdd
   ```

3. **保持命名一致性：**
   ```
   ✅ button.save, button.cancel (all lowercase)
   ❌ button.Save, button.cancel (mixed case)
   ```

4. **使用語意化名稱：**
   ```
   ✅ achievement.create.error.nameTooLong
   ❌ achievement.create.error1
   ```

### DON'T ❌

1. **不要過度使用縮寫：**
   ```
   ❌ achv.crt.btn.sv
   ✅ achievement.create.button.save
   ```

2. **不要包含語言相關的詞彙：**
   ```
   ❌ achievement.create.button.儲存
   ✅ achievement.create.button.save
   ```

3. **不要使用模糊不清的名稱：**
   ```
   ❌ campaign.thing.stuff
   ✅ campaign.onsite.message.content
   ```

4. **不要建立不必要的深層巢狀：**
   ```
   ❌ achievement.dashboard.page.section.subsection.component.element.button
   ✅ achievement.dashboard.button.create
   ```

## AI 翻譯的上下文參考

生成 i18n keys 時，請考慮：

1. **檔案位置**：從檔案路徑中提取功能/模組
   - `src/features/achievement/` → `achievement.*`
   - `src/features/campaign/onsite/` → `campaign.onsite.*`

2. **元件名稱**：使用元件名稱作為上下文
   - `AchievementDashboard.tsx` → `achievement.dashboard.*`
   - `CampaignEditor.tsx` → `campaign.*.editor.*`

3. **UI 上下文**：識別元素類型
   - Button → `.button.*`
   - Input field → `.input.*` or `.form.*`
   - Table header → `.table.header.*`

4. **動作上下文**：如果適用，包含動作
   - Save button → `.button.save`
   - Delete confirm → `.delete.confirm`

## 依檔案位置的範例

**檔案：** `src/features/achievement/pages/AchievementDashboard.js`
**生成的 keys：**
```
achievement.dashboard.title
achievement.dashboard.button.create
achievement.dashboard.table.header.name
```

**檔案：** `src/features/campaign/CampaignOnsite/Editor/OnsiteEditor.js`
**生成的 keys：**
```
campaign.onsite.editor.title
campaign.onsite.editor.message.placeholder
campaign.onsite.editor.button.save
```

**檔案：** `src/features/point/pages/Statistical.js`
**生成的 keys：**
```
point.statistical.title
point.statistical.chart.label
point.statistical.export.button
```

---

**最後更新：** 2025-11-14
**版本：** 1.0.0
**專案：** new-canvas-admin
