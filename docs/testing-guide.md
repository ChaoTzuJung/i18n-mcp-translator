# Testing Guide for i18n MCP Translator

## Overview

This document describes the testing strategy for the context-aware i18n key generation feature.

## Test Structure

### 1. TDD (Test-Driven Development) Unit Tests

**Location:** `src/core/__tests__/*.test.ts`

#### Path Analysis Tests (`ai-service-path-analysis.test.ts`)
Tests the file path parsing and context extraction:
- ✅ Editor namespace detection
- ✅ Client namespace detection
- ✅ UGC namespace detection
- ✅ Common namespace detection
- ✅ Module extraction (game_xxx, feature modules)
- ✅ Component extraction
- ✅ CamelCase conversion
- ✅ Edge cases (deep nesting, index files)

#### Element Detection Tests (`ai-service-element-detection.test.ts`)
Tests the element type detection from code context:
- ✅ Button detection (<button>, onClick, Material-UI Button)
- ✅ Title/Heading detection (<h1>-<h6>, Typography)
- ✅ Placeholder detection (input, TextField)
- ✅ Tooltip detection
- ✅ Error message detection
- ✅ Description detection
- ✅ Label detection (default)
- ✅ Complex contexts

#### Key Construction Tests (`ai-service-key-construction.test.ts`)
Tests the intelligent key building logic:
- ✅ Hierarchical structure (4-5 levels max)
- ✅ Element type suffix rules
- ✅ Semantic naming (camelCase)
- ✅ Common namespace detection
- ✅ Pattern consistency
- ✅ Edge cases

### 2. BDD (Behavior-Driven Development) Integration Tests

**Location:** `src/core/__tests__/*.spec.ts`

#### Integration Scenarios (`ai-service-integration.spec.ts`)
Tests complete workflows with real-world scenarios:

**Scenario 1: Developer edits AI Web Game in Editor**
```gherkin
GIVEN I am in the Editor flow editing AI Web Game settings
WHEN I translate a title
THEN The key should be editor.aiWebGame.gameConfig.title
AND Translations should be provided for all languages
```

**Scenario 2: User interacts with Check-In game**
```gherkin
GIVEN I am building a check-in card for the client flow
WHEN Displaying check-in button
THEN Should use client.checkIn.card.checkIn
AND Should not have .button suffix
```

**Scenario 3: Developer creates reusable UI components**
```gherkin
GIVEN I create a common Save button component
WHEN Processing common button text
THEN Should use common.button.save
```

**Scenario 4: Working with form inputs**
**Scenario 5: Managing Prize configuration**
**Scenario 6: Edge cases and consistency**

## Running Tests

### All Tests
```bash
npm test
```

### Watch Mode
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

### UI Mode
```bash
npm run test:ui
```

## Test Coverage Goals

- **Path Analysis:** 100% coverage of all namespace/module/component patterns
- **Element Detection:** 100% coverage of all element types
- **Key Construction:** 100% coverage of all rules and edge cases
- **Integration:** Coverage of all real-world scenarios from Fever Admin project

## Mock Strategy

### Google AI API Mocking
```typescript
vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: vi.fn().mockReturnValue({
      generateContent: vi.fn()
    })
  }))
}));
```

### File System Mocking
Not required - tests use in-memory data

### Lang Manager Mocking
Mocked at the method level to avoid file system dependencies

## Test Data

### Sample File Paths
- Editor: `/fever-admin/src/editor/game_aiWebGame/SettingPanel/GameConfig.jsx`
- Client: `/fever-admin/src/client/game_checkIn/CheckInCard.jsx`
- Common: `/fever-admin/src/components/common/Button/SaveButton.jsx`
- UGC: `/fever-admin/src/ugc/components/ugcGallery/waterfall/index.jsx`

### Sample Translations
All tests include 7 languages:
- zh-TW (Traditional Chinese)
- en-US (English)
- ja (Japanese)
- th (Thai)
- es-419 (Spanish Latin America)
- pt-BR (Portuguese Brazil)
- zh-CN (Simplified Chinese)

## Known Issues

### Issue: Module mocking timing
**Problem:** `vi.mock()` inside `beforeEach()` doesn't work correctly
**Solution:** Move `vi.mock()` to top-level, use `vi.doMock()` for dynamic mocking

### Issue: ESM module mocking
**Problem:** ESM modules harder to mock than CommonJS
**Solution:** Use Vitest's built-in ESM support

## Future Improvements

1. **Snapshot Testing:** Add snapshot tests for generated keys
2. **Property-Based Testing:** Use fast-check for random test generation
3. **Performance Testing:** Add benchmarks for path analysis speed
4. **E2E Testing:** Test with real Google AI API (separate test suite)

## Continuous Integration

### Pre-commit Hooks
```bash
# Add to package.json
"husky": {
  "hooks": {
    "pre-commit": "npm test"
  }
}
```

### CI Pipeline
```yaml
# GitHub Actions example
- name: Run Tests
  run: npm test
- name: Upload Coverage
  uses: codecov/codecov-action@v3
```

## Documentation

- Test files include inline documentation
- Each test has clear GIVEN/WHEN/THEN structure (BDD) or AAA structure (TDD)
- Complex logic explained with comments

## Examples

### TDD Unit Test Example
```typescript
it('should extract namespace "editor" from editor flow paths', async () => {
  // Arrange
  const testPath = '/test/project/src/editor/game_aiWebGame/SettingPanel.jsx';

  // Act
  const result = await aiService.getAiSuggestions(text, context, testPath);

  // Assert
  expect(result?.i18nKey).toContain('editor');
});
```

### BDD Integration Test Example
```typescript
it('GIVEN I am in the Editor flow editing AI Web Game settings', async () => {
  // GIVEN
  const filePath = '/fever-admin/src/editor/game_aiWebGame/SettingPanel.jsx';

  // WHEN
  const result = await aiService.getAiSuggestions(text, context, filePath);

  // THEN
  expect(result?.i18nKey).toBe('editor.aiWebGame.settingPanel.title');
});
```

## Maintenance

- Update tests when adding new namespaces or modules
- Add new test cases for new element types
- Keep test data in sync with Fever Admin structure
- Review and update mocks when dependencies change

---

**Last Updated:** 2025-01-13
**Test Framework:** Vitest 4.0.8
**Coverage Tool:** V8
**Test Files:** 4 files, 68 tests
