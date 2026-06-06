/**
 * Utility to translate paths between EN and DE.
 * Usage: localePath('/pricing', 'de') → '/de/preise'
 *        localePath('/de/preise', 'en') → '/en/pricing'
 */
import { enToRoute, deToRoute } from '../config/routeConfig';

const SUPPORTED_LANGS = ['en', 'de'];
const DEFAULT_LANG = 'en';

/**
 * Extract the language prefix and slug from a path.
 * e.g., '/en/pricing' → { lang: 'en', slug: 'pricing' }
 *        '/pricing' → { lang: null, slug: 'pricing' }
 */
export function parsePath(path) {
  const clean = path.replace(/^\/+/, '');
  const parts = clean.split('/');
  if (SUPPORTED_LANGS.includes(parts[0])) {
    return { lang: parts[0], slug: parts.slice(1).join('/') || '' };
  }
  return { lang: null, slug: clean };
}

/**
 * Convert a path to the target language.
 * Handles both unprefixed paths ('/pricing') and prefixed paths ('/en/pricing').
 */
export function localePath(path, targetLang) {
  if (!path || path === '/') return `/${targetLang}`;

  const { slug } = parsePath(path);

  if (!slug) return `/${targetLang}`;

  // Check if the slug matches a known EN route
  if (enToRoute[slug]) {
    const route = enToRoute[slug];
    const translatedSlug = targetLang === 'de' ? route.de : route.en;
    return `/${targetLang}/${translatedSlug}`;
  }

  // Check if the slug matches a known DE route
  if (deToRoute[slug]) {
    const route = deToRoute[slug];
    const translatedSlug = targetLang === 'de' ? route.de : route.en;
    return `/${targetLang}/${translatedSlug}`;
  }

  // Handle dynamic segments (e.g., blog/:slug → blog/some-article)
  // Try matching the base path without dynamic segments
  const slugParts = slug.split('/');
  if (slugParts.length >= 2) {
    const basePath = slugParts.slice(0, -1).join('/');
    const dynamicPart = slugParts.slice(-1)[0];
    
    // Try with a :placeholder
    const enPatternKey = `${basePath}/:slug`;
    const dePatternKey = `${basePath}/:slug`;
    
    if (enToRoute[enPatternKey]) {
      const route = enToRoute[enPatternKey];
      const translatedBase = targetLang === 'de' 
        ? route.de.replace('/:slug', '') 
        : route.en.replace('/:slug', '');
      return `/${targetLang}/${translatedBase}/${dynamicPart}`;
    }
    if (deToRoute[dePatternKey]) {
      const route = deToRoute[dePatternKey];
      const translatedBase = targetLang === 'de' 
        ? route.de.replace('/:slug', '') 
        : route.en.replace('/:slug', '');
      return `/${targetLang}/${translatedBase}/${dynamicPart}`;
    }
  }

  // Fallback: keep slug as-is with new lang prefix
  return `/${targetLang}/${slug}`;
}

/**
 * Get the current language from a path.
 */
export function getLangFromPath(path) {
  const { lang } = parsePath(path);
  return lang || DEFAULT_LANG;
}

export { SUPPORTED_LANGS, DEFAULT_LANG };
