/**
 * Text processing utilities for i18n
 */

/**
 * Check if text is already an i18n key
 */
export const isI18nKey = (text: string): boolean => /^[a-z0-9]+(\.[a-z0-9]+)+$/.test(text);

/**
 * Check if text likely contains Chinese characters
 */
export const isLikelyChinese = (text: string): boolean => /[\u4e00-\u9fa5]/.test(text);

/**
 * Generate context-aware i18n key suggestions
 */
export function generateKeyPrefix(context: string): string {
    const lowerContext = context.toLowerCase();

    if (lowerContext.includes('<button')) return 'btn';
    if (lowerContext.match(/<h[1-6]/)) return 'title';
    if (lowerContext.includes('placeholder')) return 'placeholder';
    if (lowerContext.includes('<p>') || lowerContext.includes('<span>')) return 'label';

    return 'label'; // default fallback
}
