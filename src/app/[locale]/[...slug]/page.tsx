/**
 * Catch-all locale route (server component).
 *
 * Resolves any EN or DE localized slug to its view via routeConfig (the German
 * nav uses localized slugs: pricing↔preise, platform↔plattform, …). Rendering
 * happens in the client child; this server wrapper exists so we can emit real
 * per-page metadata (title/description/canonical/hreflang) at request time.
 */
import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/pageMetadata";
import { CatchAllClient } from "./CatchAllClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string[] }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  return buildPageMetadata(locale, slug);
}

export default async function CatchAllPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string[] }>;
}) {
  const { locale, slug } = await params;
  const slugStr = Array.isArray(slug) ? slug.join("/") : slug || "";
  return <CatchAllClient locale={locale} slug={slugStr} />;
}
