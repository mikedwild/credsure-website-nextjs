import { useNavigate, useParams } from '@/lib/router-shim';
import { useCallback } from 'react';
import { DEFAULT_LANG, SUPPORTED_LANGS } from './localePath';

/**
 * A navigate wrapper that automatically prefixes paths with the current language.
 * Usage: const navigate = useLocalizedNavigate();
 *        navigate('/demo') → navigates to /en/demo (or /de/demo)
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
    // Already prefixed with a supported lang
    if (typeof to === 'string') {
      const segments = to.split('/').filter(Boolean);
      if (segments.length > 0 && SUPPORTED_LANGS.includes(segments[0])) {
        return navigate(to, options);
      }
      // Prefix with current lang
      const prefixed = to.startsWith('/') ? `/${currentLang}${to}` : `/${currentLang}/${to}`;
      return navigate(prefixed, options);
    }
    return navigate(to, options);
  }, [navigate, currentLang]);
}
