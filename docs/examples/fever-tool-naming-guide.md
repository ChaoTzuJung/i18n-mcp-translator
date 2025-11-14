# i18n Key Naming Convention - fever-tool

This document provides i18n key naming guidelines for the fever-tool project.

## Project Context

fever-tool is a utility application focused on OnSite Assistant functionality. It provides tools for staff to manage promotions, mission rewards, and generate promotional materials on-site.

**Main Features:**
- OnSite Assistant - Staff tools for on-site operations
- Mission Reward Management - Handle mission-based rewards
- Promo Generator - Generate promotional codes and materials
- Promo Link & QR Code - Share promotion links
- Camera Scanner - Scan QR codes for redemption

**Target Languages:**
- Traditional Chinese (zh-TW) - Primary
- English (en-US) - Secondary

## Naming Structure

```
{feature}.{page}.{section}.{element}
```

### Structure Components

- **feature**: Top-level feature (onSiteAssistant, login, common)
- **page**: Specific page within feature (promotions, missionReward, promoGenerator, tools)
- **section**: Section or component within page (form, list, dialog, header)
- **element**: UI element (button, title, label, input, message)

## Feature-Based Examples

### OnSite Assistant Module

#### Promotions Page
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

#### Mission Reward Pages

**Mission Reward List:**
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

**Mission Reward Edit:**
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

**Mission Reward Record:**
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

#### Promo Generator

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

#### Promo Generate Record

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

#### Promo Link & QR Code

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

#### Tools Page

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

### Camera & Scanner Components

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

### Dialog Components

**Info Dialog:**
```
dialog.info.title
dialog.info.button.confirm
dialog.info.button.close
```

**Message Dialog:**
```
dialog.message.title
dialog.message.button.ok
dialog.message.button.cancel
```

**System Error Dialog:**
```
dialog.systemError.title
dialog.systemError.message
dialog.systemError.button.retry
dialog.systemError.button.close
```

**Controller Dialog:**
```
dialog.controller.title
dialog.controller.message
dialog.controller.button.confirm
dialog.controller.button.cancel
```

### Login Module

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

### Common Components

#### Buttons
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

#### Loading
```
common.loading.message
common.loading.pleaseWait
common.loading.processing
common.loading.uploading
common.loading.downloading
```

#### Empty States
```
common.empty.noData
common.empty.noResults
common.empty.noRecords
common.empty.message
```

#### Messages
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

#### Validation
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

#### Time & Date
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

#### Status
```
common.status.active
common.status.inactive
common.status.expired
common.status.pending
common.status.completed
common.status.approved
common.status.rejected
```

#### Actions
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

### Widget Components

```
widget.countdown.title
widget.countdown.timeRemaining
widget.countdown.expired
widget.closeIcon.tooltip
```

### Header Components

```
header.title.default
header.button.menu
header.button.back
header.button.logout
header.user.greeting
```

### Footer Components

```
footer.button.home
footer.button.tools
footer.button.profile
footer.text.copyright
```

### Error Pages

```
error.notFound.title
error.notFound.message
error.notFound.button.home
error.forbidden.title
error.forbidden.message
error.forbidden.button.back
```

## Naming Guidelines

### DO ✅

1. **Use hierarchical naming:**
   ```
   ✅ onSiteAssistant.promotions.list.empty.message
   ❌ promotionsListEmptyMessage
   ```

2. **Be specific about features:**
   ```
   ✅ onSiteAssistant.missionReward.form.label.name
   ❌ form.name
   ```

3. **Group related items:**
   ```
   ✅ camera.scanner.title
   ✅ camera.scanner.instruction
   ✅ camera.scanner.button.scan
   ```

4. **Use semantic names:**
   ```
   ✅ onSiteAssistant.promoGenerator.success.generated
   ❌ onSiteAssistant.promoGenerator.msg1
   ```

5. **Keep common items consistent:**
   ```
   ✅ common.button.save (used everywhere)
   ❌ Different keys for same action in different places
   ```

### DON'T ❌

1. **Don't use abbreviations excessively:**
   ```
   ❌ osa.promo.gen.btn
   ✅ onSiteAssistant.promoGenerator.button
   ```

2. **Don't mix naming styles:**
   ```
   ❌ onSiteAssistant.promo_generator.ButtonSave
   ✅ onSiteAssistant.promoGenerator.button.save
   ```

3. **Don't create overly deep nesting:**
   ```
   ❌ onSiteAssistant.page.section.subsection.component.element.button.primary
   ✅ onSiteAssistant.promoGenerator.button.generate
   ```

4. **Don't duplicate common keys:**
   ```
   ❌ onSiteAssistant.promotions.button.save
   ❌ onSiteAssistant.missionReward.button.save
   ✅ common.button.save (use this in both places)
   ```

## Special Patterns

### Success Messages

Format: `{feature}.{page}.success.{action}`

```
onSiteAssistant.missionRewardEdit.success.saved
onSiteAssistant.promoGenerator.success.generated
onSiteAssistant.promoLink.success.copied
```

### Error Messages

Format: `{feature}.{page}.error.{errorType}`

```
onSiteAssistant.missionRewardEdit.error.saveFailed
onSiteAssistant.promoGenerator.error.generateFailed
camera.scanner.error.invalidQR
```

### Validation Messages

Format: `{feature}.{page}.validation.{rule}` or `common.validation.{rule}`

```
onSiteAssistant.promoGenerator.validation.quantityRequired
onSiteAssistant.promoGenerator.validation.maxQuantity
common.validation.required
common.validation.email
```

### Empty States

Format: `{feature}.{page}.empty.{context}` or `common.empty.{type}`

```
onSiteAssistant.promotions.list.empty.message
onSiteAssistant.missionRewardRecord.table.empty
common.empty.noData
```

### Status Labels

Format: `{feature}.{page}.status.{statusName}` or `common.status.{statusName}`

```
onSiteAssistant.promotions.card.status.active
onSiteAssistant.missionRewardRecord.status.pending
common.status.completed
```

## Context for AI Translation

When generating i18n keys, consider:

1. **File Location Context:**
   - `src/features/OnSiteAssistant/pages/Promotions.js` → `onSiteAssistant.promotions.*`
   - `src/features/OnSiteAssistant/pages/MissionRewardEdit.js` → `onSiteAssistant.missionRewardEdit.*`
   - `src/components/Camera/CameraScanQRCode.js` → `camera.scanner.*`
   - `src/components/Dialog/DialogInfo.js` → `dialog.info.*`

2. **Component Type:**
   - Button → `.button.*`
   - Form input → `.form.input.*` or `.input.*`
   - Form label → `.form.label.*`
   - Table header → `.table.header.*`
   - Dialog → `dialog.*`

3. **Action Context:**
   - Save action → `.button.save` or `.success.saved`
   - Delete action → `.button.delete` or `.confirm.delete.*`
   - Generate action → `.button.generate` or `.success.generated`

4. **Reuse Common Keys:**
   - Standard buttons → Use `common.button.*`
   - Standard messages → Use `common.success.*` or `common.error.*`
   - Standard validations → Use `common.validation.*`

## Examples by File Location

**File:** `src/features/OnSiteAssistant/pages/Promotions.js`
**Generated keys:**
```
onSiteAssistant.promotions.title
onSiteAssistant.promotions.list.empty.message
onSiteAssistant.promotions.card.button.view
```

**File:** `src/features/OnSiteAssistant/pages/PromoGenerator.js`
**Generated keys:**
```
onSiteAssistant.promoGenerator.title
onSiteAssistant.promoGenerator.input.label.quantity
onSiteAssistant.promoGenerator.button.generate
```

**File:** `src/components/Camera/CameraScanQRCode.js`
**Generated keys:**
```
camera.scanner.title
camera.scanner.instruction
camera.scanner.button.scan
```

**File:** `src/components/Dialog/DialogCameraPermissionDeny.js`
**Generated keys:**
```
camera.permission.deny.title
camera.permission.deny.message
camera.permission.deny.button.settings
```

**File:** `src/components/Common/LoadingWrapper.js`
**Generated keys:**
```
common.loading.message
common.loading.pleaseWait
```

## Project-Specific Rules

1. **OnSiteAssistant prefix:**
   - All OnSite Assistant features use `onSiteAssistant.*` prefix
   - Page names match file names: `MissionRewardEdit` → `missionRewardEdit`

2. **Camera components:**
   - All camera-related components use `camera.*` prefix
   - Scanner: `camera.scanner.*`
   - Permissions: `camera.permission.*`

3. **Common components:**
   - Truly common elements use `common.*`
   - Reuse common keys whenever possible
   - Don't create duplicate keys for same functionality

4. **Dialog components:**
   - All dialogs use `dialog.*` prefix
   - Dialog type determines the second level: `dialog.info.*`, `dialog.systemError.*`

5. **Page naming:**
   - Use camelCase for page names
   - Match the component file name pattern
   - `MissionRewardRecord` → `missionRewardRecord`

## Translation File Structure

fever-tool uses per-language files:

```
src/locale/
├── zh-TW.json  (Traditional Chinese)
└── en-US.json  (English)
```

Each file has flat key-value structure:
```json
{
  "onSiteAssistant.promotions.title": "促銷活動",
  "onSiteAssistant.promotions.list.empty.message": "目前沒有促銷活動",
  "common.button.save": "儲存"
}
```

## Summary

**Key Characteristics of fever-tool i18n:**
- Feature-first naming: `onSiteAssistant.*`
- Page-specific keys: `.missionReward.*`, `.promoGenerator.*`
- Component-specific keys: `camera.*`, `dialog.*`
- Heavy use of common keys: `common.*`
- Semantic and hierarchical structure
- Simple two-language support (zh-TW, en-US)

**When in doubt:**
- Check if common key exists first
- Use feature name as first level
- Use page/component name as second level
- Keep it simple and semantic

---

**Last Updated:** 2025-11-14
**Version:** 1.0.0
**Project:** fever-tool
**Languages:** zh-TW (primary), en-US (secondary)
