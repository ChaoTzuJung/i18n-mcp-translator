# 規格說明：Sort JSON Keys 工具

## 摘要

新增新的 MCP 工具 `sort_json_keys`，可以按字母順序排序 i18n 翻譯文件中的 JSON 物件 key。這確保所有翻譯文件的 key 排序一致，提高翻譯結構的可維護性和可讀性。

## 問題陳述

翻譯文件通常會隨著發現或需要的 key 被加入的順序而有機成長，而不是按字母順序。這使得：
- 難以視覺化找到特定的翻譯 key
- 修改 key 時難以審查差異
- 難以維護多個翻譯文件之間的一致性
- 難以邏輯化組織翻譯結構

## 目標

1. **遞迴 Key 排序**：在所有巢狀層級按字母順序排序 JSON key，同時保留結構
2. **彈性輸入**：支援單一文件、多個文件或整個目錄（帶遞迴掃描）
3. **安全操作**：建立備份、驗證 JSON，並在失敗時還原
4. **預覽模式**：允許使用者在不修改文件的情況下查看會發生什麼變更
5. **詳細日誌**：提供清晰的處理進度和結果回饋

## 成功標準

- [x] 工具成功按字母順序排序 JSON key
- [x] 支援單一文件輸入
- [x] 支援多個文件輸入（路徑陣列）
- [x] 支援帶遞迴文件探索的目錄輸入
- [x] 修改前建立時間戳備份
- [x] 處理前驗證 JSON 語法
- [x] 失敗時從備份還原
- [x] 提供預覽的 dry-run 模式
- [x] 計算並報告排序前後的 key 數量
- [x] 與現有 MCP 伺服器基礎設施整合
- [x] TypeScript 編譯成功無錯誤
- [x] 對現有功能無破壞性變更

## 技術細節

### 實作

**文件**：`src/tools/sort-json-keys.ts`

主要函數：
- `sortJsonKeys()`：遞迴排序 JSON 物件 key
- `countKeys()`：計算 JSON 結構中的總 key 數
- `sortJsonFile()`：使用備份/還原處理單一文件
- `findJsonFiles()`：在目錄中遞迴發現 JSON 文件
- `sortJsonKeysInFiles()`：主要編排函數
- `handleSortJsonKeys()`：MCP 工具處理器
- `setupSortJsonKeysTool()`：工具註冊

### MCP 工具定義

**名稱**：`sort_json_keys`

**參數**：
- `targets`（string | string[]）：JSON 文件或目錄的路徑
- `dryRun`（boolean，預設：false）：預覽模式，不修改
- `projectRoot`（string，可選）：用於路徑解析的專案根目錄

**返回類型**：
```typescript
{
  success: boolean;
  message: string;
  details: {
    processedFiles: number;
    successCount: number;
    results: SortResult[];
  };
}
```

### 使用範例

```javascript
// 排序單一文件
sort_json_keys({
  targets: "src/locale/zh-TW.json"
})

// 排序多個文件
sort_json_keys({
  targets: ["src/locale/zh-TW.json", "src/locale/en-US.json"]
})

// 排序整個目錄（遞迴）
sort_json_keys({
  targets: "src/locale"
})

// 預覽而不修改
sort_json_keys({
  targets: "src/locale",
  dryRun: true
})
```

## 已完成的變更

### 新文件
- `src/tools/sort-json-keys.ts` - 完整的工具實作（350+ 行）

### 修改的文件
- `src/server/mcp-tools.ts` - 在 MCPTools 類別中註冊 `setupSortJsonKeysTool`

### 建置結果
- ✅ TypeScript 編譯成功
- ✅ 無類型錯誤或警告
- ✅ 在 `build/tools/sort-json-keys.js` 生成工具執行檔

## 功能標誌

不適用 - 工具預設完全啟用。

## 測試

- [x] 編譯測試：`npm run build` 通過
- [x] 類型檢查：`npm run typecheck` 通過
- [x] Git 整合：變更已成功提交和推送

## 推出計劃

1. **合併**：透過 PR 整合到主分支
2. **發布**：包含在下一個版本升級中（v1.2.3 或更高版本）
3. **文件**：使用工具描述更新 CLAUDE.md
4. **使用**：部署後立即在 MCP 伺服器中可用

## 遷移/破壞性變更

無 - 這是新功能，對現有功能無影響。

## 未來增強功能

- 保留現有 key 順序的選項（非破壞性）
- 自定義排序函數（例如，按值排序、大小寫敏感）
- 與翻譯驗證管道整合
- 輸出排序前後的 key 排序統計資訊
- 支援巢狀 key 排序（例如，只排序頂層 key）
