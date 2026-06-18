import { useNavigate, useParams } from '@/lib/router-shim';
import { useCallback } from 'react';
import { localePath, DEFAULT_LANG, SUPPORTED_LANGS } from './localePath';

/**
 * A navigate wrapper that prefixes the current language AND translates the slug
 * to that language. Usage: const navigate = useLocalizedNavigate();
 *   navigate('/demo')     → /en/demo     or /de/demo
 *   navigate('/platform') → /en/platform or /de/plattform   (slug translated)
 *
 * Previously this only prefixed the locale, so German pages navigated to English
 * slugs (e.g. /de/platform instead of /de/plattform). localePath handles both
 * the prefix and the EN↔DE slug mapping, and is idempotent on already-prefixed
 * paths.
 */
export function useLocalizedNavigate() {
  const navigate = useNavigate();
  const { locale } = useParams();
  const currentLang = SUPPORTED_LANGS.includes(locale) ? locale : DEFAULT_LANG;

  return useCallback((to, options) => {
    // Allow numeric navigation (e.g., navigate(-1))
    if (typeof to === 'number') {
      return navigate(to);
    }
    if (typeof to === 'string') {
      return navigate(localePath(to, currentLang), options);
    }
    return navigate(to, options);
  }, [navigate, currentLang]);
}
