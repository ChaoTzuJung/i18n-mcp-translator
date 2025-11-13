/**
 * TDD Unit Tests for AI Service - Element Context Detection
 *
 * Tests the element type detection from code context,
 * which helps generate appropriate i18n key suffixes.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AiService } from '../ai-service.js';
import { ServerConfig } from '../../types/config.js';
import { TranslationConfig } from '../../types/i18n.js';

describe('AiService - Element Context Detection (TDD)', () => {
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
      targetLanguages: ['en-US'],
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

  describe('Button Detection', () => {
    it('should detect button from <button> tag', async () => {
      const testPath = '/test/project/src/editor/test.jsx';
      const context = '<button onClick={handleSave}>保存</button>';
      const mockModel = (aiService as any).model;

      mockModel.generateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify({
            i18nKey: 'editor.save',
            translations: { 'zh-TW': '保存', 'en-US': 'Save' },
            originalText: '保存'
          })
        }
      });

      await aiService.getAiSuggestions('保存', context, testPath);

      // Verify the context was analyzed (element type: button)
      const call = mockModel.generateContent.mock.calls[0][0];
      expect(call).toContain('Element Type: button');
    });

    it('should detect button from Material-UI Button with variant', async () => {
      const testPath = '/test/project/src/editor/test.jsx';
      const context = '<Button variant="contained" onClick={handleSubmit}>提交</Button>';
      const mockModel = (aiService as any).model;

      mockModel.generateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify({
            i18nKey: 'editor.submit',
            translations: { 'zh-TW': '提交', 'en-US': 'Submit' },
            originalText: '提交'
          })
        }
      });

      await aiService.getAiSuggestions('提交', context, testPath);

      const call = mockModel.generateContent.mock.calls[0][0];
      expect(call).toContain('Element Type: button');
    });

    it('should detect button from onClick handler', async () => {
      const testPath = '/test/project/src/client/test.jsx';
      const context = '<div onClick={handleClick}>點擊我</div>';
      const mockModel = (aiService as any).model;

      mockModel.generateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify({
            i18nKey: 'client.clickMe',
            translations: { 'zh-TW': '點擊我', 'en-US': 'Click Me' },
            originalText: '點擊我'
          })
        }
      });

      await aiService.getAiSuggestions('點擊我', context, testPath);

      const call = mockModel.generateContent.mock.calls[0][0];
      expect(call).toContain('Element Type: button');
    });
  });

  describe('Title/Heading Detection', () => {
    it('should detect title from <h1> tag', async () => {
      const testPath = '/test/project/src/editor/test.jsx';
      const context = '<h1>AI 網頁遊戲</h1>';
      const mockModel = (aiService as any).model;

      mockModel.generateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify({
            i18nKey: 'editor.title',
            translations: { 'zh-TW': 'AI 網頁遊戲', 'en-US': 'AI Web Game' },
            originalText: 'AI 網頁遊戲'
          })
        }
      });

      await aiService.getAiSuggestions('AI 網頁遊戲', context, testPath);

      const call = mockModel.generateContent.mock.calls[0][0];
      expect(call).toContain('Element Type: title');
    });

    it('should detect title from <h2> tag', async () => {
      const testPath = '/test/project/src/editor/test.jsx';
      const context = '<h2>遊戲設定</h2>';
      const mockModel = (aiService as any).model;

      mockModel.generateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify({
            i18nKey: 'editor.gameSettings.title',
            translations: { 'zh-TW': '遊戲設定', 'en-US': 'Game Settings' },
            originalText: '遊戲設定'
          })
        }
      });

      await aiService.getAiSuggestions('遊戲設定', context, testPath);

      const call = mockModel.generateContent.mock.calls[0][0];
      expect(call).toContain('Element Type: title');
    });

    it('should detect title from Typography variant="h1"', async () => {
      const testPath = '/test/project/src/editor/test.jsx';
      const context = '<Typography variant="h1">標題</Typography>';
      const mockModel = (aiService as any).model;

      mockModel.generateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify({
            i18nKey: 'editor.heading',
            translations: { 'zh-TW': '標題', 'en-US': 'Title' },
            originalText: '標題'
          })
        }
      });

      await aiService.getAiSuggestions('標題', context, testPath);

      const call = mockModel.generateContent.mock.calls[0][0];
      expect(call).toContain('Element Type: title');
    });
  });

  describe('Placeholder Detection', () => {
    it('should detect placeholder from input placeholder attribute', async () => {
      const testPath = '/test/project/src/client/test.jsx';
      const context = '<input placeholder="請輸入姓名" />';
      const mockModel = (aiService as any).model;

      mockModel.generateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify({
            i18nKey: 'client.form.name.placeholder',
            translations: { 'zh-TW': '請輸入姓名', 'en-US': 'Please enter name' },
            originalText: '請輸入姓名'
          })
        }
      });

      await aiService.getAiSuggestions('請輸入姓名', context, testPath);

      const call = mockModel.generateContent.mock.calls[0][0];
      expect(call).toContain('Element Type: placeholder');
    });

    it('should detect placeholder from TextField placeholder prop', async () => {
      const testPath = '/test/project/src/editor/test.jsx';
      const context = '<TextField placeholder="請選擇日期" />';
      const mockModel = (aiService as any).model;

      mockModel.generateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify({
            i18nKey: 'editor.form.date.placeholder',
            translations: { 'zh-TW': '請選擇日期', 'en-US': 'Please select date' },
            originalText: '請選擇日期'
          })
        }
      });

      await aiService.getAiSuggestions('請選擇日期', context, testPath);

      const call = mockModel.generateContent.mock.calls[0][0];
      expect(call).toContain('Element Type: placeholder');
    });
  });

  describe('Tooltip Detection', () => {
    it('should detect tooltip from tooltip attribute', async () => {
      const testPath = '/test/project/src/editor/test.jsx';
      const context = '<IconButton tooltip="刪除此項目"><DeleteIcon /></IconButton>';
      const mockModel = (aiService as any).model;

      mockModel.generateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify({
            i18nKey: 'editor.delete.tooltip',
            translations: { 'zh-TW': '刪除此項目', 'en-US': 'Delete this item' },
            originalText: '刪除此項目'
          })
        }
      });

      await aiService.getAiSuggestions('刪除此項目', context, testPath);

      const call = mockModel.generateContent.mock.calls[0][0];
      expect(call).toContain('Element Type: tooltip');
    });

    it('should detect tooltip from Tooltip component', async () => {
      const testPath = '/test/project/src/client/test.jsx';
      const context = '<Tooltip title="更多資訊"><InfoIcon /></Tooltip>';
      const mockModel = (aiService as any).model;

      mockModel.generateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify({
            i18nKey: 'client.moreInfo.tooltip',
            translations: { 'zh-TW': '更多資訊', 'en-US': 'More info' },
            originalText: '更多資訊'
          })
        }
      });

      await aiService.getAiSuggestions('更多資訊', context, testPath);

      const call = mockModel.generateContent.mock.calls[0][0];
      expect(call).toContain('Element Type: tooltip');
    });
  });

  describe('Error Message Detection', () => {
    it('should detect error from error keyword in context', async () => {
      const testPath = '/test/project/src/client/test.jsx';
      const context = '<span className="error">載入失敗</span>';
      const mockModel = (aiService as any).model;

      mockModel.generateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify({
            i18nKey: 'client.loadFailed.error',
            translations: { 'zh-TW': '載入失敗', 'en-US': 'Load failed' },
            originalText: '載入失敗'
          })
        }
      });

      await aiService.getAiSuggestions('載入失敗', context, testPath);

      const call = mockModel.generateContent.mock.calls[0][0];
      expect(call).toContain('Element Type: error');
    });

    it('should detect error from FormHelperText with error variant', async () => {
      const testPath = '/test/project/src/editor/test.jsx';
      const context = '<FormHelperText error>此欄位為必填</FormHelperText>';
      const mockModel = (aiService as any).model;

      mockModel.generateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify({
            i18nKey: 'editor.validation.required.error',
            translations: { 'zh-TW': '此欄位為必填', 'en-US': 'This field is required' },
            originalText: '此欄位為必填'
          })
        }
      });

      await aiService.getAiSuggestions('此欄位為必填', context, testPath);

      const call = mockModel.generateContent.mock.calls[0][0];
      expect(call).toContain('Element Type: error');
    });

    it('should detect error from invalid keyword', async () => {
      const testPath = '/test/project/src/client/test.jsx';
      const context = '<TextField helperText="無效的電子郵件" invalid />';
      const mockModel = (aiService as any).model;

      mockModel.generateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify({
            i18nKey: 'client.validation.emailInvalid.error',
            translations: { 'zh-TW': '無效的電子郵件', 'en-US': 'Invalid email' },
            originalText: '無效的電子郵件'
          })
        }
      });

      await aiService.getAiSuggestions('無效的電子郵件', context, testPath);

      const call = mockModel.generateContent.mock.calls[0][0];
      expect(call).toContain('Element Type: error');
    });
  });

  describe('Description Detection', () => {
    it('should detect description from Typography variant="body2"', async () => {
      const testPath = '/test/project/src/editor/test.jsx';
      const context = '<Typography variant="body2">這是遊戲說明</Typography>';
      const mockModel = (aiService as any).model;

      mockModel.generateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify({
            i18nKey: 'editor.game.description',
            translations: { 'zh-TW': '這是遊戲說明', 'en-US': 'This is game description' },
            originalText: '這是遊戲說明'
          })
        }
      });

      await aiService.getAiSuggestions('這是遊戲說明', context, testPath);

      const call = mockModel.generateContent.mock.calls[0][0];
      expect(call).toContain('Element Type: description');
    });

    it('should detect description from subtitle variant', async () => {
      const testPath = '/test/project/src/client/test.jsx';
      const context = '<Typography variant="subtitle">副標題</Typography>';
      const mockModel = (aiService as any).model;

      mockModel.generateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify({
            i18nKey: 'client.subtitle.description',
            translations: { 'zh-TW': '副標題', 'en-US': 'Subtitle' },
            originalText: '副標題'
          })
        }
      });

      await aiService.getAiSuggestions('副標題', context, testPath);

      const call = mockModel.generateContent.mock.calls[0][0];
      expect(call).toContain('Element Type: description');
    });
  });

  describe('Label Detection (Default)', () => {
    it('should default to label for generic span', async () => {
      const testPath = '/test/project/src/editor/test.jsx';
      const context = '<span>一般文字</span>';
      const mockModel = (aiService as any).model;

      mockModel.generateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify({
            i18nKey: 'editor.generalText',
            translations: { 'zh-TW': '一般文字', 'en-US': 'General text' },
            originalText: '一般文字'
          })
        }
      });

      await aiService.getAiSuggestions('一般文字', context, testPath);

      const call = mockModel.generateContent.mock.calls[0][0];
      expect(call).toContain('Element Type: label');
    });

    it('should default to label for div with text', async () => {
      const testPath = '/test/project/src/client/test.jsx';
      const context = '<div className="text">顯示文字</div>';
      const mockModel = (aiService as any).model;

      mockModel.generateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify({
            i18nKey: 'client.displayText',
            translations: { 'zh-TW': '顯示文字', 'en-US': 'Display text' },
            originalText: '顯示文字'
          })
        }
      });

      await aiService.getAiSuggestions('顯示文字', context, testPath);

      const call = mockModel.generateContent.mock.calls[0][0];
      expect(call).toContain('Element Type: label');
    });

    it('should default to label for paragraph tag', async () => {
      const testPath = '/test/project/src/editor/test.jsx';
      const context = '<p>段落內容</p>';
      const mockModel = (aiService as any).model;

      mockModel.generateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify({
            i18nKey: 'editor.paragraphContent',
            translations: { 'zh-TW': '段落內容', 'en-US': 'Paragraph content' },
            originalText: '段落內容'
          })
        }
      });

      await aiService.getAiSuggestions('段落內容', context, testPath);

      const call = mockModel.generateContent.mock.calls[0][0];
      expect(call).toContain('Element Type: label');
    });
  });

  describe('Complex Contexts', () => {
    it('should detect element type from nested JSX', async () => {
      const testPath = '/test/project/src/editor/test.jsx';
      const context = `
        <div className="form-group">
          <label>姓名</label>
          <TextField placeholder="請輸入姓名" />
        </div>
      `;
      const mockModel = (aiService as any).model;

      mockModel.generateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify({
            i18nKey: 'editor.form.name.placeholder',
            translations: { 'zh-TW': '請輸入姓名', 'en-US': 'Please enter name' },
            originalText: '請輸入姓名'
          })
        }
      });

      await aiService.getAiSuggestions('請輸入姓名', context, testPath);

      const call = mockModel.generateContent.mock.calls[0][0];
      expect(call).toContain('Element Type: placeholder');
    });

    it('should prioritize more specific detection patterns', async () => {
      const testPath = '/test/project/src/client/test.jsx';
      const context = '<button className="error-button" onClick={handleError}>錯誤</button>';
      const mockModel = (aiService as any).model;

      mockModel.generateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify({
            i18nKey: 'client.errorAction',
            translations: { 'zh-TW': '錯誤', 'en-US': 'Error' },
            originalText: '錯誤'
          })
        }
      });

      await aiService.getAiSuggestions('錯誤', context, testPath);

      // Should detect as button (more specific) rather than error (className)
      const call = mockModel.generateContent.mock.calls[0][0];
      expect(call).toContain('Element Type: button');
    });
  });
});
