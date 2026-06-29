// Per-post branded hero, rendered on the fly by the /blog-hero/<slug> route
// (next/og: CredSure gradient + topic icon + the post's title, in Inter, per
// locale). Replaces the old repeating Unsplash/Pexels stock set. Every post —
// including new ones — gets a unique on-brand hero automatically; the image is
// edge-cached. `HERO_DEFAULT` is the static onError fallback if the route fails.
export const HERO_DEFAULT = '/img/blog/heroes/default.webp';

export const getPostImage = (post, lang = 'en') => {
  const slug = post && post.slug ? encodeURIComponent(String(post.slug)) : '';
  const l = lang === 'de' ? 'de' : 'en';
  return slug ? `/blog-hero/${slug}?lang=${l}` : HERO_DEFAULT;
};

export const formatDate = (dateStr, lang = 'en') => {
  const d = new Date(dateStr);
  const locale = lang === 'de' ? 'de-DE' : 'en-US';
  return d.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' });
};
