/**
 * Blog index route (server component).
 *
 * Was `"use client"` + `ssr: false` with no metadata — the listing served a
 * generic root <title> and an empty shell (post links fetched client-side, so
 * absent from the SSR HTML). Now emits real metadata and SSRs the post grid by
 * seeding Blog with the server-fetched list.
 */
import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { Blog } from "@/views/Blog";
import { getBlogList } from "@/lib/blogApi";
import { buildPageMetadata } from "@/lib/pageMetadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata(locale, "blog");
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const posts = await getBlogList(locale);
  return (
    <PageShell>
      <Blog key={locale} initialPosts={posts} />
    </PageShell>
  );
}
