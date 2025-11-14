# Quick Start: Multi-Project Setup

This guide helps you quickly set up i18n MCP translator for multiple projects.

## 5-Minute Setup

### Step 1: Configure MCP for Each Project (2 mins)

Edit your MCP configuration file:
- **Claude Code**: `~/.config/claude/mcp.json`
- **Cursor**: `.cursor/mcp.json` or `~/.cursor/mcp.json`

Add separate servers for each project:

```json
{
  "mcpServers": {
    "i18n-project-a": {
      "command": "npx",
      "args": ["-y", "i18n-mcp-translator"],
      "env": {
        "GOOGLE_AI_API_KEY": "your-api-key",
        "I18N_MCP_BASE_LANGUAGE": "zh-TW",
        "I18N_MCP_TARGET_LANGUAGES": "zh-TW,en-US,ja,zh-CN",
        "I18N_MCP_TRANSLATION_DIR": "/absolute/path/to/project-a/src/assets/locale",
        "I18N_MCP_SRC_DIR": "/absolute/path/to/project-a/src",
        "I18N_MCP_PROJECT_ROOT": "/absolute/path/to/project-a"
      }
    },
    "i18n-project-b": {
      "command": "npx",
      "args": ["-y", "i18n-mcp-translator"],
      "env": {
        "GOOGLE_AI_API_KEY": "your-api-key",
        "I18N_MCP_BASE_LANGUAGE": "zh-TW",
        "I18N_MCP_TARGET_LANGUAGES": "zh-TW,en-US,ja",
        "I18N_MCP_TRANSLATION_DIR": "/absolute/path/to/project-b/src/locale",
        "I18N_MCP_SRC_DIR": "/absolute/path/to/project-b/src",
        "I18N_MCP_PROJECT_ROOT": "/absolute/path/to/project-b"
      }
    }
  }
}
```

**Key Points:**
- Use unique names: `i18n-project-a`, `i18n-project-b`
- Use **absolute paths** for all directories
- Set appropriate target languages per project

### Step 2: Create Naming Convention Guides (2 mins)

In each project, create `docs/i18n-naming-guide.md`:

**Minimal Template:**
```markdown
# i18n Key Naming Convention

## Structure
{feature}.{page}.{element}.{action}

## Examples

### Feature Module
feature.page.button.save
feature.page.title
feature.page.form.label.name

### Common
common.button.save
common.button.cancel
common.error.network
```

**Copy from:**
- Full template: `docs/examples/i18n-naming-guide-template.md`
- new-canvas-admin example: `docs/examples/new-canvas-admin-naming-guide.md`

### Step 3: Test the Setup (1 min)

```bash
# Open project A
cd /path/to/project-a

# Ask Claude:
# "Please translate this file using i18n MCP"
# (on any file with hardcoded Chinese text)

# Verify:
# 1. Correct language files updated
# 2. Keys follow your naming convention
# 3. No errors in translation

# Repeat for project B
cd /path/to/project-b
```

## Common Use Cases

### Use Case 1: Translate a File

```bash
# 1. Open file in your project
# 2. Ask Claude:
"Please use i18n MCP to translate the hardcoded Chinese text in this file"

# Claude will:
# - Detect which project you're in
# - Use the correct MCP server
# - Generate keys following your conventions
# - Update the right translation files
```

### Use Case 2: Generate Locale Diff

```bash
# After making locale changes on feature branch
# Ask Claude:
"Generate locale diff comparing my current branch to main"

# Claude will:
# - Use generate_locale_diff tool
# - Create diff files in locale/diff/
# - Include all language variants
# - Preserve subdirectory structure
```

### Use Case 3: Merge Reviewed Translations

```bash
# After receiving reviewed translations
# Ask Claude:
"Merge the reviewed translations from locale/diff/ back to the original files"

# Claude will:
# - Use merge_translations tool
# - Show detailed statistics
# - Update only changed keys
# - Optionally auto-commit
```

## Project Configuration Checklist

For each project, ensure:

- [ ] MCP server configured in mcp.json
- [ ] Unique server name (e.g., `i18n-fever-admin`)
- [ ] GOOGLE_AI_API_KEY set
- [ ] All paths are absolute
- [ ] TARGET_LANGUAGES set correctly
- [ ] Translation directory exists
- [ ] i18n naming guide created
- [ ] Test translation on sample file
- [ ] Verify correct files updated

## Configuration Examples

### Example 1: new-canvas-admin

Comprehensive admin panel with achievement, campaign, point systems.

```json
"i18n-new-canvas-admin": {
  "command": "npx",
  "args": ["-y", "i18n-mcp-translator"],
  "env": {
    "GOOGLE_AI_API_KEY": "AIza...",
    "I18N_MCP_BASE_LANGUAGE": "zh-TW",
    "I18N_MCP_TARGET_LANGUAGES": "zh-TW,en-US,ja,zh-CN",
    "I18N_MCP_TRANSLATION_DIR": "/path/to/new-canvas-admin/src/assets/locale",
    "I18N_MCP_SRC_DIR": "/path/to/new-canvas-admin/src",
    "I18N_MCP_PROJECT_ROOT": "/path/to/new-canvas-admin"
  }
}
```

**Naming Convention:**
```
{feature}.{page}.{component}.{element}.{action}

Examples:
achievement.dashboard.title
campaign.onsite.editor.message.placeholder
point.mechanism.behavior.add
promo.list.table.header.name
common.button.save
```

**Documentation:** See [new-canvas-admin-naming-guide.md](../examples/new-canvas-admin-naming-guide.md)

### Example 2: fever-tool

OnSite assistant tool for staff operations.

```json
"i18n-fever-tool": {
  "command": "npx",
  "args": ["-y", "i18n-mcp-translator"],
  "env": {
    "GOOGLE_AI_API_KEY": "AIza...",
    "I18N_MCP_BASE_LANGUAGE": "zh-TW",
    "I18N_MCP_TARGET_LANGUAGES": "zh-TW,en-US",
    "I18N_MCP_TRANSLATION_DIR": "/path/to/fever-tool/src/locale",
    "I18N_MCP_SRC_DIR": "/path/to/fever-tool/src",
    "I18N_MCP_PROJECT_ROOT": "/path/to/fever-tool"
  }
}
```

**Naming Convention:**
```
{feature}.{page}.{section}.{element}

Examples:
onSiteAssistant.promotions.title
onSiteAssistant.missionReward.form.label.name
onSiteAssistant.promoGenerator.button.generate
camera.scanner.instruction
common.button.save
```

**Documentation:** See [fever-tool-naming-guide.md](../examples/fever-tool-naming-guide.md)

### Example 3: form

Form builder with Editor and Client modes.

```json
"i18n-form": {
  "command": "npx",
  "args": ["-y", "i18n-mcp-translator"],
  "env": {
    "GOOGLE_AI_API_KEY": "AIza...",
    "I18N_MCP_BASE_LANGUAGE": "zh-TW",
    "I18N_MCP_TARGET_LANGUAGES": "zh-TW,en-US",
    "I18N_MCP_TRANSLATION_DIR": "/path/to/form/src/locale",
    "I18N_MCP_SRC_DIR": "/path/to/form/src",
    "I18N_MCP_PROJECT_ROOT": "/path/to/form"
  }
}
```

**Naming Convention:**
```
{mode}.{domain}.{component}.{element}.{property}

Examples:
editor.navbar.button.save
editor.fieldSetting.singleLine.placeholder.label
client.field.fileUpload.error.fileSize
client.validation.required
common.button.save
```

**Note:** Form project has dual-mode structure:
- `editor.*` - Form builder (create/edit)
- `client.*` - Form viewer (display/fill)
- `common.*` - Shared components

**Documentation:** See [form-naming-guide.md](../examples/form-naming-guide.md)

## Troubleshooting

### Problem: Claude updates wrong project's files

**Solution:**
1. Check current directory matches project
2. Restart Claude Code
3. Verify MCP server names are unique

```bash
# Check current directory
pwd

# Should output: /path/to/current-project
```

### Problem: Keys don't follow naming convention

**Solution:**
1. Ensure `docs/i18n-naming-guide.md` exists
2. Reference it when asking Claude:
   ```
   "Please translate using the naming conventions in docs/i18n-naming-guide.md"
   ```
3. Provide examples in your request

### Problem: Translation directory not found

**Solution:**
1. Verify path is absolute (starts with `/`)
2. Check directory exists:
   ```bash
   ls /absolute/path/to/project/src/assets/locale
   ```
3. Check permissions:
   ```bash
   ls -la /absolute/path/to/project/src/assets/
   ```

### Problem: Wrong languages generated

**Solution:**
1. Check `I18N_MCP_TARGET_LANGUAGES` in mcp.json
2. Ensure languages are comma-separated (no spaces)
3. Use correct language codes:
   - ✅ `zh-TW,en-US,ja`
   - ❌ `zh-tw, en, ja`

## Best Practices

### 1. Use Consistent Language Codes

Standardize across all projects:
```
zh-TW (Traditional Chinese)
zh-CN (Simplified Chinese)
en-US (English - US)
ja-JP or ja (Japanese)
ko-KR (Korean)
pt-BR (Portuguese - Brazil)
es-419 (Spanish - Latin America)
th-TH (Thai)
```

### 2. Organize Translation Files

**Recommended structure:**
```
src/
└── assets/
    └── locale/
        ├── zh-TW.json
        ├── en-US.json
        ├── ja-JP.json
        └── zh-CN.json
```

Or with subdirectories:
```
src/
└── assets/
    └── locale/
        ├── client/
        │   ├── zh-TW.json
        │   └── en-US.json
        └── editor/
            ├── zh-TW.json
            └── en-US.json
```

### 3. Document Conventions

In each project, maintain:
- `docs/i18n-naming-guide.md` - Naming conventions
- `docs/i18n-workflow.md` - Team workflow
- `README.md` - Quick reference

### 4. Version Control

**Include in git:**
- Translation files (`*.json`)
- Naming guides (`docs/*.md`)
- Examples

**Exclude from git:**
- Diff directories (`locale/diff/`)
- Temporary files

```gitignore
# .gitignore
**/locale/diff/
**/locale/*.tmp
```

### 5. Team Workflow

1. **Developer**:
   - Write code with hardcoded text
   - Use i18n MCP to generate keys and translations
   - Commit code + base language translations

2. **Translation Team**:
   - Generate diff using `generate_locale_diff`
   - Review and modify translations
   - Return reviewed files

3. **Developer**:
   - Merge translations using `merge_translations`
   - Verify and commit
   - Push to repository

## Advanced Configuration

### Environment Variables

Set common variables in shell profile:

```bash
# ~/.bashrc or ~/.zshrc
export GOOGLE_AI_API_KEY="your-api-key"
export I18N_MCP_BASE_LANGUAGE="zh-TW"

# Then in mcp.json, only set project-specific vars
{
  "i18n-project": {
    "env": {
      "I18N_MCP_TARGET_LANGUAGES": "zh-TW,en-US",
      "I18N_MCP_PROJECT_ROOT": "/path/to/project"
    }
  }
}
```

### Conditional Configuration

For different environments:

```bash
# Development
export I18N_MCP_TARGET_LANGUAGES="zh-TW,en-US"

# Production (all languages)
export I18N_MCP_TARGET_LANGUAGES="zh-TW,en-US,ja,zh-CN,pt-BR,es-419,th-TH"
```

## Next Steps

1. **Read full documentation**: `docs/multi-project-setup.md`
2. **Review examples**: `docs/examples/`
3. **Join discussions**: [GitHub Issues](https://github.com/ChaoTzuJung/i18n-mcp-translator/issues)
4. **Share feedback**: Help improve the tool!

## Resources

- **Full Setup Guide**: [multi-project-setup.md](./multi-project-setup.md)
- **Naming Guide Template**: [i18n-naming-guide-template.md](./examples/i18n-naming-guide-template.md)
- **new-canvas-admin Example**: [new-canvas-admin-naming-guide.md](./examples/new-canvas-admin-naming-guide.md)
- **Main README**: [../README.md](../README.md)
- **CLAUDE.md**: [../CLAUDE.md](../CLAUDE.md)

---

**Questions or Issues?**

- GitHub Issues: https://github.com/ChaoTzuJung/i18n-mcp-translator/issues
- Documentation: https://github.com/ChaoTzuJung/i18n-mcp-translator/tree/main/docs

**Last Updated:** 2025-11-14
