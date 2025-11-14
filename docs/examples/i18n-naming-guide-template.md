# i18n Key Naming Convention - [YOUR PROJECT NAME]

This document provides i18n key naming guidelines for [YOUR PROJECT NAME].

## Project Context

[Briefly describe your project and its main features/modules]

Example:
- Module 1: User management
- Module 2: Content editor
- Module 3: Analytics dashboard
- etc.

## Naming Structure

Choose a structure that fits your project:

### Option 1: Feature-Based (Recommended for large projects)
```
{feature}.{page}.{component}.{element}.{action}
```

### Option 2: Page-Based (For medium projects)
```
{page}.{section}.{element}.{action}
```

### Option 3: Component-Based (For component libraries)
```
{component}.{variant}.{element}.{state}
```

## Structure Components

Define what each part of your naming structure means:

- **feature**: [Your definition]
- **page**: [Your definition]
- **component**: [Your definition]
- **element**: [Your definition]
- **action**: [Your definition]

## Feature/Module Examples

### [Feature/Module 1 Name]

**[Page/Section 1]:**
```
[feature].[page].title
[feature].[page].subtitle
[feature].[page].button.[action]
[feature].[page].table.header.[column]
```

**[Page/Section 2]:**
```
[feature].[page].form.label.[field]
[feature].[page].form.placeholder.[field]
[feature].[page].error.[errorType]
[feature].[page].success.[action]
```

### [Feature/Module 2 Name]

```
[feature].[page].[element].[action]
```

## Common Components

Define common keys used across your entire application:

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
```

### Dialogs
```
common.dialog.confirm.title
common.dialog.confirm.message
common.dialog.delete.title
common.dialog.delete.message
```

### Tables
```
common.table.noData
common.table.loading
common.table.error
common.table.header.actions
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
```

### Status Labels
```
common.status.active
common.status.inactive
common.status.draft
common.status.published
```

## Special Patterns

### Error Messages

Format: `{feature}.{page}.error.{errorType}`

Examples:
```
[feature].[page].error.[specificError]
```

### Success Messages

Format: `{feature}.{page}.success.{action}`

Examples:
```
[feature].[page].success.[action]
```

### Loading States

Format: `{feature}.{page}.loading.{action}`

Examples:
```
[feature].[page].loading.[resource]
```

### Empty States

Format: `{feature}.{page}.empty.{context}`

Examples:
```
[feature].[page].empty.[resource]
```

## Naming Guidelines

### DO ✅

1. **Use descriptive names:**
   ```
   ✅ user.profile.form.email.label
   ❌ user.em
   ```

2. **Follow the hierarchy:**
   ```
   ✅ dashboard.analytics.chart.title
   ❌ dashboardAnalyticsChartTitle
   ```

3. **Be consistent with casing:**
   ```
   ✅ button.save, button.cancel (all lowercase)
   ❌ button.Save, button.cancel (mixed case)
   ```

4. **Use semantic names:**
   ```
   ✅ form.validation.email.invalid
   ❌ form.error1
   ```

5. **Keep it concise but clear:**
   ```
   ✅ table.header.name
   ❌ table.header.userFirstAndLastNameColumn
   ```

### DON'T ❌

1. **Don't use excessive abbreviations:**
   ```
   ❌ usr.prof.btn.sv
   ✅ user.profile.button.save
   ```

2. **Don't include language-specific terms:**
   ```
   ❌ user.profile.button.儲存
   ✅ user.profile.button.save
   ```

3. **Don't use ambiguous names:**
   ```
   ❌ page.thing.stuff
   ✅ dashboard.widget.title
   ```

4. **Don't create unnecessarily deep nesting:**
   ```
   ❌ app.page.section.subsection.component.element.button.primary.large
   ✅ app.page.button.submit
   ```

5. **Don't use numbers as identifiers:**
   ```
   ❌ error.1, error.2
   ✅ error.network, error.validation
   ```

## Context for AI Translation

When generating i18n keys, consider:

1. **File Location**: Extract module/feature from file path
   - `src/features/[feature]/` → `[feature].*`
   - `src/pages/[page]/` → `[page].*`

2. **Component Name**: Use component name as context
   - `UserDashboard.tsx` → `user.dashboard.*`
   - `ProfileEditor.tsx` → `profile.editor.*`

3. **UI Context**: Identify element type
   - Button → `.button.*`
   - Input field → `.input.*` or `.form.*`
   - Table header → `.table.header.*`

4. **Action Context**: Include action if applicable
   - Save button → `.button.save`
   - Delete confirm → `.delete.confirm`

## Examples by File Location

**File:** `src/features/[feature]/pages/[Page].tsx`
**Generated keys:**
```
[feature].[page].title
[feature].[page].button.[action]
[feature].[page].table.header.[column]
```

**File:** `src/components/[Component].tsx`
**Generated keys:**
```
[component].title
[component].button.[action]
[component].label.[field]
```

## Project-Specific Rules

[Add any project-specific naming rules or conventions here]

Example:
- Always use plural for list pages: `users.list.*` not `user.list.*`
- Use `form` for edit pages: `user.form.*` not `user.edit.*`
- Status keys should be under common: `common.status.*`

## Migration Notes

[If migrating from an old system, add notes here]

Example:
- Old format: `USER_PROFILE_SAVE` → New format: `user.profile.button.save`
- See migration guide: [link to migration doc]

---

**Instructions for Using This Template:**

1. **Copy this file** to your project's docs folder
2. **Replace all [placeholders]** with your project-specific information
3. **Add examples** from your actual codebase
4. **Update regularly** as your project evolves
5. **Share with your team** and AI tools

**Last Updated:** [Date]
**Version:** [Version]
**Project:** [Project Name]
**Maintainer:** [Your Name/Team]
