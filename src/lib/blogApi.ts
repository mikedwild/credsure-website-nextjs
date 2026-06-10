import { cache } from "react";

/**
 * Server-side blog fetch helpers (for generateMetadata + SSR + sitemap).
 *
 * The browser uses the relative `/api/*` Vercel rewrite, but server-side code
 * needs an absolute origin — the rewrite only applies to browser requests.
 * Hit Railway directly (same target as the vercel.json `/api` rewrite).
 * `cache()` dedupes the per-request fetch shared by generateMetadata + the page.
 */
const BACKEND = (
  process.env.BACKEND_ORIGIN ||
  "https://credsure-website-nextjs-production.up.railway.app"
).replace(/\/$/, "");

export type BlogPostData = {
  slug: string;
  title?: string;
  excerpt?: string;
  content_html?: string;
  sections?: Array<{ heading?: string; content?: string }>;
  category?: string;
  author?: string;
  date?: string;
  date_modified?: string;
  readTime?: string;
  seo_title?: string;
  seo_description?: string;
  served_lang?: string;
  ai_generated?: boolean;
  [k: string]: unknown;
};

export const getBlogPost = cache(
  async (slug: string, locale: string): Promise<BlogPostData | null> => {
    const lang = locale === "de" ? "de" : "en";
    try {
      const res = await fetch(
        `${BACKEND}/api/blogs/${encodeURIComponent(slug)}?lang=${lang}`,
        { next: { revalidate: 300 } }
      );
      if (!res.ok) return null;
      const data = await res.json();
      return (data?.post as BlogPostData) || null;
    } catch {
      return null;
    }
  }
);

export type BlogSlug = { slug: string; hasDe: boolean; date?: string };

export const getBlogSlugs = cache(async (): Promise<BlogSlug[]> => {
  try {
    const res = await fetch(`${BACKEND}/api/blogs?lang=en&limit=500`, {
      next: { revalidate: 600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const posts = (data?.posts as Array<Record<string, unknown>>) || [];
    return posts
      .filter((p) => p && p.slug)
      .map((p) => ({
        slug: String(p.slug),
        hasDe: Boolean(p.title_de),
        date: p.date ? String(p.date) : undefined,
      }));
  } catch {
    return [];
  }
});
