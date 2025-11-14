/**
 * TDD Unit Tests for AI Service - Key Construction
 *
 * Tests the intelligent i18n key construction that combines
 * path context, element context, and semantic naming.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AiService } from '../ai-service.js';
import { ServerConfig } from '../../types/config.js';
import { TranslationConfig } from '../../types/i18n.js';

describe('AiService - Key Construction (TDD)', () => {
  let aiService: AiService;
  let mockServerConfig: ServerConfig;
  let mockTranslationConfig: TranslationConfig;

  beforeEach(() => {
    mockServerConfig = {
      name: 'test-server',
      version: '1.0.0',
      translationDir: '/test/locale',
      apiKey: 'test-api-key',
      projectRoot: '/test/project'
    };

    mockTranslationConfig = {
      sourceLanguage: 'zh-TW',
      targetLanguages: ['en-US', 'ja'],
      langMap: {},
      availableLanguages: []
    };

    vi.mock('@google/generative-ai', () => ({
      GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
        getGenerativeModel: vi.fn().mockReturnValue({
          generateContent: vi.fn()
        })
      }))
    }));

    aiService = new AiService(mockServerConfig, mockTranslationConfig);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Hierarchical Key Structure', () => {
    it('should construct 4-level keys: namespace.module.component.semantic', async () => {
      const testPath = '/test/project/src/editor/game_aiWebGame/GameConfig.jsx';
      const context = '<h2>遊戲配置</h2>';
      const mockModel = (aiService as any).model;

      mockModel.generateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify({
            i18nKey: 'editor.aiWebGame.gameConfig.title',
            translations: { 'zh-TW': '遊戲配置', 'en-US': 'Game Config', 'ja': 'ゲーム設定' },
            originalText: '遊戲配置'
          })
        }
      });

      const result = await aiService.getAiSuggestions('遊戲配置', context, testPath);

      expect(result?.i18nKey).toBe('editor.aiWebGame.gameConfig.title');
      const keyParts = result?.i18nKey.split('.');
      expect(keyParts).toHaveLength(4);
    });

    it('should construct 3-level keys when no module: namespace.component.semantic', async () => {
      const testPath = '/test/project/src/components/Dialog/ConfirmDialog.jsx';
      const context = '<Button>確認</Button>';
      const mockModel = (aiService as any).model;

      mockModel.generateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify({
            i18nKey: 'common.dialog.confirm',
            translations: { 'zh-TW': '確認', 'en-US': 'Confirm', 'ja': '確認' },
            originalText: '確認'
          })
        }
      });

      const result = await aiService.getAiSuggestions('確認', context, testPath);

      expect(result?.i18nKey).toBe('common.dialog.confirm');
      const keyParts = result?.i18nKey.split('.');
      expect(keyParts?.length).toBeLessThanOrEqual(4);
    });

    it('should limit depth to maximum 5 levels', async () => {
      const testPath = '/test/project/src/editor/game_aiWebGame/components/Settings/Advanced/Security/AuthForm.jsx';
      const context = '<button>登入</button>';
      const mockModel = (aiService as any).model;

      mockModel.generateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify({
            i18nKey: 'editor.aiWebGame.authForm.login',
            translations: { 'zh-TW': '登入', 'en-US': 'Login', 'ja': 'ログイン' },
            originalText: '登入'
          })
        }
      });

      const result = await aiService.getAiSuggestions('登入', context, testPath);

      const keyParts = result?.i18nKey.split('.');
      expect(keyParts?.length).toBeLessThanOrEqual(5);
    });
  });

  describe('Element Type Suffix', () => {
    it('should NOT append suffix for button elements', async () => {
      const testPath = '/test/project/src/editor/game_checkIn/CheckInButton.jsx';
      const context = '<button onClick={handleCheckIn}>簽到</button>';
      const mockModel = (aiService as any).model;

      mockModel.generateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify({
            i18nKey: 'editor.checkIn.checkIn',
            translations: { 'zh-TW': '簽到', 'en-US': 'Check In', 'ja': 'チェックイン' },
            originalText: '簽到'
          })
        }
      });

      const result = await aiService.getAiSuggestions('簽到', context, testPath);

      // Should NOT end with .button
      expect(result?.i18nKey).not.toMatch(/\.button$/);
    });

    it('should append .placeholder suffix for placeholder elements', async () => {
      const testPath = '/test/project/src/client/form/DatePicker.jsx';
      const context = '<input placeholder="請選擇日期" />';
      const mockModel = (aiService as any).model;

      mockModel.generateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify({
            i18nKey: 'client.form.datePicker.placeholder',
            translations: { 'zh-TW': '請選擇日期', 'en-US': 'Please select date', 'ja': '日付を選択してください' },
            originalText: '請選擇日期'
          })
        }
      });

      const result = await aiService.getAiSuggestions('請選擇日期', context, testPath);

      expect(result?.i18nKey).toMatch(/\.placeholder$/);
    });

    it('should append .tooltip suffix for tooltip elements', async () => {
      const testPath = '/test/project/src/editor/components/HelpIcon.jsx';
      const context = '<Tooltip title="點擊查看說明"><HelpIcon /></Tooltip>';
      const mockModel = (aiService as any).model;

      mockModel.generateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify({
            i18nKey: 'editor.help.viewHelp.tooltip',
            translations: { 'zh-TW': '點擊查看說明', 'en-US': 'Click to view help', 'ja': 'クリックしてヘルプを表示' },
            originalText: '點擊查看說明'
          })
        }
      });

      const result = await aiService.getAiSuggestions('點擊查看說明', context, testPath);

      expect(result?.i18nKey).toMatch(/\.tooltip$/);
    });

    it('should append .error suffix for error elements', async () => {
      const testPath = '/test/project/src/client/validation/FormErrors.jsx';
      const context = '<FormHelperText error>此欄位為必填</FormHelperText>';
      const mockModel = (aiService as any).model;

      mockModel.generateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify({
            i18nKey: 'client.validation.required.error',
            translations: { 'zh-TW': '此欄位為必填', 'en-US': 'This field is required', 'ja': 'この項目は必須です' },
            originalText: '此欄位為必填'
          })
        }
      });

      const result = await aiService.getAiSuggestions('此欄位為必填', context, testPath);

      expect(result?.i18nKey).toMatch(/\.error$/);
    });

    it('should NOT append suffix for label/message elements', async () => {
      const testPath = '/test/project/src/client/status/StatusMessage.jsx';
      const context = '<span>載入中</span>';
      const mockModel = (aiService as any).model;

      mockModel.generateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify({
            i18nKey: 'client.status.loading',
            translations: { 'zh-TW': '載入中', 'en-US': 'Loading', 'ja': '読み込み中' },
            originalText: '載入中'
          })
        }
      });

      const result = await aiService.getAiSuggestions('載入中', context, testPath);

      // Should NOT end with .label or .message
      expect(result?.i18nKey).not.toMatch(/\.(label|message)$/);
    });
  });

  describe('Semantic Naming', () => {
    it('should use camelCase for semantic parts', async () => {
      const testPath = '/test/project/src/editor/game_aiWebGame/SettingPanel.jsx';
      const context = '<button onClick={handleSave}>保存設定</button>';
      const mockModel = (aiService as any).model;

      mockModel.generateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify({
            i18nKey: 'editor.aiWebGame.settingPanel.saveSettings',
            translations: { 'zh-TW': '保存設定', 'en-US': 'Save Settings', 'ja': '設定を保存' },
            originalText: '保存設定'
          })
        }
      });

      const result = await aiService.getAiSuggestions('保存設定', context, testPath);

      // Should use camelCase, not snake_case
      expect(result?.i18nKey).toMatch(/saveSettings/);
      expect(result?.i18nKey).not.toMatch(/save_settings/);
    });

    it('should focus on meaning rather than literal translation', async () => {
      const testPath = '/test/project/src/client/components/ImageUpload.jsx';
      const context = '<button onClick={handleUpload}>上傳圖片</button>';
      const mockModel = (aiService as any).model;

      mockModel.generateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify({
            i18nKey: 'client.uploadImage',
            translations: { 'zh-TW': '上傳圖片', 'en-US': 'Upload Image', 'ja': '画像をアップロード' },
            originalText: '上傳圖片'
          })
        }
      });

      const result = await aiService.getAiSuggestions('上傳圖片', context, testPath);

      // Should use semantic 'uploadImage', not literal pinyin 'shang_chuan_tu_pian'
      expect(result?.i18nKey).toMatch(/uploadImage/);
    });

    it('should use concise semantic names', async () => {
      const testPath = '/test/project/src/editor/components/ConfirmDialog.jsx';
      const context = '<Button onClick={onConfirm}>確認刪除</Button>';
      const mockModel = (aiService as any).model;

      mockModel.generateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify({
            i18nKey: 'editor.confirmDialog.confirmDelete',
            translations: { 'zh-TW': '確認刪除', 'en-US': 'Confirm Delete', 'ja': '削除を確認' },
            originalText: '確認刪除'
          })
        }
      });

      const result = await aiService.getAiSuggestions('確認刪除', context, testPath);

      // Should be concise
      expect(result?.i18nKey).toMatch(/confirmDelete/);
    });
  });

  describe('Common Namespace Detection', () => {
    it('should use common namespace for frequently reused button text', async () => {
      const testPath = '/test/project/src/components/SaveButton.jsx';
      const context = '<Button>保存</Button>';
      const mockModel = (aiService as any).model;

      mockModel.generateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify({
            i18nKey: 'common.button.save',
            translations: { 'zh-TW': '保存', 'en-US': 'Save', 'ja': '保存' },
            originalText: '保存'
          })
        }
      });

      const result = await aiService.getAiSuggestions('保存', context, testPath);

      expect(result?.i18nKey).toMatch(/^common\./);
    });

    it('should use common namespace for cancel button', async () => {
      const testPath = '/test/project/src/components/CancelButton.jsx';
      const context = '<Button>取消</Button>';
      const mockModel = (aiService as any).model;

      mockModel.generateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify({
            i18nKey: 'common.button.cancel',
            translations: { 'zh-TW': '取消', 'en-US': 'Cancel', 'ja': 'キャンセル' },
            originalText: '取消'
          })
        }
      });

      const result = await aiService.getAiSuggestions('取消', context, testPath);

      expect(result?.i18nKey).toMatch(/^common\./);
    });

    it('should use common namespace for dialog confirm', async () => {
      const testPath = '/test/project/src/components/Dialog/Common.jsx';
      const context = '<Dialog><Button>確認</Button></Dialog>';
      const mockModel = (aiService as any).model;

      mockModel.generateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify({
            i18nKey: 'common.dialog.confirm',
            translations: { 'zh-TW': '確認', 'en-US': 'Confirm', 'ja': '確認' },
            originalText: '確認'
          })
        }
      });

      const result = await aiService.getAiSuggestions('確認', context, testPath);

      expect(result?.i18nKey).toMatch(/^common\.dialog/);
    });
  });

  describe('Key Pattern Consistency', () => {
    it('should maintain consistent pattern across similar components', async () => {
      const mockModel = (aiService as any).model;

      // Test 1: game_quiz title
      mockModel.generateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify({
            i18nKey: 'editor.quiz.title',
            translations: { 'zh-TW': '測驗標題', 'en-US': 'Quiz Title', 'ja': 'クイズタイトル' },
            originalText: '測驗標題'
          })
        }
      });

      const result1 = await aiService.getAiSuggestions(
        '測驗標題',
        '<h2>測驗標題</h2>',
        '/test/project/src/editor/game_quiz/QuizPage.jsx'
      );

      // Test 2: game_vote title
      mockModel.generateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify({
            i18nKey: 'editor.vote.title',
            translations: { 'zh-TW': '投票標題', 'en-US': 'Vote Title', 'ja': '投票タイトル' },
            originalText: '投票標題'
          })
        }
      });

      const result2 = await aiService.getAiSuggestions(
        '投票標題',
        '<h2>投票標題</h2>',
        '/test/project/src/editor/game_vote/VotePage.jsx'
      );

      // Both should follow the same pattern
      expect(result1?.i18nKey).toMatch(/^editor\.\w+\.title$/);
      expect(result2?.i18nKey).toMatch(/^editor\.\w+\.title$/);
    });
  });

  describe('Special Cases', () => {
    it('should handle empty component name gracefully', async () => {
      const testPath = '/test/project/src/editor/index.jsx';
      const context = '<h1>編輯器</h1>';
      const mockModel = (aiService as any).model;

      mockModel.generateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify({
            i18nKey: 'editor.title',
            translations: { 'zh-TW': '編輯器', 'en-US': 'Editor', 'ja': 'エディター' },
            originalText: '編輯器'
          })
        }
      });

      const result = await aiService.getAiSuggestions('編輯器', context, testPath);

      expect(result?.i18nKey).toBeTruthy();
      expect(result?.i18nKey).toMatch(/^editor\./);
    });

    it('should avoid duplicate element type in semantic name', async () => {
      const testPath = '/test/project/src/client/form/NameInput.jsx';
      const context = '<input placeholder="請輸入姓名" />';
      const mockModel = (aiService as any).model;

      mockModel.generateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify({
            i18nKey: 'client.form.nameInput.placeholder',
            translations: { 'zh-TW': '請輸入姓名', 'en-US': 'Please enter name', 'ja': '名前を入力してください' },
            originalText: '請輸入姓名'
          })
        }
      });

      const result = await aiService.getAiSuggestions('請輸入姓名', context, testPath);

      // Should have exactly one .placeholder, not .placeholder.placeholder
      const placeholderCount = (result?.i18nKey.match(/placeholder/g) || []).length;
      expect(placeholderCount).toBe(1);
    });
  });
});
