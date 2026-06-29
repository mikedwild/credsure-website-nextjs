// Per-post branded hero images live in /public/img/blog/heroes/<slug>.webp
// (CredSure gradient + topic icon + post title, generated from the post list).
// Replaces the old shared Unsplash/Pexels stock set, which repeated the same
// few photos across many posts and hotlinked external CDNs. Falls back to a
// branded default (BlogCard/BlogPost also guard with onError) for any post
// whose hero file hasn't been generated yet.
export const HERO_DEFAULT = '/img/blog/heroes/default.webp';

export const getPostImage = (post) => {
  const slug = post && post.slug ? String(post.slug).toLowerCase() : '';
  return slug ? `/img/blog/heroes/${slug}.webp` : HERO_DEFAULT;
};

export const formatDate = (dateStr, lang = 'en') => {
  const d = new Date(dateStr);
  const locale = lang === 'de' ? 'de-DE' : 'en-US';
  return d.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' });
};
