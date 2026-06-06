/**
 * i18n Helper Utilities
 * Best practices for handling multilingual content
 */

import i18n from '../i18n';

/**
 * Get translated content with fallback
 * @param {string} key - Translation key
 * @param {object} options - i18next options
 * @returns {string} Translated content
 */
export const getTranslation = (key, options = {}) => {
  return i18n.t(key, { ...options, fallbackLng: 'en' });
};

/**
 * Get current language
 * @returns {string} Current language code
 */
export const getCurrentLanguage = () => {
  return i18n.language || 'en';
};

/**
 * Check if language is available
 * @param {string} lang - Language code
 * @returns {boolean}
 */
export const isLanguageAvailable = (lang) => {
  return ['en', 'de'].includes(lang);
};

/**
 * Format date based on current language
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date
 */
export const formatDate = (date) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const lang = getCurrentLanguage();
  
  return new Intl.DateTimeFormat(lang === 'de' ? 'de-DE' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(dateObj);
};

/**
 * Get localized slug/URL
 * @param {string} slug - Base slug
 * @param {string} lang - Language code (optional, uses current if not provided)
 * @returns {string} Localized slug
 */
export const getLocalizedSlug = (slug, lang = null) => {
  const language = lang || getCurrentLanguage();
  return language === 'en' ? slug : `/${language}${slug}`;
};

/**
 * Extract language from URL path
 * @param {string} path - URL path
 * @returns {string} Language code
 */
export const getLanguageFromPath = (path) => {
  const match = path.match(/^\/(de|en)\//);
  return match ? match[1] : 'en';
};

/**
 * Get localized blog content
 * Handles fallback when translation doesn't exist
 * @param {object} blogPost - Blog post object
 * @param {string} field - Field to get (title, content, excerpt, etc.)
 * @returns {string} Localized content
 */
export const getLocalizedBlogContent = (blogPost, field) => {
  const lang = getCurrentLanguage();
  
  // Try to get localized content
  const localizedField = `${field}_${lang}`;
  if (blogPost[localizedField]) {
    return blogPost[localizedField];
  }
  
  // Fallback to English
  const englishField = `${field}_en`;
  if (blogPost[englishField]) {
    return blogPost[englishField];
  }
  
  // Last fallback to base field
  return blogPost[field] || '';
};

/**
 * Format number based on locale
 * @param {number} number - Number to format
 * @param {object} options - Intl.NumberFormat options
 * @returns {string} Formatted number
 */
export const formatNumber = (number, options = {}) => {
  const lang = getCurrentLanguage();
  return new Intl.NumberFormat(lang === 'de' ? 'de-DE' : 'en-US', options).format(number);
};

/**
 * Format currency based on locale
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (EUR, USD, etc.)
 * @returns {string} Formatted currency
 */
export const formatCurrency = (amount, currency = 'EUR') => {
  const lang = getCurrentLanguage();
  return new Intl.NumberFormat(lang === 'de' ? 'de-DE' : 'en-US', {
    style: 'currency',
    currency
  }).format(amount);
};

/**
 * Get meta tags for SEO in current language
 * @param {object} meta - Meta data object
 * @returns {object} Localized meta tags
 */
export const getLocalizedMeta = (meta) => {
  const lang = getCurrentLanguage();
  
  return {
    title: meta[`title_${lang}`] || meta.title || '',
    description: meta[`description_${lang}`] || meta.description || '',
    keywords: meta[`keywords_${lang}`] || meta.keywords || '',
    ogTitle: meta[`ogTitle_${lang}`] || meta.ogTitle || meta[`title_${lang}`] || meta.title || '',
    ogDescription: meta[`ogDescription_${lang}`] || meta.ogDescription || meta[`description_${lang}`] || meta.description || '',
  };
};

/**
 * Switch language and reload content
 * @param {string} newLang - New language code
 * @param {function} callback - Callback after language change
 */
export const switchLanguage = async (newLang, callback = null) => {
  if (!isLanguageAvailable(newLang)) {
    console.warn(`Language ${newLang} is not available`);
    return;
  }
  
  await i18n.changeLanguage(newLang);
  
  if (callback) {
    callback(newLang);
  }
};

export default {
  getTranslation,
  getCurrentLanguage,
  isLanguageAvailable,
  formatDate,
  getLocalizedSlug,
  getLanguageFromPath,
  getLocalizedBlogContent,
  formatNumber,
  formatCurrency,
  getLocalizedMeta,
  switchLanguage,
};
