"use client";
import React, { useEffect, useRef, useState } from 'react';
import { useParams, useLocation } from '@/lib/router-shim';
import { LocalizedLink as Link } from '@/components/LocalizedLink';
import { useTranslation } from '@/lib/useTranslation';
import { useLocale } from 'next-intl';
import { SEO, createArticleSchema, createBreadcrumbSchema, getBaseUrl } from '@/components/SEO';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, ArrowLeft, Share2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InlineBlogCTA } from '@/components/InlineBlogCTA';
import { useLocalizedNavigate } from '@/hooks/useLocalizedNavigate';

// Per-post branded hero (shared helper) — /img/blog/heroes/<slug>.webp.
import { getPostImage } from '../utils/blogImageUtils';

// ─── FAQ structured data ─────────────────────────────────────────────
// Parse the post's "Frequently asked questions" section into Q&A pairs so we
// can emit FAQPage JSON-LD (helps AI search engines; valid schema even though
// Google's FAQ rich result is now limited to gov/health). Normalizes non-
// breaking spaces (the translator emits them) and strips tags/entities to plain
// text. Pure string work — SSR-safe (no DOM APIs).
const decodeEntities = (s) =>
  s.replace(/&nbsp;|&#160;/g, ' ')
    .replace(/&amp;/g, '&').replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const toPlainText = (html) =>
  decodeEntities(html.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
// Heading text (EN + DE) that introduces an FAQ block. Broad on purpose so we
// don't miss "FAQ", "FAQs", "Common Questions", "Q&A" or the German variants.
const FAQ_HEADING_RE =
  /(frequently\s+asked\s+questions|\bfaqs?\b|common\s+questions|questions?\s*&\s*answers|\bq\s*&\s*a\b|h\u00e4ufig\s+gestellte\s+fragen|h\u00e4ufige\s+fragen)/i;

const buildFaqSchema = (html) => {
  if (!html) return null;
  const normalized = html.replace(/&nbsp;|&#160;|\u00a0/g, ' ');
  const faqs = [];

  // 1) A section under an FAQ <h2>; questions are the <h3>/<h4> inside it,
  //    answers the text up to the next heading.
  const h2Re = /<h2[^>]*>([\s\S]*?)<\/h2>([\s\S]*?)(?=<h2|$)/gi;
  let s;
  while ((s = h2Re.exec(normalized)) !== null) {
    if (!FAQ_HEADING_RE.test(toPlainText(s[1]))) continue;
    const qRe = /<h([34])[^>]*>([\s\S]*?)<\/h\1>([\s\S]*?)(?=<h[1-4]|$)/gi;
    let m;
    while ((m = qRe.exec(s[2])) !== null) {
      const q = toPlainText(m[2]);
      const a = toPlainText(m[3]);
      if (q && a) faqs.push({ q, a });
    }
  }

  // 2) Accordion fallback: <details><summary>Q</summary>A</details> anywhere.
  const detailsRe =
    /<details[^>]*>\s*<summary[^>]*>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/gi;
  let d;
  while ((d = detailsRe.exec(normalized)) !== null) {
    const q = toPlainText(d[1]);
    const a = toPlainText(d[2]);
    if (q && a) faqs.push({ q, a });
  }

  // Dedupe by question; FAQPage needs 2+ entries to be valid.
  const seen = new Set();
  const unique = faqs.filter((f) => {
    const k = f.q.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  if (unique.length < 2) return null;
  return {
    '@type': 'FAQPage',
    mainEntity: unique.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
};

/**
 * @param {{ initialPost?: Record<string, unknown> | null }} props
 *   `initialPost` is the server-fetched post (SSR seed). When omitted the
 *   component fetches client-side as a fallback.
 */
export const BlogPost = ({ initialPost = null }) => {
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useLocalizedNavigate();
  const t = useTranslation();
  const i18n = { language: useLocale() };
  const baseUrl = getBaseUrl();
  // Derive the request language from the URL prefix, NOT i18n.language.
  // i18next-browser-languagedetector persists the previous language in
  // localStorage so on a DE → EN SPA navigation `i18n.language` may
  // still read 'de' for one render. That used to make the canonical
  // briefly point at /de/... on an /en/... URL — which is exactly the
  // signal Search Console flags as "Duplicate without canonical".
  const urlLang = location.pathname.startsWith('/de/') ? 'de' : 'en';
  // Seed from the server-fetched post (SSR) so the article is in the initial
  // HTML and there's no loading flash; fall back to a client fetch only when
  // it's absent (e.g. a stale client navigation that didn't hit the server).
  const [postMeta, setPostMeta] = useState(initialPost);
  const [sections, setSections] = useState(initialPost?.sections || []);
  const [contentHtml, setContentHtml] = useState(initialPost?.content_html || '');
  const [isLoading, setIsLoading] = useState(!initialPost);
  // Sentinel to dedupe the view ping under React 18 StrictMode dev
  // double-invocation. Per-slug so navigating between posts re-fires.
  const viewPingedRef = useRef('');

  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';
    // Server already provided the post for this slug — skip the refetch.
    if (!initialPost) {
      fetch(`${API_URL}/api/blogs/${slug}?lang=${urlLang}`)
        .then(res => {
          if (!res.ok) throw new Error('Not found');
          return res.json();
        })
        .then(async fetchedData => {
          const post = fetchedData.post;
          // Server-fetched posts are already sanitized (lib/blogApi). This
          // client-only fallback path sanitizes with a browser-loaded
          // DOMPurify (dynamic import keeps it out of the SSR module graph).
          const { default: DOMPurify } = await import('dompurify');
          setPostMeta(post);
          setSections(post.sections || []);
          setContentHtml(DOMPurify.sanitize(post.content_html || ''));
          setIsLoading(false);
        })
        .catch(() => {
          setIsLoading(false);
          navigate('/blog');
        });
    }

    // Fire-and-forget view ping. We use `keepalive` so the request still
    // goes through if the user navigates away within the same tick (rare
    // but real on bounce traffic). Failures are intentionally swallowed —
    // a failed analytics ping must never break the page render. The ref
    // sentinel makes this exactly-once-per-slug even under StrictMode.
    if (viewPingedRef.current !== slug) {
      viewPingedRef.current = slug;
      fetch(`${API_URL}/api/blogs/${slug}/view`, {
        method: 'POST',
        keepalive: true,
      }).catch(() => { /* analytics noop */ });
    }
  }, [slug, navigate, urlLang, initialPost]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white ">
        <div className="w-8 h-8 border-4 border-[#5B22D6] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!postMeta) return null;

  const image = getPostImage(postMeta);
  // The API/DB is the single source of truth for translated content: the
  // backend already serves title/excerpt in the requested locale (title_de etc).
  // (Previously these were re-translated from the static blog.json catalog,
  // which shadowed the DB so CMS edits to German never rendered.)
  const translatedTitle = postMeta.title;
  const translatedExcerpt = postMeta.excerpt;

  const breadcrumbs = [
    { name: 'Home', path: '/' },
    { name: 'Blog', path: '/blog' },
    { name: postMeta.title, path: `/blog/${slug}` }
  ];

  // Use the real last-modified timestamp from the backend if available so
  // AI search engines (Perplexity, ChatGPT Search, Gemini) can correctly
  // assess content freshness. Falls back to the publish date for legacy
  // posts whose `date_modified` was never recorded.
  const dateModifiedIso = (() => {
    const raw = postMeta.date_modified || postMeta.date;
    try { return new Date(raw).toISOString(); } catch { return new Date(postMeta.date).toISOString(); }
  })();

  const articleData = {
    title: translatedTitle,
    description: translatedExcerpt,
    image: image,
    datePublished: new Date(postMeta.date).toISOString(),
    dateModified: dateModifiedIso,
    author: postMeta.author || 'CredSure Team',
    authorType: 'Organization',
    url: `/blog/${slug}`
  };

  // FAQPage schema, derived from the post's "Frequently asked questions"
  // section if it has one. Added to the @graph only when present.
  const faqSchema = buildFaqSchema(contentHtml);
  const combinedSchema = {
    "@context": "https://schema.org",
    "@graph": [
      createBreadcrumbSchema(breadcrumbs, baseUrl),
      {
        ...createArticleSchema(articleData, baseUrl),
        "speakable": {
          "@type": "SpeakableSpecification",
          "cssSelector": ["h1", ".blog-lead", ".blog-content h2", ".blog-content p:first-of-type"]
        },
        "keywords": postMeta.category ? [postMeta.category, "digital credentials", "blockchain certificates"] : undefined
      },
      ...(faqSchema ? [faqSchema] : [])
    ]
  };

  return (
    <div className="min-h-screen bg-white ">
      <SEO
        titleKey={postMeta.seo_title || postMeta.title}
        descriptionKey={postMeta.seo_description || postMeta.excerpt}
        canonical={`/blog/${slug}`}
        // When a DE request falls back to EN content (no German
        // translation exists), point the canonical at the EN URL so
        // Google doesn't see two identical pages with self-canonicals.
        // `served_lang` is set by the backend (/blogs/{slug}).
        canonicalLang={postMeta.served_lang === 'de' ? 'de' : 'en'}
        ogImage={`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/og?${new URLSearchParams({
          title: translatedTitle,
          pill: postMeta.category || 'Blog',
          desc: translatedExcerpt,
          tileTitle: postMeta.category || 'Article',
          tileSub: postMeta.author || 'CredSure Team',
        }).toString()}`}
        structuredData={combinedSchema}
      />

      {/* Hero */}
      <div className="relative bg-gradient-to-br from-[#5B22D6] to-[#3F2BD9] overflow-hidden">
        <img src={image} alt={postMeta.title} className="absolute inset-0 w-full h-full object-cover opacity-40" loading="eager" fetchPriority="high" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#5B22D6]/90 via-[#5B22D6]/50 to-[#3F2BD9]/30" />
        <div className="relative container mx-auto px-6 lg:px-12 py-20 md:py-28">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto text-center text-white">
              <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-bold mb-6">{postMeta.category}</span>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">{translatedTitle}</h1>
              <div className="flex items-center justify-center gap-6 text-white/90 flex-wrap">
                <div className="flex items-center gap-2"><User className="w-5 h-5" />{postMeta.author || 'CredSure Team'}</div>
                <div className="flex items-center gap-2"><Calendar className="w-5 h-5" />{(() => {
                  const fmt = (d) => new Date(d).toLocaleDateString(i18n.language === 'de' ? 'de-DE' : 'en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                  const pub = new Date(postMeta.date).getTime();
                  const mod = postMeta.date_modified ? new Date(postMeta.date_modified).getTime() : null;
                  // Show the modified date (labelled) when it's meaningfully newer
                  // than the publish date so refreshed posts read as fresh, instead
                  // of showing the original (possibly years-old) publish date.
                  return mod && mod - pub > 86400000
                    ? `${t('pages.blog.updated', 'Updated')} ${fmt(postMeta.date_modified)}`
                    : fmt(postMeta.date);
                })()}</div>
                <div className="flex items-center gap-2"><Clock className="w-5 h-5" />{postMeta.readTime}</div>
              </div>
              {postMeta.ai_generated && (
                <div
                  className="mt-5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-xs text-white/90 border border-white/20"
                  title={t('pages.blog.aiDisclosure', 'Drafted with AI, reviewed by CredSure editors')}
                  data-testid="ai-disclosure-badge"
                >
                  <Sparkles className="w-3 h-3" />
                  {t('pages.blog.aiDisclosure', 'Drafted with AI, reviewed by CredSure editors')}
                </div>
              )}
          </motion.div>
        </div>
      </div>

      {/* Article Content */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-6 lg:px-12 max-w-4xl">
          <Button
            onClick={() => navigate('/blog')}
            variant="outline"
            className="mb-8 border-2 border-slate-300  hover:border-[#5B22D6]"
          >
            <ArrowLeft className="mr-2 w-5 h-5" />
            {t('pages.blog.backToBlog', 'Back to Blog')}
          </Button>

          {/* Lead paragraph */}
          {translatedExcerpt && (
            <p className="blog-lead text-xl text-gray-600  leading-relaxed mb-10 font-medium border-l-4 border-[#5B22D6] pl-6">
              {translatedExcerpt}
            </p>
          )}

          {/* Structured sections from scraped content */}
          <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="blog-content">
            {contentHtml ? (
              <div className="space-y-8">
                <div
                  className="prose prose-lg max-w-none text-gray-700   [&_h2]:text-2xl [&_h2]:md:text-3xl [&_h2]:font-bold [&_h2]:text-[#0F0E1A] [&_h2]: [&_h2]:mt-10 [&_h2]:mb-4 [&_p]:leading-relaxed [&_li]:leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: contentHtml }}
                />
                <InlineBlogCTA variant="default" blogSlug={slug} />
              </div>
            ) : sections.length > 0 ? (
              <div className="space-y-8">
                {sections.map((section, i) => (
                  <React.Fragment key={section.heading || `section-${i}`}>
                    <div>
                      {section.heading && (
                        <h2 className="text-2xl md:text-3xl font-bold text-[#0F0E1A]  mt-10 mb-4">
                          {section.heading}
                        </h2>
                      )}
                      <p className="text-gray-700  leading-relaxed text-base">
                        {section.content}
                      </p>
                    </div>
                    {i === 2 && <InlineBlogCTA variant="compact" blogSlug={slug} />}
                  </React.Fragment>
                ))}
                <InlineBlogCTA variant="default" blogSlug={slug} />
              </div>
            ) : (
              <div className="text-gray-700  leading-relaxed">
                <p className="text-base">
                  This article explores key insights about {(postMeta.title || '').toLowerCase()}. Stay tuned for the full content.
                </p>
              </div>
            )}
          </motion.article>

          {/* Share */}
          <div className="mt-12 pt-8 border-t border-gray-200 ">
            <h3 className="text-xl font-bold text-[#0F0E1A]  mb-4">{t('pages.blog.shareArticle', 'Share this article')}</h3>
            <div className="flex gap-4">
              <Button
                variant="outline"
                className="border-2 border-slate-300  hover:border-[#5B22D6]"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: postMeta.title, url: window.location.href });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                  }
                }}
              >
                <Share2 className="mr-2 w-5 h-5" />
                {t('pages.blog.share', 'Share')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-[#5B22D6] to-[#3F2BD9]">
        <div className="container mx-auto px-6 lg:px-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">{t('pages.blog.ctaTitle', 'Ready to Transform Your Credentialing?')}</h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">{t('pages.blog.ctaDesc', 'Discover how CredSure can help you issue secure, blockchain-verified digital credentials')}</p>
          <Link to="/demo">
            <Button className="bg-white text-[#5B22D6] hover:bg-white/90 px-10 py-6 text-lg rounded-2xl font-semibold">{t('pages.blog.scheduleDemo', 'Schedule a Demo')}</Button>
          </Link>
        </div>
      </section>
    </div>
  );
};
