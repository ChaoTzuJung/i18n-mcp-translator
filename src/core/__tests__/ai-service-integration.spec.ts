/**
 * BDD Integration Tests for AI Service
 *
 * Feature: Context-Aware i18n Key Generation
 * As a developer using the i18n MCP translator
 * I want the AI to generate hierarchical, context-aware i18n keys
 * So that my translations are organized and maintainable
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AiService } from '../ai-service.js';
import { ServerConfig } from '../../types/config.js';
import { TranslationConfig } from '../../types/i18n.js';

describe('Feature: Context-Aware i18n Key Generation (BDD)', () => {
  let aiService: AiService;
  let mockServerConfig: ServerConfig;
  let mockTranslationConfig: TranslationConfig;

  beforeEach(() => {
    mockServerConfig = {
      name: 'fever-admin-server',
      version: '1.0.0',
      translationDir: '/fever-admin/src/assets/locale',
      apiKey: 'test-api-key',
      projectRoot: '/fever-admin'
    };

    mockTranslationConfig = {
      sourceLanguage: 'zh-TW',
      targetLanguages: ['en-US', 'ja', 'th', 'es-419', 'pt-BR', 'zh-CN'],
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

  describe('Scenario: Developer edits AI Web Game configuration in Editor', () => {
    it('GIVEN I am in the Editor flow editing AI Web Game settings', async () => {
      // GIVEN: File location in editor/game_aiWebGame structure
      const filePath = '/fever-admin/src/editor/game_aiWebGame/SettingPanel/Panels/GameConfigPanel.jsx';

      // WHEN: I have a title text to translate
      const text = 'AI 網頁遊戲配置';
      const context = '<h2 className="config-title">AI 網頁遊戲配置</h2>';

      // Mock AI response
      const mockModel = (aiService as any).model;
      mockModel.generateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify({
            i18nKey: 'editor.aiWebGame.gameConfig.title',
            translations: {
              'zh-TW': 'AI 網頁遊戲配置',
              'en-US': 'AI Web Game Configuration',
              'ja': 'AIウェブゲーム設定',
              'th': 'การกำหนดค่าเกมเว็บ AI',
              'es-419': 'Configuración de juego web AI',
              'pt-BR': 'Configuração do jogo web AI',
              'zh-CN': 'AI 网页游戏配置'
            },
            originalText: 'AI 網頁遊戲配置'
          })
        }
      });

      // WHEN: AI processes the translation
      const result = await aiService.getAiSuggestions(text, context, filePath);

      // THEN: The key should start with "editor" namespace
      expect(result?.i18nKey).toMatch(/^editor\./);

      // AND: The key should include "aiWebGame" module
      expect(result?.i18nKey).toMatch(/\.aiWebGame\./);

      // AND: The key should include "gameConfig" component context
      expect(result?.i18nKey).toMatch(/\.gameConfig\./);

      // AND: The key should end with semantic "title"
      expect(result?.i18nKey).toMatch(/\.title$/);

      // AND: Translations should be provided for all target languages
      expect(result?.translations).toHaveProperty('zh-TW');
      expect(result?.translations).toHaveProperty('en-US');
      expect(result?.translations).toHaveProperty('ja');
      expect(result?.translations).toHaveProperty('th');

      // AND: The complete key should follow the pattern
      expect(result?.i18nKey).toBe('editor.aiWebGame.gameConfig.title');
    });

    it('WHEN I add a save button in the same component', async () => {
      // GIVEN: Same component, different element
      const filePath = '/fever-admin/src/editor/game_aiWebGame/SettingPanel/Panels/GameConfigPanel.jsx';
      const text = '保存設定';
      const context = '<Button variant="contained" onClick={handleSave}>保存設定</Button>';

      const mockModel = (aiService as any).model;
      mockModel.generateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify({
            i18nKey: 'editor.aiWebGame.gameConfig.saveSettings',
            translations: {
              'zh-TW': '保存設定',
              'en-US': 'Save Settings',
              'ja': '設定を保存',
              'th': 'บันทึกการตั้งค่า',
              'es-419': 'Guardar configuración',
              'pt-BR': 'Salvar configurações',
              'zh-CN': '保存设置'
            },
            originalText: '保存設定'
          })
        }
      });

      // WHEN: Processing button text
      const result = await aiService.getAiSuggestions(text, context, filePath);

      // THEN: Should use semantic name (saveSettings) instead of literal translation
      expect(result?.i18nKey).toMatch(/saveSettings/);
      expect(result?.i18nKey).not.toMatch(/save_settings/);

      // AND: Should use camelCase
      expect(result?.i18nKey).toMatch(/[a-z][A-Z]/);

      // AND: Should share same prefix as title
      expect(result?.i18nKey).toMatch(/^editor\.aiWebGame\.gameConfig\./);
    });
  });

  describe('Scenario: User interacts with Check-In game in Client', () => {
    it('GIVEN I am building a check-in card for the client flow', async () => {
      // GIVEN: File in client/game_checkIn structure
      const filePath = '/fever-admin/src/client/game_checkIn/CheckInCard.jsx';

      // WHEN: Displaying check-in button
      const text = '簽到';
      const context = '<button className="check-in-btn" onClick={handleCheckIn}>簽到</button>';

      const mockModel = (aiService as any).model;
      mockModel.generateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify({
            i18nKey: 'client.checkIn.card.checkIn',
            translations: {
              'zh-TW': '簽到',
              'en-US': 'Check In',
              'ja': 'チェックイン',
              'th': 'เช็คอิน',
              'es-419': 'Registrarse',
              'pt-BR': 'Fazer check-in',
              'zh-CN': '签到'
            },
            originalText: '簽到'
          })
        }
      });

      // WHEN: Processing the text
      const result = await aiService.getAiSuggestions(text, context, filePath);

      // THEN: Should use "client" namespace (not "editor")
      expect(result?.i18nKey).toMatch(/^client\./);

      // AND: Should include "checkIn" module
      expect(result?.i18nKey).toMatch(/\.checkIn\./);

      // AND: Should not have .button suffix (button is implicit from context)
      expect(result?.i18nKey).not.toMatch(/\.button$/);
    });

    it('WHEN I show check-in success message', async () => {
      const filePath = '/fever-admin/src/client/game_checkIn/CheckInCard.jsx';
      const text = '簽到成功';
      const context = '<span className="success-message">簽到成功</span>';

      const mockModel = (aiService as any).model;
      mockModel.generateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify({
            i18nKey: 'client.checkIn.card.success',
            translations: {
              'zh-TW': '簽到成功',
              'en-US': 'Check-in successful',
              'ja': 'チェックイン成功',
              'th': 'เช็คอินสำเร็จ',
              'es-419': 'Registro exitoso',
              'pt-BR': 'Check-in bem-sucedido',
              'zh-CN': '签到成功'
            },
            originalText: '簽到成功'
          })
        }
      });

      const result = await aiService.getAiSuggestions(text, context, filePath);

      // THEN: Should share the same prefix
      expect(result?.i18nKey).toMatch(/^client\.checkIn\.card\./);

      // AND: Should use semantic "success" instead of "check_in_success"
      expect(result?.i18nKey).toMatch(/success$/);
    });

    it('WHEN I show an error message', async () => {
      const filePath = '/fever-admin/src/client/game_checkIn/CheckInCard.jsx';
      const text = '您今日已經簽到過了';
      const context = '<FormHelperText error>您今日已經簽到過了</FormHelperText>';

      const mockModel = (aiService as any).model;
      mockModel.generateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify({
            i18nKey: 'client.checkIn.card.alreadyCheckedIn.error',
            translations: {
              'zh-TW': '您今日已經簽到過了',
              'en-US': 'You have already checked in today',
              'ja': '本日既にチェックイン済みです',
              'th': 'คุณได้เช็คอินวันนี้แล้ว',
              'es-419': 'Ya te has registrado hoy',
              'pt-BR': 'Você já fez check-in hoje',
              'zh-CN': '您今日已经签到过了'
            },
            originalText: '您今日已經簽到過了'
          })
        }
      });

      const result = await aiService.getAiSuggestions(text, context, filePath);

      // THEN: Should append .error suffix for error messages
      expect(result?.i18nKey).toMatch(/\.error$/);

      // AND: Should use meaningful semantic name
      expect(result?.i18nKey).toMatch(/alreadyCheckedIn/);
    });
  });

  describe('Scenario: Developer creates reusable UI components', () => {
    it('GIVEN I create a common Save button component', async () => {
      // GIVEN: Component in shared components directory
      const filePath = '/fever-admin/src/components/common/Button/SaveButton.jsx';
      const text = '保存';
      const context = '<Button variant="contained" color="primary">保存</Button>';

      const mockModel = (aiService as any).model;
      mockModel.generateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify({
            i18nKey: 'common.button.save',
            translations: {
              'zh-TW': '保存',
              'en-US': 'Save',
              'ja': '保存',
              'th': 'บันทึก',
              'es-419': 'Guardar',
              'pt-BR': 'Salvar',
              'zh-CN': '保存'
            },
            originalText: '保存'
          })
        }
      });

      // WHEN: Processing common button text
      const result = await aiService.getAiSuggestions(text, context, filePath);

      // THEN: Should use "common" namespace for reusable components
      expect(result?.i18nKey).toMatch(/^common\./);

      // AND: Should follow common.button.{action} pattern
      expect(result?.i18nKey).toBe('common.button.save');
    });

    it('WHEN I create a common Cancel button', async () => {
      const filePath = '/fever-admin/src/components/common/Button/CancelButton.jsx';
      const text = '取消';
      const context = '<Button onClick={onCancel}>取消</Button>';

      const mockModel = (aiService as any).model;
      mockModel.generateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify({
            i18nKey: 'common.button.cancel',
            translations: {
              'zh-TW': '取消',
              'en-US': 'Cancel',
              'ja': 'キャンセル',
              'th': 'ยกเลิก',
              'es-419': 'Cancelar',
              'pt-BR': 'Cancelar',
              'zh-CN': '取消'
            },
            originalText: '取消'
          })
        }
      });

      const result = await aiService.getAiSuggestions(text, context, filePath);

      // THEN: Should also use common.button pattern
      expect(result?.i18nKey).toBe('common.button.cancel');

      // AND: Both Save and Cancel buttons should share common.button prefix
      expect(result?.i18nKey).toMatch(/^common\.button\./);
    });

    it('WHEN I create a common confirmation dialog', async () => {
      const filePath = '/fever-admin/src/components/Dialog/ConfirmDialog.jsx';
      const text = '確認';
      const context = '<DialogActions><Button onClick={onConfirm}>確認</Button></DialogActions>';

      const mockModel = (aiService as any).model;
      mockModel.generateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify({
            i18nKey: 'common.dialog.confirm',
            translations: {
              'zh-TW': '確認',
              'en-US': 'Confirm',
              'ja': '確認',
              'th': 'ยืนยัน',
              'es-419': 'Confirmar',
              'pt-BR': 'Confirmar',
              'zh-CN': '确认'
            },
            originalText: '確認'
          })
        }
      });

      const result = await aiService.getAiSuggestions(text, context, filePath);

      // THEN: Should use common.dialog pattern
      expect(result?.i18nKey).toMatch(/^common\.dialog\./);
      expect(result?.i18nKey).toBe('common.dialog.confirm');
    });
  });

  describe('Scenario: Working with form inputs and placeholders', () => {
    it('GIVEN I add a date picker to a form', async () => {
      // GIVEN: Date picker in fever_form module
      const filePath = '/fever-admin/src/client/fever_form/FeverForm/DatePicker/index.jsx';
      const text = '請選擇日期';
      const context = '<TextField type="date" placeholder="請選擇日期" />';

      const mockModel = (aiService as any).model;
      mockModel.generateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify({
            i18nKey: 'client.feverForm.datePicker.placeholder',
            translations: {
              'zh-TW': '請選擇日期',
              'en-US': 'Please select date',
              'ja': '日付を選択してください',
              'th': 'กรุณาเลือกวันที่',
              'es-419': 'Por favor seleccione la fecha',
              'pt-BR': 'Por favor, selecione a data',
              'zh-CN': '请选择日期'
            },
            originalText: '請選擇日期'
          })
        }
      });

      // WHEN: Processing placeholder text
      const result = await aiService.getAiSuggestions(text, context, filePath);

      // THEN: Should include .placeholder suffix
      expect(result?.i18nKey).toMatch(/\.placeholder$/);

      // AND: Should convert fever_form to feverForm (camelCase)
      expect(result?.i18nKey).toMatch(/feverForm/);
      expect(result?.i18nKey).not.toMatch(/fever_form/);
    });

    it('WHEN I add validation error message', async () => {
      const filePath = '/fever-admin/src/client/fever_form/FeverForm/DatePicker/index.jsx';
      const text = '日期為必填';
      const context = '<FormHelperText error>日期為必填</FormHelperText>';

      const mockModel = (aiService as any).model;
      mockModel.generateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify({
            i18nKey: 'client.feverForm.datePicker.required.error',
            translations: {
              'zh-TW': '日期為必填',
              'en-US': 'Date is required',
              'ja': '日付は必須です',
              'th': 'ต้องระบุวันที่',
              'es-419': 'La fecha es obligatoria',
              'pt-BR': 'A data é obrigatória',
              'zh-CN': '日期为必填'
            },
            originalText: '日期為必填'
          })
        }
      });

      const result = await aiService.getAiSuggestions(text, context, filePath);

      // THEN: Should share same prefix as placeholder
      expect(result?.i18nKey).toMatch(/^client\.feverForm\.datePicker\./);

      // AND: Should include .error suffix
      expect(result?.i18nKey).toMatch(/\.error$/);
    });
  });

  describe('Scenario: Managing Prize configuration in Editor sidebar', () => {
    it('GIVEN I open Prize Info Dialog in Editor', async () => {
      // GIVEN: Prize management in Editor sidebar
      const filePath = '/fever-admin/src/editor/components/SideBar/Prize/Dialog/PrizeInfoDialog.jsx';
      const text = '獎品資訊';
      const context = '<DialogTitle>獎品資訊</DialogTitle>';

      const mockModel = (aiService as any).model;
      mockModel.generateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify({
            i18nKey: 'editor.prize.infoDialog.title',
            translations: {
              'zh-TW': '獎品資訊',
              'en-US': 'Prize Information',
              'ja': '賞品情報',
              'th': 'ข้อมูลรางวัล',
              'es-419': 'Información del premio',
              'pt-BR': 'Informações do prêmio',
              'zh-CN': '奖品信息'
            },
            originalText: '獎品資訊'
          })
        }
      });

      // WHEN: Processing dialog title
      const result = await aiService.getAiSuggestions(text, context, filePath);

      // THEN: Should extract "prize" as module from known modules list
      expect(result?.i18nKey).toMatch(/editor\.prize\./);

      // AND: Should include dialog component context
      expect(result?.i18nKey).toMatch(/\.infoDialog\./);
    });

    it('WHEN I add image upload button in the same dialog', async () => {
      const filePath = '/fever-admin/src/editor/components/SideBar/Prize/Dialog/PrizeInfoDialog.jsx';
      const text = '上傳圖片';
      const context = '<Button onClick={handleUpload} startIcon={<UploadIcon />}>上傳圖片</Button>';

      const mockModel = (aiService as any).model;
      mockModel.generateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify({
            i18nKey: 'editor.prize.infoDialog.uploadImage',
            translations: {
              'zh-TW': '上傳圖片',
              'en-US': 'Upload Image',
              'ja': '画像をアップロード',
              'th': 'อัปโหลดภาพ',
              'es-419': 'Subir imagen',
              'pt-BR': 'Enviar imagem',
              'zh-CN': '上传图片'
            },
            originalText: '上傳圖片'
          })
        }
      });

      const result = await aiService.getAiSuggestions(text, context, filePath);

      // THEN: Should use semantic "uploadImage" (meaning-based)
      expect(result?.i18nKey).toMatch(/uploadImage/);

      // AND: Should NOT use pinyin or literal translation
      expect(result?.i18nKey).not.toMatch(/shang_chuan/);
      expect(result?.i18nKey).not.toMatch(/upload_image/);
    });
  });

  describe('Scenario: Edge cases and consistency', () => {
    it('GIVEN deeply nested component structure', async () => {
      // GIVEN: Very deep nesting
      const filePath = '/fever-admin/src/editor/game_aiWebGame/components/SettingPanel/Advanced/Security/Auth/LoginForm/Fields/PasswordInput.jsx';
      const text = '密碼';
      const context = '<TextField type="password" label="密碼" />';

      const mockModel = (aiService as any).model;
      mockModel.generateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify({
            i18nKey: 'editor.aiWebGame.passwordInput.label',
            translations: {
              'zh-TW': '密碼',
              'en-US': 'Password',
              'ja': 'パスワード',
              'th': 'รหัสผ่าน',
              'es-419': 'Contraseña',
              'pt-BR': 'Senha',
              'zh-CN': '密码'
            },
            originalText: '密碼'
          })
        }
      });

      // WHEN: Processing with deep nesting
      const result = await aiService.getAiSuggestions(text, context, filePath);

      // THEN: Should not exceed 5 levels
      const keyParts = result?.i18nKey.split('.');
      expect(keyParts?.length).toBeLessThanOrEqual(5);

      // AND: Should still be meaningful and hierarchical
      expect(result?.i18nKey).toMatch(/^editor\.aiWebGame\./);
    });

    it('WHEN multiple similar components exist', async () => {
      const mockModel = (aiService as any).model;

      // Process Quiz title
      mockModel.generateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify({
            i18nKey: 'editor.quiz.title',
            translations: {
              'zh-TW': '測驗',
              'en-US': 'Quiz',
              'ja': 'クイズ',
              'th': 'แบบทดสอบ',
              'es-419': 'Cuestionario',
              'pt-BR': 'Questionário',
              'zh-CN': '测验'
            },
            originalText: '測驗'
          })
        }
      });

      const quizResult = await aiService.getAiSuggestions(
        '測驗',
        '<h2>測驗</h2>',
        '/fever-admin/src/editor/game_quiz/QuizPage.jsx'
      );

      // Process Vote title
      mockModel.generateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify({
            i18nKey: 'editor.vote.title',
            translations: {
              'zh-TW': '投票',
              'en-US': 'Vote',
              'ja': '投票',
              'th': 'โหวต',
              'es-419': 'Votar',
              'pt-BR': 'Votar',
              'zh-CN': '投票'
            },
            originalText: '投票'
          })
        }
      });

      const voteResult = await aiService.getAiSuggestions(
        '投票',
        '<h2>投票</h2>',
        '/fever-admin/src/editor/game_vote/VotePage.jsx'
      );

      // THEN: Both should follow consistent pattern
      expect(quizResult?.i18nKey).toMatch(/^editor\.\w+\.title$/);
      expect(voteResult?.i18nKey).toMatch(/^editor\.\w+\.title$/);
    });
  });
});
