/**
 * Blog post route (server component).
 *
 * Was `"use client"` + `ssr: false` with no metadata — so every post served the
 * generic root <title>, no canonical, no hreflang, and an empty body until JS
 * ran. Google flagged them "Discovered – currently not indexed". This now emits
 * real per-post metadata server-side and SSRs the article (BlogPost seeded with
 * the server-fetched post), so crawlers get a unique, fully-rendered page.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageShell from "@/components/PageShell";
import { BlogPost } from "@/views/BlogPost";
import { getBlogPost } from "@/lib/blogApi";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://credsure.io"
).replace(/\/$/, "");

function toIso(d?: unknown): string | undefined {
  if (!d) return undefined;
  try {
    return new Date(String(d)).toISOString();
  } catch {
    return undefined;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const loc = locale === "de" ? "de" : "en";
  const post = await getBlogPost(slug, loc);
  if (!post) return { title: { absolute: "Blog | CredSure" } };

  const enUrl = `${SITE_URL}/en/blog/${slug}`;
  const deUrl = `${SITE_URL}/de/blog/${slug}`;
  // A DE request with no German translation serves EN content (served_lang ==
  // 'en') — point its canonical at the EN URL so Google doesn't see duplicates.
  const servedDe = post.served_lang === "de";
  const canonical = loc === "de" && servedDe ? deUrl : enUrl;

  const title = post.seo_title || post.title || "CredSure Blog";
  const description = post.seo_description || post.excerpt || "";
  const ogImage = `${SITE_URL}/api/og?${new URLSearchParams({
    title: String(post.title || ""),
    pill: String(post.category || "Blog"),
    desc: String(post.excerpt || ""),
    tileTitle: String(post.category || "Article"),
    tileSub: String(post.author || "CredSure Team"),
  }).toString()}`;

  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical,
      languages: { en: enUrl, de: deUrl, "x-default": enUrl },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "article",
      images: [{ url: ogImage }],
      publishedTime: toIso(post.date),
      modifiedTime: toIso(post.date_modified || post.date),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const loc = locale === "de" ? "de" : "en";
  const post = await getBlogPost(slug, loc);
  // A missing post must return a real 404, not a 200 with a perpetual spinner
  // (that's a soft-404 — Google flags it, the exact failure the SSR refactor
  // was meant to fix). generateMetadata already emits a generic title for null.
  if (!post) notFound();
  return (
    <PageShell>
      <BlogPost key={slug} initialPost={post} />
    </PageShell>
  );
}
