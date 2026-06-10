import { cache } from "react";
import sanitizeHtml from "sanitize-html";

/**
 * Sanitize blog body HTML on the server (pure JS — no jsdom, so it runs in
 * Vercel's serverless runtime; isomorphic-dompurify's jsdom silently failed
 * SSR there and dropped the body to client-only rendering). Allowlist covers
 * the formatting the CMS actually emits plus a generous superset.
 */
const SANITIZE_OPTS: sanitizeHtml.IOptions = {
  allowedTags: [
    "h1", "h2", "h3", "h4", "h5", "h6", "p", "ul", "ol", "li",
    "strong", "b", "em", "i", "u", "a", "blockquote", "br", "hr",
    "code", "pre", "img", "figure", "figcaption", "span",
    "table", "thead", "tbody", "tr", "td", "th",
  ],
  allowedAttributes: {
    a: ["href", "name", "target", "rel"],
    img: ["src", "alt", "width", "height", "loading"],
    "*": ["class"],
  },
  allowedSchemes: ["http", "https", "mailto"],
};

function sanitizeBody(post: BlogPostData | null): BlogPostData | null {
  if (post && typeof post.content_html === "string" && post.content_html) {
    post.content_html = sanitizeHtml(post.content_html, SANITIZE_OPTS);
  }
  return post;
}

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
      return sanitizeBody((data?.post as BlogPostData) || null);
    } catch {
      return null;
    }
  }
);

export const getBlogList = cache(
  async (locale: string): Promise<BlogPostData[]> => {
    const lang = locale === "de" ? "de" : "en";
    try {
      const res = await fetch(`${BACKEND}/api/blogs?lang=${lang}&limit=200`, {
        next: { revalidate: 300 },
      });
      if (!res.ok) return [];
      const data = await res.json();
      return (data?.posts as BlogPostData[]) || [];
    } catch {
      return [];
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
