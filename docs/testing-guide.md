# i18n MCP Translator 測試指南

## 概述

本文件說明上下文感知 i18n key 生成功能的測試策略。

## 測試結構

### 1. TDD（測試驅動開發）單元測試

**位置:** `src/core/__tests__/*.test.ts`

#### 路徑分析測試 (`ai-service-path-analysis.test.ts`)
測試文件路徑解析和上下文提取:
- ✅ Editor 命名空間偵測
- ✅ Client 命名空間偵測
- ✅ UGC 命名空間偵測
- ✅ Common 命名空間偵測
- ✅ 模組提取（game_xxx、功能模組）
- ✅ 元件提取
- ✅ CamelCase 轉換
- ✅ 邊界情況（深度巢狀、索引文件）

#### 元素偵測測試 (`ai-service-element-detection.test.ts`)
測試從程式碼上下文偵測元素類型:
- ✅ 按鈕偵測（<button>、onClick、Material-UI Button）
- ✅ 標題/Heading 偵測（<h1>-<h6>、Typography）
- ✅ Placeholder 偵測（input、TextField）
- ✅ Tooltip 偵測
- ✅ 錯誤訊息偵測
- ✅ 描述偵測
- ✅ Label 偵測（預設）
- ✅ 複雜上下文

#### Key 建構測試 (`ai-service-key-construction.test.ts`)
測試智能 key 建構邏輯:
- ✅ 階層結構（最多 4-5 層）
- ✅ 元素類型後綴規則
- ✅ 語義命名（camelCase）
- ✅ Common 命名空間偵測
- ✅ 模式一致性
- ✅ 邊界情況

### 2. BDD（行為驅動開發）整合測試

**位置:** `src/core/__tests__/*.spec.ts`

#### 整合情境 (`ai-service-integration.spec.ts`)
使用真實世界情境測試完整工作流程:

**情境 1: 開發者在 Editor 中編輯 AI Web Game**
```gherkin
GIVEN I am in the Editor flow editing AI Web Game settings
WHEN I translate a title
THEN The key should be editor.aiWebGame.gameConfig.title
AND Translations should be provided for all languages
```

**情境 2: 用戶與 Check-In 遊戲互動**
```gherkin
GIVEN I am building a check-in card for the client flow
WHEN Displaying check-in button
THEN Should use client.checkIn.card.checkIn
AND Should not have .button suffix
```

**情境 3: 開發者創建可重用的 UI 元件**
```gherkin
GIVEN I create a common Save button component
WHEN Processing common button text
THEN Should use common.button.save
```

**情境 4: 使用表單輸入**
**情境 5: 管理獎品配置**
**情境 6: 邊界情況和一致性**

## 執行測試

### 所有測試
```bash
npm test
```

### Watch 模式
```bash
npm run test:watch
```

### 覆蓋率報告
```bash
npm run test:coverage
```

### UI 模式
```bash
npm run test:ui
```

## 測試覆蓋率目標

- **路徑分析:** 100% 覆蓋所有命名空間/模組/元件模式
- **元素偵測:** 100% 覆蓋所有元素類型
- **Key 建構:** 100% 覆蓋所有規則和邊界情況
- **整合:** 覆蓋 Fever Admin 專案的所有真實世界情境

## Mock 策略

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

### 文件系統 Mocking
不需要 - 測試使用記憶體內數據

### Lang Manager Mocking
在方法層級 mock 以避免文件系統依賴

## 測試數據

### 範例文件路徑
- Editor: `/fever-admin/src/editor/game_aiWebGame/SettingPanel/GameConfig.jsx`
- Client: `/fever-admin/src/client/game_checkIn/CheckInCard.jsx`
- Common: `/fever-admin/src/components/common/Button/SaveButton.jsx`
- UGC: `/fever-admin/src/ugc/components/ugcGallery/waterfall/index.jsx`

### 範例翻譯
所有測試包含 7 種語言:
- zh-TW（繁體中文）
- en-US（英文）
- ja（日文）
- th（泰文）
- es-419（拉丁美洲西班牙文）
- pt-BR（巴西葡萄牙文）
- zh-CN（簡體中文）

## 已知問題

### 問題: 模組 mocking 時機
**問題:** `vi.mock()` 在 `beforeEach()` 內無法正確工作
**解決方案:** 將 `vi.mock()` 移至頂層，使用 `vi.doMock()` 進行動態 mocking

### 問題: ESM 模組 mocking
**問題:** ESM 模組比 CommonJS 更難 mock
**解決方案:** 使用 Vitest 的內建 ESM 支援

## 未來改進

1. **快照測試:** 為生成的 key 新增快照測試
2. **屬性基礎測試:** 使用 fast-check 進行隨機測試生成
3. **效能測試:** 為路徑分析速度新增基準測試
4. **E2E 測試:** 使用真實的 Google AI API 測試（單獨的測試套件）

## 持續整合

### Pre-commit Hooks
```bash
# 新增到 package.json
"husky": {
  "hooks": {
    "pre-commit": "npm test"
  }
}
```

### CI Pipeline
```yaml
# GitHub Actions 範例
- name: Run Tests
  run: npm test
- name: Upload Coverage
  uses: codecov/codecov-action@v3
```

## 文件

- 測試文件包含內聯文件
- 每個測試都有清晰的 GIVEN/WHEN/THEN 結構（BDD）或 AAA 結構（TDD）
- 複雜邏輯以註解說明

## 範例

### TDD 單元測試範例
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

### BDD 整合測試範例
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

## 維護

- 新增新的命名空間或模組時更新測試
- 為新的元素類型新增新測試案例
- 保持測試數據與 Fever Admin 結構同步
- 當依賴變更時審查和更新 mock

---

**最後更新:** 2025-01-13
**測試框架:** Vitest 4.0.8
**覆蓋率工具:** V8
**測試文件:** 4 個文件，68 個測試
