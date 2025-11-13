# i18n Key Naming Strategy - Enhanced AI Key Generation

## Executive Summary

This document proposes an enhanced i18n key naming strategy for the MCP Translator to generate context-aware, hierarchical keys based on file structure and code context, rather than simple element-type-based naming.

**Current Problem:**
- AI generates keys like `label.xxx_aaa_sss_ddd` based only on element type
- No consideration of file path, component hierarchy, or namespace
- Results in flat, non-semantic key names that don't reflect project architecture

**Proposed Solution:**
- Context-aware key generation using file path analysis
- Hierarchical structure: `{namespace}.{module}.{component}.{element}.{state}`
- Maximum depth of 4-5 levels for optimal balance
- Namespace-first approach aligning with project architecture

---

## Research Findings: Industry Best Practices

### 1. Namespace by Feature/Domain ⭐ (Most Important)
**Source:** Locize, DEV Community, React i18next docs

The most robust strategy is to **namespace by feature or domain** (e.g., `checkout`, `adminDashboard`, `userProfile`). This approach:
- Aligns i18n structure with application architecture
- Resilient to UI refactoring
- Enables code-splitting and lazy loading
- Improves team collaboration (developers work on feature-specific files)

**Example:**
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

### 2. Hierarchical Nesting (2-3 Levels Optimal)
**Source:** Tolgee, Lokalise, Phrase

**Optimal depth:** 2-3 levels provides the best balance of organization and simplicity.

**Good Examples:**
```
✅ checkout.paymentForm.submitButton
✅ user.profile.editButton
✅ errors.validation.emailInvalid
```

**Avoid Over-nesting:**
```
❌ app.pages.checkout.forms.payment.fields.card.number.label (too deep)
```

### 3. Use Descriptive and Semantic Names
**Source:** POEditor, Transifex, Stack Overflow

Keys should clearly describe **content or purpose**, not just location or element type.

**Good:**
```
✅ user.login.welcomeMessage
✅ product.addToCart.button
✅ error.networkTimeout
```

**Bad:**
```
❌ label_1, text123, key_abc
❌ button.click.here
```

### 4. Consistent Naming Convention
**Source:** Phrase, Lokalise

Choose one convention and stick to it:
- **camelCase:** `userLoginForm`
- **snake_case:** `user_login_form`
- **dot.notation:** `user.login.form`

**Recommendation:** Use **dot.notation** for hierarchy + **camelCase** within segments.

Example: `user.loginForm.submitButton`

### 5. Common Translations File
**Source:** React i18next, ButterCMS

Maintain a `common.json` namespace for frequently reused strings:
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

### 6. Include Context When Needed
**Source:** Tolgee, DEV Community

If a term has multiple meanings, include context:
```
✅ address.user (user's address)
✅ address.shipping (shipping address)
✅ date.created (creation date)
✅ date.modified (modification date)
```

### 7. Plan for Pluralization and Gender
**Source:** i18next documentation

Use ICU message format or specific keys for pluralization:
```json
{
  "item": {
    "count_one": "{{count}} item",
    "count_other": "{{count}} items"
  }
}
```

---

## Fever Admin Project Analysis

### Project Architecture Overview

**Three Main Flows:**
1. **Editor Flow** - Admin backend (activity editor)
2. **Client Flow** - User frontend (activity participation)
3. **UGC Flow** - UGC content display and voting

**Current i18n Structure:**
```
src/locale/
├── i18n.js
├── client/          # Frontend namespace
│   ├── zh-TW.json
│   ├── en-US.json
│   └── ... (7 languages)
└── editor/          # Backend namespace
    ├── zh-TW.json
    ├── en-US.json
    └── ... (7 languages)
```

### Key Characteristics

1. **Clear Namespace Separation:** Editor vs Client
2. **25+ Game Types:** Each needs distinct i18n keys
3. **Modular Architecture:** Clear flow > module > component hierarchy
4. **Shared Components:** Components used across both editor and client

### Example File Paths

```
src/client/game_aiWebGame/...                    # Client flow
src/editor/game_aiWebGame/...                    # Editor flow
src/components/AIWebGame/...                     # Shared components
src/editor/components/SideBar/Prize/...          # Editor-specific
src/client/components/Result/Actions/...         # Client-specific
```

---

## Proposed i18n Key Naming Strategy for Fever Admin

### Format Structure

```
{namespace}.{module}.{component}.{element}.{variant}
```

**Maximum Depth:** 4-5 levels

### Naming Rules by Hierarchy Level

#### Level 1: Namespace (Required)
- `editor` - Editor flow (admin backend)
- `client` - Client flow (user frontend)
- `ugc` - UGC flow
- `common` - Shared across all flows

#### Level 2: Module (Required)
Based on functional area or game type:
- **Game Types:** `aiWebGame`, `quiz`, `vote`, `checkIn`, `lottery`, etc.
- **Feature Areas:** `prize`, `qualify`, `result`, `task`, `mgm`, etc.
- **Shared Modules:** `auth`, `navigation`, `dialog`, etc.

#### Level 3: Component/Context (Required)
- Component name in camelCase: `gameConfig`, `settingPanel`, `prizeList`
- Or functional context: `validation`, `error`, `success`

#### Level 4: Element/Purpose (Required)
- Descriptive element identifier: `title`, `description`, `submitButton`
- Or specific purpose: `placeholder`, `tooltip`, `errorMessage`

#### Level 5: Variant/State (Optional)
- State variations: `loading`, `success`, `error`
- UI variants: `primary`, `secondary`, `disabled`
- Plurality: `singular`, `plural`

### Examples Based on Fever Admin Structure

#### Editor Flow Examples

**File:** `src/editor/game_aiWebGame/SettingPanel/Panels/GameConfigPanel.jsx`

```javascript
// Title
t('editor.aiWebGame.gameConfig.title')
// "AI 網頁遊戲配置"

// Description field
t('editor.aiWebGame.gameConfig.description.label')
t('editor.aiWebGame.gameConfig.description.placeholder')

// Sandbox mode checkbox
t('editor.aiWebGame.settingPanel.sandbox.label')
t('editor.aiWebGame.settingPanel.sandbox.tooltip')

// Full screen toggle
t('editor.aiWebGame.display.fullscreen.label')
t('editor.aiWebGame.display.fullscreen.description')
```

**File:** `src/editor/components/SideBar/Prize/Dialog/PrizeInfoDialog.jsx`

```javascript
// Dialog title
t('editor.prize.infoDialog.title')

// Prize name field
t('editor.prize.infoDialog.prizeName.label')
t('editor.prize.infoDialog.prizeName.placeholder')

// Prize image upload
t('editor.prize.infoDialog.image.uploadButton')
t('editor.prize.infoDialog.image.requirement')

// Actions
t('editor.prize.infoDialog.saveButton')
t('editor.prize.infoDialog.cancelButton')
```

**File:** `src/editor/components/SideBar/Qualify/limitQualify/index.jsx`

```javascript
// Section title
t('editor.qualify.limitQualify.title')

// Member level restriction
t('editor.qualify.limitQualify.memberLevel.label')
t('editor.qualify.limitQualify.memberLevel.placeholder')

// Tag qualification
t('editor.qualify.limitQualify.tags.label')
t('editor.qualify.limitQualify.tags.addButton')
t('editor.qualify.limitQualify.tags.emptyState')
```

#### Client Flow Examples

**File:** `src/client/game_aiWebGame/GameContainer.jsx`

```javascript
// Loading state
t('client.aiWebGame.loading')
t('client.aiWebGame.loading.message')

// Error states
t('client.aiWebGame.error.loadFailed')
t('client.aiWebGame.error.networkTimeout')
t('client.aiWebGame.error.notFound')

// Fullscreen controls
t('client.aiWebGame.fullscreen.enterButton')
t('client.aiWebGame.fullscreen.exitButton')
```

**File:** `src/client/components/Result/Actions/ShareButton.jsx`

```javascript
// Share button
t('client.result.actions.shareButton')
t('client.result.actions.shareButton.tooltip')

// Share success
t('client.result.actions.share.success')
t('client.result.actions.share.error')
```

**File:** `src/client/game_checkIn/CheckInCard.jsx`

```javascript
// Card title
t('client.checkIn.card.title')

// Check-in button states
t('client.checkIn.card.button.checkIn')
t('client.checkIn.card.button.checkedIn')
t('client.checkIn.card.button.disabled')

// Status messages
t('client.checkIn.card.status.success')
t('client.checkIn.card.status.alreadyCheckedIn')
t('client.checkIn.card.status.notQualified')
```

**File:** `src/client/fever_form/FeverForm/DatePicker/index.jsx`

```javascript
// Date picker labels
t('client.form.datePicker.label')
t('client.form.datePicker.placeholder')

// Validation
t('client.form.datePicker.validation.required')
t('client.form.datePicker.validation.invalid')
t('client.form.datePicker.validation.pastDate')
```

#### Common (Shared) Examples

**File:** Reusable across all flows

```javascript
// Buttons
t('common.button.save')
t('common.button.cancel')
t('common.button.delete')
t('common.button.confirm')
t('common.button.close')
t('common.button.edit')
t('common.button.submit')

// Dialog
t('common.dialog.confirm.title')
t('common.dialog.confirm.message')
t('common.dialog.delete.title')
t('common.dialog.delete.message')
t('common.dialog.unsavedChanges.title')
t('common.dialog.unsavedChanges.message')

// Form validation
t('common.validation.required')
t('common.validation.emailInvalid')
t('common.validation.phoneInvalid')
t('common.validation.urlInvalid')
t('common.validation.minLength')
t('common.validation.maxLength')

// Status messages
t('common.message.saveSuccess')
t('common.message.saveFailed')
t('common.message.deleteSuccess')
t('common.message.deleteFailed')
t('common.message.networkError')

// Date/Time
t('common.date.today')
t('common.date.yesterday')
t('common.date.tomorrow')
```

#### UGC Flow Examples

**File:** `src/ugc/components/ugcGallery/waterfall/index.jsx`

```javascript
// Gallery title
t('ugc.gallery.waterfall.title')

// Filter options
t('ugc.gallery.filter.latest')
t('ugc.gallery.filter.popular')
t('ugc.gallery.filter.myWorks')

// Actions
t('ugc.gallery.uploadButton')
t('ugc.gallery.voteButton')
```

---

## Key Generation Algorithm for AI Service

### Input Data Required

1. **File Path:** Absolute path to the source file
2. **Code Context:** Surrounding JSX/TSX code
3. **Text Content:** The hardcoded text to translate
4. **Project Root:** Base directory for relative path calculation

### Path Analysis Algorithm

```typescript
interface PathContext {
  namespace: 'editor' | 'client' | 'ugc' | 'common' | 'shared';
  module: string;        // e.g., 'aiWebGame', 'prize', 'checkIn'
  component: string;     // e.g., 'gameConfig', 'settingPanel'
  subpath: string[];     // Additional path segments
}

function analyzeFilePath(filePath: string, projectRoot: string): PathContext {
  const relativePath = path.relative(projectRoot, filePath);
  const segments = relativePath.split(path.sep);

  // Determine namespace
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

  // Extract module from game_xxx or feature directories
  let module = '';
  let componentStartIdx = startIdx;

  for (let i = startIdx; i < segments.length; i++) {
    const segment = segments[i];

    // Check for game types
    if (segment.startsWith('game_')) {
      module = segment.replace('game_', '');
      componentStartIdx = i + 1;
      break;
    }

    // Check for known feature modules
    const knownModules = [
      'prize', 'qualify', 'task', 'mgm', 'achievement',
      'point', 'rewards', 'collected', 'login', 'fever_form'
    ];
    if (knownModules.includes(segment)) {
      module = segment;
      componentStartIdx = i + 1;
      break;
    }

    // Check for component directories
    if (segment === 'components') {
      componentStartIdx = i + 1;
      break;
    }
  }

  // Extract component and subpath
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

### Element Type Detection

```typescript
interface ElementContext {
  type: 'button' | 'title' | 'label' | 'placeholder' | 'tooltip' | 'error' | 'message';
  parent: string;        // Parent element type (e.g., 'Dialog', 'Form')
  attributes: Record<string, string>;  // Element attributes
}

function detectElementContext(codeContext: string): ElementContext {
  // Analyze JSX structure
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

### Key Construction

```typescript
function constructI18nKey(
  pathContext: PathContext,
  elementContext: ElementContext,
  semanticName: string  // AI-generated semantic name from text
): string {
  const parts: string[] = [];

  // 1. Namespace (required)
  parts.push(pathContext.namespace);

  // 2. Module (if present)
  if (pathContext.module) {
    parts.push(pathContext.module);
  }

  // 3. Component (if present)
  if (pathContext.component) {
    parts.push(pathContext.component);
  }

  // 4. Subpath (if present and meaningful)
  if (pathContext.subpath.length > 0 && pathContext.subpath.length <= 2) {
    parts.push(...pathContext.subpath);
  }

  // 5. Semantic name + element type
  // If element type is generic (label), just use semantic name
  // Otherwise append element type (button, title, etc.)
  if (elementContext.type === 'label' || elementContext.type === 'message') {
    parts.push(semanticName);
  } else {
    parts.push(`${semanticName}.${elementContext.type}`);
  }

  // Ensure maximum depth of 5 levels
  if (parts.length > 5) {
    // Keep namespace, module, and last 3 parts
    parts.splice(2, parts.length - 5);
  }

  return parts.join('.');
}
```

### AI Prompt Enhancement

**Updated Prompt Template:**

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

## Implementation Plan

### Phase 1: Enhance AI Service with Path Analysis

**Files to Modify:**
- `src/core/ai-service.ts` - Add path analysis logic
- `src/types/i18n.ts` - Add new type definitions

**New Parameters:**
- Add `filePath: string` to `getAiSuggestions()` method
- Add `projectRoot: string` to AiService constructor

**Changes:**
1. Implement `analyzeFilePath()` function
2. Implement `detectElementContext()` function
3. Implement `constructI18nKey()` function
4. Update AI prompt with path context

### Phase 2: Update File Processor

**Files to Modify:**
- `src/core/file-processor.ts` - Pass file path to AI service

**Changes:**
1. Pass `filePath` to `aiService.getAiSuggestions()`
2. Pass `projectRoot` when initializing AiService

### Phase 3: Testing

**Test Cases:**
1. Editor flow files → Keys start with `editor.`
2. Client flow files → Keys start with `client.`
3. Shared components → Keys start with `common.`
4. Game-specific files → Include game module name
5. Deep nested components → Respect max depth of 5 levels

### Phase 4: Documentation

**Files to Create/Update:**
- Update `CLAUDE.md` with new key naming conventions
- Create examples in `docs/examples/`
- Update MCP tool descriptions

---

## Benefits of This Approach

### 1. Semantic and Maintainable
- Keys reflect application structure and meaning
- Easy to understand and locate
- Survives refactoring (if structure maintained)

### 2. Scalable
- Works for projects of any size
- Supports code-splitting by namespace/module
- Team members can work independently on different modules

### 3. Consistent
- Automated generation ensures consistency
- Clear rules reduce human error
- AI follows project conventions

### 4. Context-Aware
- File path provides natural hierarchy
- Module and component context included
- Element type adds semantic clarity

### 5. Developer-Friendly
- Intuitive key structure
- Easy to predict key names
- Auto-completion friendly in IDEs

---

## Migration Guide (For Existing Projects)

### Option 1: Gradual Migration
- New translations use new format
- Keep existing keys as-is
- Migrate incrementally during refactoring

### Option 2: Automated Migration
- Create migration script to analyze and rename keys
- Update all references in codebase
- Validate with tests

### Option 3: Dual Format Support
- Support both old and new formats
- Deprecate old format over time
- Show warnings for old-style keys

---

## Appendix: Comparison Table

| Aspect | Current Approach | Proposed Approach |
|--------|-----------------|-------------------|
| **Structure** | Flat, element-type based | Hierarchical, context-aware |
| **Example** | `label.xxx_aaa_sss_ddd` | `editor.aiWebGame.gameConfig.title` |
| **Context** | Element type only | File path + module + component |
| **Scalability** | Poor (flat namespace) | Excellent (nested structure) |
| **Maintainability** | Difficult | Easy |
| **Semantic** | Low (generic names) | High (meaningful names) |
| **Code-splitting** | Not supported | Fully supported |
| **Team collaboration** | Conflicts likely | Isolated by module |
| **Max depth** | Unlimited | 4-5 levels |

---

## References

1. **Locize** - "The Art of the Key: A Definitive Guide to i18n Key Naming"
2. **Tolgee** - "The Key to Translation: The Ultimate Guide to Naming Translation Keys"
3. **Lokalise** - "Translation keys: naming conventions and organizing"
4. **POEditor** - "Best Practices for Naming String Identifiers"
5. **React i18next** - "Multiple Translation Files" & "Namespaces"
6. **DEV Community** - "Three ways to name i18n translation keys"
7. **ButterCMS** - "React Internationalization for Large Scale Apps"

---

**Document Version:** 1.0
**Last Updated:** 2025-01-13
**Status:** Proposed
**Next Steps:** Review → Implement → Test → Deploy
