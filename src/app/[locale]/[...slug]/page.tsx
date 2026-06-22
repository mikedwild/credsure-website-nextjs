/**
 * Catch-all locale route (server component).
 *
 * Resolves any EN or DE localized slug to its view via routeConfig (the German
 * nav uses localized slugs: pricing↔preise, platform↔plattform, …). Rendering
 * happens in the client child; this server wrapper exists so we can emit real
 * per-page metadata (title/description/canonical/hreflang) at request time.
 */
import type { Metadata } from "next";
import { getMessages } from "next-intl/server";
import { buildPageMetadata } from "@/lib/pageMetadata";
import { ScopedMessagesProvider } from "@/components/ScopedMessagesProvider";
import { getLegalMessages, isLegalSlug } from "@/i18n/messageScopes";
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

  // Legal views (Privacy/Impressum) consume the legal namespaces the global
  // provider drops — merge them back only on those slugs. Every other catch-all
  // page renders under the (lighter) global catalog unchanged.
  if (isLegalSlug(slugStr)) {
    const legalMessages = await getLegalMessages(await getMessages(), locale);
    return (
      <ScopedMessagesProvider extra={legalMessages}>
        <CatchAllClient locale={locale} slug={slugStr} />
      </ScopedMessagesProvider>
    );
  }

  return <CatchAllClient locale={locale} slug={slugStr} />;
}
