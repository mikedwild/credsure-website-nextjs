import type { Metadata } from "next";
import { enToRoute, deToRoute } from "@/config/routeConfig";
import enPages from "@/messages/en/pages.json";
import dePages from "@/messages/de/pages.json";

/**
 * Server-side per-page metadata builder.
 *
 * The migrated site set <title>/<meta>/canonical client-side via react-helmet
 * (SEO.jsx), so the server HTML every crawler/social/AI bot reads carried only
 * the generic default from layout.tsx — identical on every page. This helper
 * produces real per-page metadata at request time using the existing `seo.*`
 * i18n copy, plus structural canonical + hreflang derived from routeConfig.
 */
const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://credsure.io"
).replace(/\/$/, "");

const SEO: Record<string, Record<string, { title?: string; description?: string }>> = {
  en: ((enPages as Record<string, unknown>).seo as Record<string, { title?: string; description?: string }>) || {},
  de: ((dePages as Record<string, unknown>).seo as Record<string, { title?: string; description?: string }>) || {},
};

const DEFAULT_DESC =
  "Issue, manage and verify blockchain-backed digital credentials and badges at scale. GDPR-compliant, EU-hosted.";

const en = enToRoute as Record<string, { en: string; de: string }>;
const de = deToRoute as Record<string, { en: string; de: string }>;

// kebab/slash → camelCase of the whole slug (compare/accredible → compareAccredible)
function camelFull(s: string): string {
  return s
    .split(/[-/]/)
    .map((w, i) => (i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join("");
}
// camelCase of just the last segment (features/blockchain → blockchain)
function camelLast(s: string): string {
  const last = s.split("/").pop() || s;
  return last
    .split("-")
    .map((w, i) => (i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join("");
}
function humanize(s: string): string {
  const last = s.split("/").pop() || s;
  return last
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function buildPageMetadata(
  locale: string,
  slugInput: string | string[] | undefined
): Metadata {
  const loc = locale === "de" ? "de" : "en";
  const slug = Array.isArray(slugInput)
    ? slugInput.join("/")
    : slugInput || "";

  // Map the visited slug to a routeConfig entry to get both-locale slugs.
  const route = loc === "de" ? de[slug] || en[slug] : en[slug] || de[slug];
  const enSlug = route ? route.en : slug;
  const deSlug = route ? route.de : slug;

  const enUrl = enSlug ? `${SITE_URL}/en/${enSlug}` : `${SITE_URL}/en`;
  const deUrl = deSlug ? `${SITE_URL}/de/${deSlug}` : `${SITE_URL}/de`;
  const canonical = loc === "de" ? deUrl : enUrl;

  // Resolve SEO copy by the stable English slug, in the active locale.
  const seo = SEO[loc] || {};
  const seoKey = !enSlug
    ? "home"
    : seo[camelFull(enSlug)]
    ? camelFull(enSlug)
    : seo[camelLast(enSlug)]
    ? camelLast(enSlug)
    : null;
  const entry = seoKey ? seo[seoKey] : null;

  const title = entry?.title || `${humanize(enSlug) || "CredSure"} | CredSure`;
  const description = entry?.description || DEFAULT_DESC;

  return {
    // `absolute` bypasses the layout's "%s | Credsure" template (titles already
    // include the brand).
    title: { absolute: title },
    description,
    alternates: {
      canonical,
      languages: {
        en: enUrl,
        de: deUrl,
        "x-default": enUrl,
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
