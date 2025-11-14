# i18n Key Naming Convention - Form Project

This document provides i18n key naming guidelines for the Form project.

## Project Context

The Form project is a comprehensive form builder with two distinct modes:

**Editor Mode** - For creating and editing forms:
- Drag-and-drop field builder
- Layout and style customization
- Multiple page support
- Field settings and validations
- Form publishing and sharing

**Client Mode** - For displaying and filling forms:
- Responsive form rendering
- Field validation
- Progress tracking
- Form submission

**Target Languages:**
- Traditional Chinese (zh-TW) - Primary
- English (en-US) - Secondary
- Additional languages as needed

**i18n File Structure:**
```
src/locale/
├── client/     # Client mode translations
│   ├── zh-TW.json
│   └── en-US.json
└── editor/     # Editor mode translations
    ├── zh-TW.json
    └── en-US.json
```

## Naming Structure

```
{mode}.{domain}.{component}.{element}.{property}
```

### Structure Components

- **mode**: `editor`, `client`, or `common` (for shared)
- **domain**: Feature domain (field, setting, panel, navbar, etc.)
- **component**: Specific component (singleLine, multiLine, dropdown, etc.)
- **element**: UI element (button, label, input, message, etc.)
- **property**: Property or state (placeholder, title, error, success, etc.)

## Editor Mode Keys

### Navbar (Navigation Bar)

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

### Field Panel (Field Selection)

```
editor.fieldPanel.title
editor.fieldPanel.search.placeholder
editor.fieldPanel.category.basic
editor.fieldPanel.category.advanced
editor.fieldPanel.category.layout
```

### Question Panel (Field Types)

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

### Field Settings

**General Settings:**
```
editor.fieldSetting.general.title
editor.fieldSetting.general.label.name
editor.fieldSetting.general.label.description
editor.fieldSetting.general.placeholder.name
editor.fieldSetting.general.placeholder.description
editor.fieldSetting.general.required.label
editor.fieldSetting.general.required.hint
```

**Validation Settings:**
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

**Field-Specific Settings:**

**Single Line:**
```
editor.fieldSetting.singleLine.placeholder.label
editor.fieldSetting.singleLine.placeholder.placeholder
editor.fieldSetting.singleLine.textAlign.label
editor.fieldSetting.singleLine.width.label
```

**Multi Line:**
```
editor.fieldSetting.multiLine.placeholder.label
editor.fieldSetting.multiLine.rows.label
editor.fieldSetting.multiLine.maxLength.label
```

**Dropdown:**
```
editor.fieldSetting.dropdown.options.title
editor.fieldSetting.dropdown.options.add
editor.fieldSetting.dropdown.options.placeholder
editor.fieldSetting.dropdown.multiChoice.label
editor.fieldSetting.dropdown.optionsLimited.label
editor.fieldSetting.dropdown.optionsLimited.hint
```

**File Upload:**
```
editor.fieldSetting.fileUpload.fileType.label
editor.fieldSetting.fileUpload.maxSize.label
editor.fieldSetting.fileUpload.maxFiles.label
editor.fieldSetting.fileUpload.cropType.label
editor.fieldSetting.fileUpload.cropType.square
editor.fieldSetting.fileUpload.cropType.free
```

**Date Picker:**
```
editor.fieldSetting.datePicker.format.label
editor.fieldSetting.datePicker.minDate.label
editor.fieldSetting.datePicker.maxDate.label
editor.fieldSetting.datePicker.defaultToday.label
```

**Rating:**
```
editor.fieldSetting.rating.number.label
editor.fieldSetting.rating.type.label
editor.fieldSetting.rating.type.star
editor.fieldSetting.rating.type.heart
editor.fieldSetting.rating.type.custom
editor.fieldSetting.rating.customIcon.label
editor.fieldSetting.rating.customIcon.upload
```

**Image/Text Choice:**
```
editor.fieldSetting.choice.options.title
editor.fieldSetting.choice.option.add
editor.fieldSetting.choice.option.addImage
editor.fieldSetting.choice.rowItemNumber.label
editor.fieldSetting.choice.multiChoice.label
```

**Double Dropdown:**
```
editor.fieldSetting.doubleDropdown.firstLevel.label
editor.fieldSetting.doubleDropdown.secondLevel.label
editor.fieldSetting.doubleDropdown.required.first
editor.fieldSetting.doubleDropdown.required.second
editor.fieldSetting.doubleDropdown.placeholder.first
editor.fieldSetting.doubleDropdown.placeholder.second
```

### Setting Panel (Form Settings)

**General Settings:**
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

**Layout Settings:**
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

**Style Settings:**
```
editor.settingPanel.style.title
editor.settingPanel.style.primaryColor.label
editor.settingPanel.style.secondaryColor.label
editor.settingPanel.style.textColor.label
editor.settingPanel.style.buttonColor.label
editor.settingPanel.style.buttonTextColor.label
```

**Email Notification:**
```
editor.settingPanel.emailNotify.title
editor.settingPanel.emailNotify.enable.label
editor.settingPanel.emailNotify.recipients.label
editor.settingPanel.emailNotify.recipients.placeholder
editor.settingPanel.emailNotify.recipients.hint
editor.settingPanel.emailNotify.subject.label
editor.settingPanel.emailNotify.subject.placeholder
```

### Page Menu (Multi-page Forms)

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

### Global Section Panel

```
editor.globalSection.title
editor.globalSection.description
editor.globalSection.convert.button
editor.globalSection.convert.confirm.title
editor.globalSection.convert.confirm.message
editor.globalSection.field.select
editor.globalSection.field.selected
```

### Hidden Field Panel

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

### Tag Setting Panel

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

### Upload Components

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

### Dialogs

**Batch Upload Dialog:**
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

**Alert No Save Dialog:**
```
editor.dialog.alertNoSave.title
editor.dialog.alertNoSave.message
editor.dialog.alertNoSave.button.save
editor.dialog.alertNoSave.button.discard
editor.dialog.alertNoSave.button.cancel
```

**Webhook Form Setting Dialog:**
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

**Sponsor Not Available Dialog:**
```
editor.dialog.sponsorNotAvailable.title
editor.dialog.sponsorNotAvailable.message
editor.dialog.sponsorNotAvailable.button.upgrade
editor.dialog.sponsorNotAvailable.button.close
```

### Form Content (Editor View)

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

### Notifications

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

## Client Mode Keys

### Form Display

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

### Fields

**Single Line:**
```
client.field.singleLine.placeholder
client.field.singleLine.error.required
client.field.singleLine.error.invalid
```

**Multi Line:**
```
client.field.multiLine.placeholder
client.field.multiLine.remainingChars
client.field.multiLine.error.required
client.field.multiLine.error.maxLength
```

**Dropdown:**
```
client.field.dropdown.placeholder
client.field.dropdown.select
client.field.dropdown.noOptions
client.field.dropdown.error.required
client.field.dropdown.error.maxSelections
```

**File Upload:**
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

**Date Picker:**
```
client.field.datePicker.placeholder
client.field.datePicker.selectDate
client.field.datePicker.error.required
client.field.datePicker.error.invalidDate
client.field.datePicker.error.minDate
client.field.datePicker.error.maxDate
```

**Rating:**
```
client.field.rating.label
client.field.rating.error.required
```

**Image Choice:**
```
client.field.imageChoice.select
client.field.imageChoice.error.required
client.field.imageChoice.error.maxSelections
```

**Text Choice:**
```
client.field.textChoice.select
client.field.textChoice.error.required
client.field.textChoice.error.maxSelections
```

**Term:**
```
client.field.term.agree
client.field.term.error.required
```

**Double Dropdown:**
```
client.field.doubleDropdown.first.placeholder
client.field.doubleDropdown.second.placeholder
client.field.doubleDropdown.first.error.required
client.field.doubleDropdown.second.error.required
```

### Validation Messages

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

### Form Submission

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

### Dialog

```
client.dialog.error.title
client.dialog.error.message
client.dialog.error.button.close
client.dialog.error.button.retry
```

## Common Keys (Shared between Editor & Client)

### Buttons

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

### Messages

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

### Loading

```
common.loading.message
common.loading.pleaseWait
common.loading.processing
common.loading.uploading
common.loading.downloading
```

### Empty States

```
common.empty.noData
common.empty.noResults
common.empty.noFields
common.empty.noPages
common.empty.message
```

### Date & Time

```
common.date.today
common.date.yesterday
common.date.tomorrow
common.date.format
common.time.format
```

### Status

```
common.status.active
common.status.inactive
common.status.draft
common.status.published
common.status.archived
```

### Colors (for color picker)

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

## Naming Guidelines

### DO ✅

1. **Separate by mode:**
   ```
   ✅ editor.navbar.button.save
   ✅ client.form.page.submit
   ❌ navbar.button.save (missing mode)
   ```

2. **Use hierarchical structure:**
   ```
   ✅ editor.fieldSetting.singleLine.placeholder.label
   ❌ editorFieldSettingSingleLinePlaceholder
   ```

3. **Be specific about field types:**
   ```
   ✅ client.field.fileUpload.error.fileSize
   ❌ client.field.error.size
   ```

4. **Group related settings:**
   ```
   ✅ editor.fieldSetting.validation.required
   ✅ editor.fieldSetting.validation.email
   ✅ editor.fieldSetting.validation.minLength
   ```

5. **Reuse common keys:**
   ```
   ✅ common.button.save (used in both modes)
   ❌ editor.button.save + client.button.save (duplicate)
   ```

### DON'T ❌

1. **Don't mix modes:**
   ```
   ❌ editor.client.field.name
   ✅ editor.field.name or client.field.name
   ```

2. **Don't create overly deep nesting:**
   ```
   ❌ editor.panel.setting.section.field.input.label.placeholder
   ✅ editor.fieldSetting.singleLine.placeholder
   ```

3. **Don't use abbreviations excessively:**
   ```
   ❌ ed.fld.sl.ph
   ✅ editor.field.singleLine.placeholder
   ```

4. **Don't duplicate common functionality:**
   ```
   ❌ editor.button.delete + client.button.delete
   ✅ common.button.delete (use in both)
   ```

## Special Patterns

### Error Messages

**Editor Mode:**
Format: `editor.{domain}.{component}.error.{errorType}`
```
editor.navbar.save.error
editor.upload.error.fileSize
editor.fieldSetting.validation.error.pattern
```

**Client Mode:**
Format: `client.field.{fieldType}.error.{errorType}` or `client.validation.{rule}`
```
client.field.fileUpload.error.fileSize
client.field.datePicker.error.invalidDate
client.validation.required
client.validation.email.invalid
```

### Success Messages

**Editor Mode:**
Format: `editor.{domain}.{action}.success`
```
editor.navbar.save.success
editor.upload.success.uploaded
editor.notification.field.added
```

**Client Mode:**
Format: `client.{domain}.success.{context}`
```
client.submit.success.title
client.submit.success.message
```

### Placeholders

Format: `{mode}.{domain}.{component}.placeholder`
```
editor.fieldSetting.general.placeholder.name
editor.settingPanel.general.name.placeholder
client.field.singleLine.placeholder
client.field.dropdown.placeholder
```

### Labels

Format: `{mode}.{domain}.{component}.label` or `{mode}.{domain}.{component}.{property}.label`
```
editor.fieldSetting.general.label.name
editor.fieldSetting.validation.required
editor.settingPanel.layout.backgroundColor.label
```

## Context for AI Translation

When generating i18n keys, consider:

1. **Mode Context:**
   - Editor files (`src/editor/`) → Use `editor.*`
   - Client files (`src/client/`) → Use `client.*`
   - Common files (`src/common/`) → Use `common.*`

2. **Domain Context:**
   - Navbar components → `.navbar.*`
   - Field settings → `.fieldSetting.*`
   - Form settings → `.settingPanel.*`
   - Field components → `.field.*`
   - Validation → `.validation.*`

3. **Component Type:**
   - Field types → Specific field name (singleLine, multiLine, dropdown, etc.)
   - Buttons → `button.{action}`
   - Dialogs → `dialog.{dialogType}.*`

4. **Reuse Strategy:**
   - Standard buttons → Use `common.button.*`
   - Standard messages → Use `common.success.*` or `common.error.*`
   - Mode-specific functionality → Use `editor.*` or `client.*`

## Examples by File Location

**File:** `src/editor/components/Navbar/Navbar.js`
**Generated keys:**
```
editor.navbar.title
editor.navbar.button.save
editor.navbar.button.publish
```

**File:** `src/editor/components/SettingPanel/LayoutSetting/FormStyleSetting.js`
**Generated keys:**
```
editor.settingPanel.layout.title
editor.settingPanel.layout.backgroundColor.label
editor.settingPanel.layout.backgroundImage.label
```

**File:** `src/client/components/FormContent/Field/FieldSingleLine.js`
**Generated keys:**
```
client.field.singleLine.placeholder
client.field.singleLine.error.required
```

**File:** `src/common/components/Mui/Button.js`
**Generated keys:**
```
common.button.save
common.button.cancel
common.button.delete
```

## Project-Specific Rules

1. **Mode-First Naming:**
   - Always start with mode: `editor.*`, `client.*`, or `common.*`
   - Never mix modes in a single key

2. **Field Type Specificity:**
   - Each field type has its own key space
   - Example: `editor.fieldSetting.singleLine.*`, `editor.fieldSetting.dropdown.*`

3. **Common Key Strategy:**
   - Use `common.*` for truly shared functionality
   - Buttons, standard messages, and generic dialogs
   - Don't overuse - be specific when needed

4. **Validation Messages:**
   - General validation → `common.validation.*`
   - Field-specific validation → `client.field.{type}.error.*`

5. **Setting Panel Structure:**
   - Follow the panel hierarchy
   - `editor.settingPanel.{category}.{property}.label`

## Migration Notes

If migrating from existing i18n structure:
- Check both `editor/` and `client/` directories
- Preserve mode separation
- Consolidate common keys
- Update component imports to use new key structure

---

**Last Updated:** 2025-11-14
**Version:** 1.0.0
**Project:** Form
**Languages:** zh-TW (primary), en-US (secondary), plus additional languages
**Modes:** Editor (form builder), Client (form viewer/filler)
