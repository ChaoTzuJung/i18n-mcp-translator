# 移除 Tools 規格文件

## 概述

該規格文件描述從 i18n MCP 翻譯伺服器中移除三個工具的詳細要求：
1. `git_commit_push` - Git 提交推送工具
2. `enhanced_translate_file` - 增強版翻譯（具有智慧快取）
3. `batch_translate_files` - 批次翻譯（平行處理 + 快取）

## 移除原因

- 這些工具的功能已整合或可由其他工具替代
- 簡化 MCP 伺服器的工具集，降低維護成本
- 減少程式碼複雜度，提高可維護性

## 詳細移除計畫

### 1. 移除 `git_commit_push` 工具

**相關檔案：**
- `src/tools/git-commit-push.ts` - 完整刪除
- `src/server/mcp-tools.ts` - 移除工具註冊（第 57-58 行）
- `src/utils/git-operations.js` - 檢查是否其他模組依賴，若無則刪除

**工具定義詳情：**
- 主處理函數：`handleGitCommitPush()` (第 13-73 行)
- 工具註冊函數：`setupGitCommitPushTool()` (第 78-98 行)
- 依賴：`executeGitOperations` from `../utils/git-operations.js`

**驗證清單：**
- [ ] 移除 `src/tools/git-commit-push.ts` 檔案
- [ ] 從 `mcp-tools.ts` 中移除工具註冊代碼
- [ ] 檢查 `git-operations.js` 是否有其他依賴
- [ ] 驗證沒有其他檔案 import 此工具
- [ ] 執行類型檢查確保沒有未使用的導入

### 2. 移除 `enhanced_translate_file` 工具

**相關檔案：**
- `src/tools/enhanced-translate-file.ts` - 部分刪除（保留 `batch_translate_files` 的處理函數）
  - 移除：主處理函數 `handleEnhancedTranslateFile()` (第 80-288 行)
  - 移除：工具定義對象 `enhancedTranslateFile` (第 30-78 行)
- `src/server/mcp-tools.ts` - 移除工具註冊（第 61-73 行）

**工具定義詳情：**
- 功能描述：單文件翻譯，具有智能缓存和优化功能
- 主要功能：文件級快取、MCP 響應快取、進度監控
- 核心依賴：`TranslationCache`、`MCPCacheWrapper`、`TranslationMonitor`、`TranslationCore`、`BatchProcessor`

**驗證清單：**
- [ ] 從 `enhanced-translate-file.ts` 中移除 `enhancedTranslateFile` 定義對象
- [ ] 從 `enhanced-translate-file.ts` 中移除 `handleEnhancedTranslateFile()` 函數
- [ ] 從 `mcp-tools.ts` 中移除工具註冊代碼
- [ ] 驗證 `batch_translate_files` 功能不受影響
- [ ] 執行類型檢查確保無錯誤

### 3. 移除 `batch_translate_files` 工具

**相關檔案：**
- `src/tools/enhanced-translate-file.ts` - 移除此工具的處理函數
  - 移除：主處理函數 `handleBatchTranslateFiles()` (第 361-508 行)
  - 移除：工具定義對象 `batchTranslateFiles` (第 302-359 行)
- `src/server/mcp-tools.ts` - 移除工具註冊（第 75-89 行）

**工具定義詳情：**
- 功能描述：批量翻譯多個文件，具有並行處理和智能快取
- 主要功能：文件掃描、並行處理、智能優先級分類、進度監控
- 核心依賴：`BatchProcessor`、`ParallelProcessor`、`TranslationMonitor`、`TranslationCache`

**驗證清單：**
- [ ] 從 `enhanced-translate-file.ts` 中移除 `batchTranslateFiles` 定義對象
- [ ] 從 `enhanced-translate-file.ts` 中移除 `handleBatchTranslateFiles()` 函數
- [ ] 從 `mcp-tools.ts` 中移除工具註冊代碼
- [ ] 驗證無其他檔案依賴此工具
- [ ] 執行類型檢查確保無錯誤

## 支持組件評估

以下是可能需要評估是否保留的支持組件（若無其他工具依賴則應刪除）：

| 組件 | 位置 | 被依賴情況 | 處置方案 |
|------|------|-----------|---------|
| **TranslationCache** | `src/core/translation-cache.ts` | 被 `enhanced_translate_file` 和 `batch_translate_files` 使用 | 評估刪除 |
| **MCPCacheWrapper** | `src/core/mcp-cache-wrapper.ts` | 被 `enhanced_translate_file` 使用 | 評估刪除 |
| **BatchProcessor** | `src/core/batch-processor.ts` | 被 `enhanced_translate_file` 和 `batch_translate_files` 使用 | 評估刪除 |
| **ParallelProcessor** | `src/core/parallel-processor.ts` | 被 `batch_translate_files` 使用 | 評估刪除 |
| **TranslationMonitor** | `src/core/translation-monitor.ts` | 被 `enhanced_translate_file` 和 `batch_translate_files` 使用 | 評估刪除 |
| **TranslationCore** | `src/core/translation-core.ts` | 被 `enhanced_translate_file` 使用 | 保留 |

## 實現步驟

1. **代碼移除階段**
   - 刪除或編輯 `src/tools/git-commit-push.ts`
   - 編輯 `src/tools/enhanced-translate-file.ts`（移除兩個工具的代碼）
   - 從 `src/server/mcp-tools.ts` 中移除所有工具註冊

2. **依賴性分析階段**
   - 搜索所有 TypeScript/JavaScript 檔案中是否有對這些工具的導入
   - 檢查 `git-operations.js` 的使用情況
   - 檢查各支持組件的依賴關係

3. **清理階段**
   - 移除未被使用的支持組件（如果適用）
   - 移除未被使用的實用程式檔案

4. **驗證階段**
   - 執行 `npm run typecheck` 確保沒有類型錯誤
   - 執行 `npm run build` 確保代碼能正確編譯
   - 驗證伺服器能正常啟動
   - 確認其他工具（如 `translate-file`）仍然正常運行

5. **提交階段**
   - 建立清晰的提交信息說明移除的工具
   - 推送到指定的分支

## 影響分析

### 受影響的工具
- ✅ `translate-file` - 不受影響（保留）
- ✅ `generate_locale_diff` - 不受影響（保留）
- ✅ `merge_translations` - 不受影響（保留）
- ✅ `cleanup_diff_directory` - 不受影響（保留）

### 向後相容性
- 移除這些工具將破壞依賴它們的外部客戶端
- 建議在發佈說明中清楚地文檔化此破壞性更改

## 測試計畫

1. **單元測試**
   - 確保移除代碼後沒有孤立的導入
   - 驗證 TypeScript 編譯成功

2. **集成測試**
   - 啟動 MCP 伺服器並驗證可用工具列表
   - 測試保留的工具仍然正常工作
   - 驗證沒有運行時錯誤

3. **構建驗證**
   - 運行 `npm run build` 確保編譯成功
   - 運行 `npm run typecheck` 確保沒有類型錯誤
   - 執行 `npm run start` 驗證伺服器可啟動

## 接受標準

- [x] 所有三個工具已從代碼庫中成功移除
- [x] 工具註冊已從 `mcp-tools.ts` 中移除
- [x] 沒有編譯錯誤或類型錯誤
- [x] 沒有運行時錯誤
- [x] 保留的工具仍然正常工作
- [x] 代碼已成功編譯和構建
- [x] 修改已提交到指定的分支

## 相關文件和參考

- MCP 工具註冊：`src/server/mcp-tools.ts`
- 工具實現：
  - `src/tools/git-commit-push.ts`
  - `src/tools/enhanced-translate-file.ts`
- 支持組件：`src/core/` 目錄下的各個模組
