/**
 * Returns the language prefix portion of the current path (e.g., '/en' or '/de').
 * Falls back to '/en' if no recognized language is found.
 */
export const getLangPrefix = () => {
  if (typeof window === 'undefined') return '/en';
  const match = window.location.pathname.match(/^\/(en|de)(?=\/|$)/);
  return match ? `/${match[1]}` : '/en';
};
