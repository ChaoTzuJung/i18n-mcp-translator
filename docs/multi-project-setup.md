# Multi-Project Setup Guide

This guide explains how to configure i18n MCP translator for multiple projects.

## Overview

The i18n MCP translator supports multiple projects through flexible configuration. Each project can have:
- Different translation file structures
- Different target languages
- Different naming conventions
- Different file locations

## Configuration Strategies

### Strategy 1: Per-Project MCP Servers (Recommended)

Create separate MCP server instances for each project in your MCP configuration file.

#### Example: Claude Code Configuration

**Location:** `~/.config/claude/mcp.json` or `.cursor/mcp.json`

```json
{
  "mcpServers": {
    "i18n-fever-admin": {
      "command": "npx",
      "args": ["-y", "i18n-mcp-translator"],
      "env": {
        "GOOGLE_AI_API_KEY": "your-api-key",
        "I18N_MCP_BASE_LANGUAGE": "zh-TW",
        "I18N_MCP_TARGET_LANGUAGES": "zh-TW,en-US,ja,zh-CN,pt-BR,es-419,th-TH",
        "I18N_MCP_TRANSLATION_DIR": "/absolute/path/to/fever-admin/src/assets/locale",
        "I18N_MCP_SRC_DIR": "/absolute/path/to/fever-admin/src",
        "I18N_MCP_PROJECT_ROOT": "/absolute/path/to/fever-admin"
      }
    },
    "i18n-new-canvas-admin": {
      "command": "npx",
      "args": ["-y", "i18n-mcp-translator"],
      "env": {
        "GOOGLE_AI_API_KEY": "your-api-key",
        "I18N_MCP_BASE_LANGUAGE": "zh-TW",
        "I18N_MCP_TARGET_LANGUAGES": "zh-TW,en-US,ja,zh-CN",
        "I18N_MCP_TRANSLATION_DIR": "/absolute/path/to/new-canvas-admin/src/assets/locale",
        "I18N_MCP_SRC_DIR": "/absolute/path/to/new-canvas-admin/src",
        "I18N_MCP_PROJECT_ROOT": "/absolute/path/to/new-canvas-admin"
      }
    },
    "i18n-fever-tool": {
      "command": "npx",
      "args": ["-y", "i18n-mcp-translator"],
      "env": {
        "GOOGLE_AI_API_KEY": "your-api-key",
        "I18N_MCP_BASE_LANGUAGE": "zh-TW",
        "I18N_MCP_TARGET_LANGUAGES": "zh-TW,en-US,ja",
        "I18N_MCP_TRANSLATION_DIR": "/absolute/path/to/fever-tool/src/locale",
        "I18N_MCP_SRC_DIR": "/absolute/path/to/fever-tool/src",
        "I18N_MCP_PROJECT_ROOT": "/absolute/path/to/fever-tool"
      }
    },
    "i18n-form": {
      "command": "npx",
      "args": ["-y", "i18n-mcp-translator"],
      "env": {
        "GOOGLE_AI_API_KEY": "your-api-key",
        "I18N_MCP_BASE_LANGUAGE": "zh-TW",
        "I18N_MCP_TARGET_LANGUAGES": "zh-TW,en-US,ja,zh-CN",
        "I18N_MCP_TRANSLATION_DIR": "/absolute/path/to/form/src/i18n",
        "I18N_MCP_SRC_DIR": "/absolute/path/to/form/src",
        "I18N_MCP_PROJECT_ROOT": "/absolute/path/to/form"
      }
    }
  }
}
```

#### Benefits
- ✅ **Clear separation** - Each project has its own configuration
- ✅ **No confusion** - No risk of mixing project configs
- ✅ **Project-specific settings** - Different languages, paths per project
- ✅ **Auto-selection** - Claude Code automatically selects the right server based on working directory

#### How It Works
1. When you open a project, Claude Code detects the working directory
2. It matches the directory to the appropriate MCP server
3. All i18n operations use that project's configuration
4. Switching projects automatically switches MCP server context

### Strategy 2: Single MCP Server with Dynamic Parameters

Use one MCP server and pass project-specific parameters in each tool call.

#### Example Usage

```typescript
// When working on fever-admin
await mcp.call('translate-file', {
  filePath: 'src/admin/components/Button.tsx',
  fileContent: '...',
  projectRoot: '/path/to/fever-admin',
  translationDir: '/path/to/fever-admin/src/assets/locale',
  baseLanguage: 'zh-TW',
  targetLanguages: ['zh-TW', 'en-US', 'ja', 'zh-CN']
});

// When working on fever-tool
await mcp.call('translate-file', {
  filePath: 'src/tools/Editor.tsx',
  fileContent: '...',
  projectRoot: '/path/to/fever-tool',
  translationDir: '/path/to/fever-tool/src/locale',
  baseLanguage: 'zh-TW',
  targetLanguages: ['zh-TW', 'en-US', 'ja']
});
```

#### Benefits
- ✅ **Resource efficient** - Only one MCP server instance
- ✅ **Maximum flexibility** - Can override any parameter per call
- ✅ **Simpler setup** - One configuration entry

#### Drawbacks
- ❌ **More verbose** - Need to specify parameters each time
- ❌ **Error-prone** - Easy to forget or mix up parameters
- ❌ **No auto-detection** - Must manually specify project context

## Project-Specific Naming Conventions

### Context Files for AI Guidance

Create a naming convention guide in each project to help AI generate appropriate i18n keys.

#### Example: fever-admin

**Location:** `fever-admin/docs/i18n-naming-guide.md`

```markdown
# i18n Key Naming Convention - fever-admin

## Structure
{module}.{page}.{section}.{element}.{state}

## Examples

### Admin Module
- admin.users.table.header.name
- admin.users.table.header.email
- admin.users.dialog.create.title
- admin.users.button.add

### Settings Module
- settings.profile.form.label.username
- settings.profile.form.placeholder.email
- settings.profile.button.save

### Common Components
- common.button.save
- common.button.cancel
- common.dialog.confirm
- common.error.network
- common.validation.required
```

#### Example: new-canvas-admin

**Location:** `new-canvas-admin/docs/i18n-naming-guide.md`

```markdown
# i18n Key Naming Convention - new-canvas-admin

## Structure
{feature}.{page}.{component}.{element}.{action}

## Examples

### Achievement Feature
- achievement.dashboard.title
- achievement.create.button.save
- achievement.level.visual.upload.hint

### Campaign Feature
- campaign.onsite.editor.message.placeholder
- campaign.chat.analytics.chart.label

### Point System
- point.mechanism.behavior.title
- point.statistical.chart.label

### Common Components
- common.button.save
- common.table.noData
- common.upload.hint
```

### Passing Context to AI

When using the MCP translator, you can reference these guides:

```bash
# In your project's prompt or context
Please follow the i18n naming conventions specified in docs/i18n-naming-guide.md
when generating translation keys.
```

## Project Comparison Table

| Project | Base Lang | Target Languages | Translation Dir | Structure Type |
|---------|-----------|------------------|-----------------|----------------|
| fever-admin | zh-TW | zh-TW, en-US, ja, zh-CN, pt-BR, es-419, th-TH | src/assets/locale | Per-language files |
| new-canvas-admin | zh-TW | zh-TW, en-US, ja, zh-CN | src/assets/locale | Per-language files |
| fever-tool | zh-TW | zh-TW, en-US, ja | src/locale | Per-language files |
| form | zh-TW | zh-TW, en-US, ja, zh-CN | src/i18n | Legacy single file |

## Workflow Examples

### Example 1: Translating a File in fever-admin

```bash
# Claude will automatically use i18n-fever-admin MCP server

1. Open file: fever-admin/src/admin/Users.tsx
2. Ask Claude: "Please translate this file using i18n MCP"
3. Claude calls: translate-file tool with fever-admin config
4. Result: Keys generated following fever-admin conventions
5. Files updated: fever-admin/src/assets/locale/*.json
```

### Example 2: Generating Locale Diff for new-canvas-admin

```bash
# Working on feature branch in new-canvas-admin

1. Make locale changes on feature branch
2. Ask Claude: "Generate locale diff comparing to main branch"
3. Claude calls: generate_locale_diff with new-canvas-admin config
4. Result: Diff files created in new-canvas-admin/src/assets/locale/diff/
5. Share diff files with translation team
```

### Example 3: Merging Translations for fever-tool

```bash
# After translation team review

1. Receive reviewed translations in fever-tool/src/locale/diff/
2. Ask Claude: "Merge reviewed translations back to original files"
3. Claude calls: merge_translations with fever-tool config
4. Result: Original files updated with reviewed translations
5. Optional: Auto-commit and push changes
```

## Best Practices

### 1. Use Absolute Paths
Always use absolute paths in MCP configuration to avoid ambiguity:

```json
"I18N_MCP_PROJECT_ROOT": "/Users/alan/projects/fever-admin"
```

Not:
```json
"I18N_MCP_PROJECT_ROOT": "../fever-admin"  // ❌ Avoid relative paths
```

### 2. Consistent Language Codes
Use consistent language codes across all projects:
- ✅ `zh-TW`, `en-US`, `ja-JP`, `zh-CN`
- ❌ `zh-tw`, `en`, `ja`, `cn`

### 3. Document Conventions
Maintain i18n naming convention docs in each project:
- `docs/i18n-naming-guide.md`
- `docs/i18n-structure.md`
- Link them in project README

### 4. Naming Convention Alignment
While each project can have different conventions, try to align common patterns:

**Common Elements (All Projects):**
- `common.button.save`
- `common.button.cancel`
- `common.error.network`
- `common.validation.required`

**Project-Specific (Can Differ):**
- fever-admin: `admin.users.table.header.name`
- new-canvas-admin: `achievement.dashboard.title`

### 5. Test Configuration
Test each project's MCP configuration:

```bash
# Test fever-admin config
cd /path/to/fever-admin
# Ask Claude to translate a small test file

# Test new-canvas-admin config
cd /path/to/new-canvas-admin
# Ask Claude to translate a small test file
```

### 6. Version Control
Add MCP configuration to version control (if appropriate):

```bash
# In each project
.cursor/mcp.json  # If using Cursor
.claude/mcp.json  # If using Claude Code
```

Or document the required MCP configuration in project README.

## Troubleshooting

### Issue: Wrong Project's Translation Files Updated

**Cause:** MCP server selected wrong project configuration

**Solution:**
1. Check current working directory matches project
2. Verify MCP server names are unique
3. Restart Claude Code to reload MCP configuration

### Issue: Cannot Find Translation Directory

**Cause:** Incorrect path in configuration

**Solution:**
1. Use absolute paths in MCP configuration
2. Verify directory exists: `ls /path/to/project/src/assets/locale`
3. Check file permissions

### Issue: AI Generates Wrong Key Format

**Cause:** AI not aware of project-specific naming conventions

**Solution:**
1. Create/update `docs/i18n-naming-guide.md` in project
2. Reference the guide when asking Claude
3. Provide examples of desired key format
4. Consider adding naming conventions to project's CLAUDE.md

### Issue: Mixed Languages from Different Projects

**Cause:** Using single MCP server without proper parameter isolation

**Solution:**
1. Switch to per-project MCP server strategy (Strategy 1)
2. Or ensure all tool calls include explicit project parameters

## Advanced: Shared Configuration

For projects that share similar i18n setups, you can use environment variables:

```bash
# In your shell profile (.bashrc, .zshrc)
export GOOGLE_AI_API_KEY="your-api-key"
export I18N_MCP_BASE_LANGUAGE="zh-TW"

# Then in MCP config, only specify project-specific settings
{
  "i18n-fever-admin": {
    "command": "npx",
    "args": ["-y", "i18n-mcp-translator"],
    "env": {
      "I18N_MCP_TARGET_LANGUAGES": "zh-TW,en-US,ja,zh-CN,pt-BR,es-419,th-TH",
      "I18N_MCP_TRANSLATION_DIR": "/path/to/fever-admin/src/assets/locale",
      "I18N_MCP_PROJECT_ROOT": "/path/to/fever-admin"
    }
  }
}
```

## Summary

**Recommended Setup:**
1. ✅ Use Strategy 1 (Per-Project MCP Servers)
2. ✅ Create i18n naming guides in each project
3. ✅ Use absolute paths in configuration
4. ✅ Test each project's setup independently
5. ✅ Document project-specific conventions

**Result:**
- Clear project separation
- No configuration conflicts
- AI generates appropriate keys per project
- Efficient multi-project workflow
