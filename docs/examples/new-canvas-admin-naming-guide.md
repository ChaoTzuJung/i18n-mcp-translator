# i18n Key Naming Convention - new-canvas-admin

This document provides i18n key naming guidelines for the new-canvas-admin project.

## Project Context

new-canvas-admin is a comprehensive admin panel with multiple feature modules including:
- Achievement system
- Campaign management (Chat, Onsite)
- Point system
- Promo management
- Form builder
- Webhook management
- And more...

## Naming Structure

```
{feature}.{page}.{component}.{element}.{action}
```

### Structure Components

- **feature**: Top-level feature module (achievement, campaign, point, etc.)
- **page**: Specific page within feature (dashboard, create, setting, etc.)
- **component**: Component name if applicable
- **element**: UI element type (button, title, label, input, etc.)
- **action**: Action or state (save, cancel, edit, loading, error, etc.)

## Feature-Based Examples

### Achievement Module

**Dashboard:**
```
achievement.dashboard.title
achievement.dashboard.subtitle
achievement.dashboard.button.create
achievement.dashboard.table.header.name
achievement.dashboard.table.header.status
achievement.dashboard.empty.message
```

**Create Page:**
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

**Level Settings:**
```
achievement.level.title
achievement.level.visual.upload.hint
achievement.level.visual.upload.error
achievement.level.description.placeholder
achievement.level.points.label
achievement.level.points.validation.required
```

**Status:**
```
achievement.status.draft
achievement.status.published
achievement.status.archived
```

### Campaign Module

**Onsite Campaign:**
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

**Chat Campaign:**
```
campaign.chat.dashboard.title
campaign.chat.editor.message.label
campaign.chat.editor.keyword.placeholder
campaign.chat.analytics.overview
campaign.chat.members.table.header.name
```

**Common Campaign:**
```
campaign.list.table.header.name
campaign.list.table.header.type
campaign.list.table.header.status
campaign.list.button.create
campaign.create.dialog.title
campaign.create.type.select.label
```

### Point System

**Mechanism:**
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

**Statistics:**
```
point.statistical.title
point.statistical.chart.label
point.statistical.date.select
point.statistical.export.button
point.statistical.info.totalPoints
point.statistical.info.activeUsers
```

**Settings:**
```
point.setting.info.label.name
point.setting.info.label.unit
point.setting.ratio.label
point.setting.style.background.label
point.setting.style.button.label
```

### Promo Module

**List:**
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

**Create/Edit:**
```
promo.create.title
promo.create.section.info.title
promo.create.section.reward.title
promo.create.section.qualification.title
promo.create.section.game.title
promo.create.button.save
promo.create.button.preview
```

**Game Types:**
```
promo.game.comment.title
promo.game.contest.title
promo.game.multiChallenge.title
promo.game.photoUpload.title
promo.game.vote.title
```

**Prize Management:**
```
promo.prize.draw.title
promo.prize.draw.button.random
promo.prize.participate.title
promo.prize.participate.table.header.name
promo.prize.redemption.title
```

**Analytics:**
```
promo.analytics.overview.title
promo.analytics.chart.views
promo.analytics.chart.participants
promo.analytics.export.button
```

### Form Module

**Editor:**
```
form.editor.title
form.editor.field.add
form.editor.field.delete
form.editor.field.duplicate
form.editor.section.add
form.editor.preview.button
form.editor.publish.button
```

**Field Types:**
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

### Webhook Module

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

### Allocation Point Module

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

### Login Module

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

### Sponsor Settings

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

## Common Components

These keys are used across multiple features and should be consistent:

### Buttons
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

### Dialogs
```
common.dialog.confirm.title
common.dialog.confirm.message
common.dialog.delete.title
common.dialog.delete.message
common.dialog.unsaved.title
common.dialog.unsaved.message
```

### Tables
```
common.table.noData
common.table.loading
common.table.error
common.table.header.actions
common.table.rowsPerPage
common.table.pagination
```

### Forms
```
common.form.required
common.form.invalid
common.form.success
common.form.error
```

### Validation
```
common.validation.required
common.validation.email
common.validation.phone
common.validation.url
common.validation.minLength
common.validation.maxLength
common.validation.pattern
```

### Messages
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

### Upload
```
common.upload.hint
common.upload.dragHere
common.upload.button
common.upload.error.size
common.upload.error.type
common.upload.success
```

### Status Labels
```
common.status.active
common.status.inactive
common.status.draft
common.status.published
common.status.archived
common.status.pending
```

## Special Patterns

### Error Messages

Format: `{feature}.{page}.error.{errorType}`

```
achievement.create.error.nameTooLong
achievement.create.error.invalidPoints
campaign.onsite.error.noMessage
promo.create.error.invalidDateRange
```

### Success Messages

Format: `{feature}.{page}.success.{action}`

```
achievement.create.success.created
achievement.update.success.updated
campaign.publish.success.published
promo.delete.success.deleted
```

### Loading States

Format: `{feature}.{page}.loading.{action}`

```
achievement.dashboard.loading.data
campaign.analytics.loading.chart
promo.list.loading.promos
```

### Empty States

Format: `{feature}.{page}.empty.{context}`

```
achievement.dashboard.empty.noAchievements
campaign.list.empty.noCampaigns
promo.list.empty.noPromos
form.editor.empty.noFields
```

## Naming Guidelines

### DO ✅

1. **Use descriptive names:**
   ```
   ✅ campaign.onsite.editor.message.placeholder
   ❌ campaign.msg.ph
   ```

2. **Follow the hierarchy:**
   ```
   ✅ point.mechanism.behavior.add
   ❌ pointMechanismBehaviorAdd
   ```

3. **Be consistent with naming:**
   ```
   ✅ button.save, button.cancel (all lowercase)
   ❌ button.Save, button.cancel (mixed case)
   ```

4. **Use semantic names:**
   ```
   ✅ achievement.create.error.nameTooLong
   ❌ achievement.create.error1
   ```

### DON'T ❌

1. **Don't use abbreviations excessively:**
   ```
   ❌ achv.crt.btn.sv
   ✅ achievement.create.button.save
   ```

2. **Don't include language-specific terms:**
   ```
   ❌ achievement.create.button.儲存
   ✅ achievement.create.button.save
   ```

3. **Don't use ambiguous names:**
   ```
   ❌ campaign.thing.stuff
   ✅ campaign.onsite.message.content
   ```

4. **Don't create deep nesting unnecessarily:**
   ```
   ❌ achievement.dashboard.page.section.subsection.component.element.button
   ✅ achievement.dashboard.button.create
   ```

## Context for AI Translation

When generating i18n keys, consider:

1. **File Location**: Extract feature/module from file path
   - `src/features/achievement/` → `achievement.*`
   - `src/features/campaign/onsite/` → `campaign.onsite.*`

2. **Component Name**: Use component name as context
   - `AchievementDashboard.tsx` → `achievement.dashboard.*`
   - `CampaignEditor.tsx` → `campaign.*.editor.*`

3. **UI Context**: Identify element type
   - Button → `.button.*`
   - Input field → `.input.*` or `.form.*`
   - Table header → `.table.header.*`

4. **Action Context**: Include action if applicable
   - Save button → `.button.save`
   - Delete confirm → `.delete.confirm`

## Examples by File Location

**File:** `src/features/achievement/pages/AchievementDashboard.js`
**Generated keys:**
```
achievement.dashboard.title
achievement.dashboard.button.create
achievement.dashboard.table.header.name
```

**File:** `src/features/campaign/CampaignOnsite/Editor/OnsiteEditor.js`
**Generated keys:**
```
campaign.onsite.editor.title
campaign.onsite.editor.message.placeholder
campaign.onsite.editor.button.save
```

**File:** `src/features/point/pages/Statistical.js`
**Generated keys:**
```
point.statistical.title
point.statistical.chart.label
point.statistical.export.button
```

---

**Last Updated:** 2025-11-14
**Version:** 1.0.0
**Project:** new-canvas-admin
