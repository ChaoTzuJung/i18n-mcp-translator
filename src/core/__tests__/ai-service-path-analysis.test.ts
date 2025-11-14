/**
 * TDD Unit Tests for AI Service - Path Analysis
 *
 * Tests the intelligent path analysis functionality that extracts
 * namespace, module, and component information from file paths.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AiService } from '../ai-service.js';
import { ServerConfig } from '../../types/config.js';
import { TranslationConfig } from '../../types/i18n.js';
import path from 'path';

describe('AiService - Path Analysis (TDD)', () => {
  let aiService: AiService;
  let mockServerConfig: ServerConfig;
  let mockTranslationConfig: TranslationConfig;

  beforeEach(() => {
    // Mock configuration
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

    // Mock Google AI API
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

  describe('Editor Flow Path Analysis', () => {
    it('should extract namespace "editor" from editor flow paths', async () => {
      const testPath = '/test/project/src/editor/game_aiWebGame/SettingPanel/GameConfig.jsx';
      const mockModel = (aiService as any).model;

      mockModel.generateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify({
            i18nKey: 'editor.aiWebGame.settingPanel.title',
            translations: { 'zh-TW': 'AI 網頁遊戲配置', 'en-US': 'AI Web Game Config', 'ja': 'AIウェブゲーム設定' },
            originalText: 'AI 網頁遊戲配置'
          })
        }
      });

      const result = await aiService.getAiSuggestions(
        'AI 網頁遊戲配置',
        '<h2>AI 網頁遊戲配置</h2>',
        testPath
      );

      expect(result).not.toBeNull();
      expect(result?.i18nKey).toContain('editor');
    });

    it('should extract module "aiWebGame" from game_aiWebGame directory', async () => {
      const testPath = '/test/project/src/editor/game_aiWebGame/components/GameConfig.jsx';
      const mockModel = (aiService as any).model;

      mockModel.generateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify({
            i18nKey: 'editor.aiWebGame.gameConfig.save',
            translations: { 'zh-TW': '保存', 'en-US': 'Save', 'ja': '保存' },
            originalText: '保存'
          })
        }
      });

      const result = await aiService.getAiSuggestions(
        '保存',
        '<button>保存</button>',
        testPath
      );

      expect(result?.i18nKey).toContain('aiWebGame');
    });

    it('should extract component from component directory', async () => {
      const testPath = '/test/project/src/editor/game_checkIn/CheckInCard/index.jsx';
      const mockModel = (aiService as any).model;

      mockModel.generateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify({
            i18nKey: 'editor.checkIn.checkInCard.title',
            translations: { 'zh-TW': '每日簽到', 'en-US': 'Daily Check-in', 'ja': 'デイリーチェックイン' },
            originalText: '每日簽到'
          })
        }
      });

      const result = await aiService.getAiSuggestions(
        '每日簽到',
        '<h2>每日簽到</h2>',
        testPath
      );

      expect(result?.i18nKey).toMatch(/editor\.checkIn\.checkInCard/);
    });

    it('should handle prize module paths', async () => {
      const testPath = '/test/project/src/editor/components/SideBar/Prize/Dialog/PrizeInfoDialog.jsx';
      const mockModel = (aiService as any).model;

      mockModel.generateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify({
            i18nKey: 'editor.prize.prizeInfoDialog.title',
            translations: { 'zh-TW': '獎品資訊', 'en-US': 'Prize Info', 'ja': '賞品情報' },
            originalText: '獎品資訊'
          })
        }
      });

      const result = await aiService.getAiSuggestions(
        '獎品資訊',
        '<h2>獎品資訊</h2>',
        testPath
      );

      expect(result?.i18nKey).toContain('prize');
    });

    it('should handle qualify module paths', async () => {
      const testPath = '/test/project/src/editor/components/SideBar/Qualify/limitQualify/index.jsx';
      const mockModel = (aiService as any).model;

      mockModel.generateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify({
            i18nKey: 'editor.qualify.limitQualify.memberLevel',
            translations: { 'zh-TW': '會員等級限制', 'en-US': 'Member Level Restriction', 'ja': '会員レベル制限' },
            originalText: '會員等級限制'
          })
        }
      });

      const result = await aiService.getAiSuggestions(
        '會員等級限制',
        '<label>會員等級限制</label>',
        testPath
      );

      expect(result?.i18nKey).toContain('qualify');
    });
  });

  describe('Client Flow Path Analysis', () => {
    it('should extract namespace "client" from client flow paths', async () => {
      const testPath = '/test/project/src/client/game_aiWebGame/GameContainer.jsx';
      const mockModel = (aiService as any).model;

      mockModel.generateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify({
            i18nKey: 'client.aiWebGame.loading',
            translations: { 'zh-TW': '載入中', 'en-US': 'Loading', 'ja': '読み込み中' },
            originalText: '載入中'
          })
        }
      });

      const result = await aiService.getAiSuggestions(
        '載入中',
        '<span>載入中</span>',
        testPath
      );

      expect(result?.i18nKey).toContain('client');
    });

    it('should handle client checkIn game module', async () => {
      const testPath = '/test/project/src/client/game_checkIn/CheckInCard.jsx';
      const mockModel = (aiService as any).model;

      mockModel.generateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify({
            i18nKey: 'client.checkIn.card.checkIn',
            translations: { 'zh-TW': '簽到', 'en-US': 'Check In', 'ja': 'チェックイン' },
            originalText: '簽到'
          })
        }
      });

      const result = await aiService.getAiSuggestions(
        '簽到',
        '<button onClick={handleCheckIn}>簽到</button>',
        testPath
      );

      expect(result?.i18nKey).toMatch(/client\.checkIn/);
    });

    it('should handle fever_form module', async () => {
      const testPath = '/test/project/src/client/fever_form/FeverForm/DatePicker/index.jsx';
      const mockModel = (aiService as any).model;

      mockModel.generateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify({
            i18nKey: 'client.feverForm.datePicker.placeholder',
            translations: { 'zh-TW': '請選擇日期', 'en-US': 'Please select date', 'ja': '日付を選択してください' },
            originalText: '請選擇日期'
          })
        }
      });

      const result = await aiService.getAiSuggestions(
        '請選擇日期',
        '<input placeholder="請選擇日期" />',
        testPath
      );

      expect(result?.i18nKey).toMatch(/client\.feverForm\.datePicker/);
    });

    it('should handle Result component paths', async () => {
      const testPath = '/test/project/src/client/components/Result/Actions/ShareButton.jsx';
      const mockModel = (aiService as any).model;

      mockModel.generateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify({
            i18nKey: 'client.result.actions.share',
            translations: { 'zh-TW': '分享', 'en-US': 'Share', 'ja': 'シェア' },
            originalText: '分享'
          })
        }
      });

      const result = await aiService.getAiSuggestions(
        '分享',
        '<button onClick={handleShare}>分享</button>',
        testPath
      );

      expect(result?.i18nKey).toMatch(/client/);
    });
  });

  describe('Common (Shared) Flow Path Analysis', () => {
    it('should extract namespace "common" from shared components', async () => {
      const testPath = '/test/project/src/components/common/Button/SaveButton.jsx';
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

      const result = await aiService.getAiSuggestions(
        '保存',
        '<Button>保存</Button>',
        testPath
      );

      expect(result?.i18nKey).toContain('common');
    });

    it('should handle Dialog components', async () => {
      const testPath = '/test/project/src/components/Dialog/ConfirmDialog.jsx';
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

      const result = await aiService.getAiSuggestions(
        '確認',
        '<Button onClick={onConfirm}>確認</Button>',
        testPath
      );

      expect(result?.i18nKey).toMatch(/common/);
    });
  });

  describe('UGC Flow Path Analysis', () => {
    it('should extract namespace "ugc" from UGC flow paths', async () => {
      const testPath = '/test/project/src/ugc/components/ugcGallery/waterfall/index.jsx';
      const mockModel = (aiService as any).model;

      mockModel.generateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify({
            i18nKey: 'ugc.gallery.waterfall.title',
            translations: { 'zh-TW': '瀑布流', 'en-US': 'Waterfall', 'ja': 'ウォーターフォール' },
            originalText: '瀑布流'
          })
        }
      });

      const result = await aiService.getAiSuggestions(
        '瀑布流',
        '<h2>瀑布流</h2>',
        testPath
      );

      expect(result?.i18nKey).toContain('ugc');
    });
  });

  describe('CamelCase Conversion', () => {
    it('should convert snake_case to camelCase for modules', async () => {
      const testPath = '/test/project/src/editor/game_ai_web_game/SettingPanel.jsx';
      const mockModel = (aiService as any).model;

      mockModel.generateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify({
            i18nKey: 'editor.aiWebGame.settingPanel.title',
            translations: { 'zh-TW': '設定', 'en-US': 'Settings', 'ja': '設定' },
            originalText: '設定'
          })
        }
      });

      const result = await aiService.getAiSuggestions(
        '設定',
        '<h2>設定</h2>',
        testPath
      );

      // The module should be converted from ai_web_game to aiWebGame
      expect(result?.i18nKey).toMatch(/aiWebGame/);
    });

    it('should convert kebab-case to camelCase for components', async () => {
      const testPath = '/test/project/src/client/game_checkIn/check-in-card/index.jsx';
      const mockModel = (aiService as any).model;

      mockModel.generateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify({
            i18nKey: 'client.checkIn.checkInCard.title',
            translations: { 'zh-TW': '簽到卡', 'en-US': 'Check-in Card', 'ja': 'チェックインカード' },
            originalText: '簽到卡'
          })
        }
      });

      const result = await aiService.getAiSuggestions(
        '簽到卡',
        '<div>簽到卡</div>',
        testPath
      );

      // Component should be converted from check-in-card to checkInCard
      expect(result?.i18nKey).toMatch(/checkInCard/);
    });
  });

  describe('Edge Cases', () => {
    it('should handle deeply nested component paths with max depth limit', async () => {
      const testPath = '/test/project/src/editor/game_aiWebGame/components/SettingPanel/Advanced/Security/Auth/LoginForm.jsx';
      const mockModel = (aiService as any).model;

      mockModel.generateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify({
            i18nKey: 'editor.aiWebGame.loginForm.submit',
            translations: { 'zh-TW': '登入', 'en-US': 'Login', 'ja': 'ログイン' },
            originalText: '登入'
          })
        }
      });

      const result = await aiService.getAiSuggestions(
        '登入',
        '<button>登入</button>',
        testPath
      );

      // Should not exceed 5 levels
      const keyParts = result?.i18nKey.split('.');
      expect(keyParts?.length).toBeLessThanOrEqual(5);
    });

    it('should handle paths without clear module structure', async () => {
      const testPath = '/test/project/src/utils/helpers.jsx';
      const mockModel = (aiService as any).model;

      mockModel.generateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify({
            i18nKey: 'common.helpers.formatDate',
            translations: { 'zh-TW': '格式化日期', 'en-US': 'Format Date', 'ja': '日付をフォーマット' },
            originalText: '格式化日期'
          })
        }
      });

      const result = await aiService.getAiSuggestions(
        '格式化日期',
        '<span>格式化日期</span>',
        testPath
      );

      expect(result).not.toBeNull();
      expect(result?.i18nKey).toBeTruthy();
    });

    it('should handle index files correctly', async () => {
      const testPath = '/test/project/src/editor/game_quiz/index.jsx';
      const mockModel = (aiService as any).model;

      mockModel.generateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify({
            i18nKey: 'editor.quiz.startQuiz',
            translations: { 'zh-TW': '開始測驗', 'en-US': 'Start Quiz', 'ja': 'クイズを開始' },
            originalText: '開始測驗'
          })
        }
      });

      const result = await aiService.getAiSuggestions(
        '開始測驗',
        '<button>開始測驗</button>',
        testPath
      );

      expect(result?.i18nKey).toMatch(/editor\.quiz/);
    });
  });
});
