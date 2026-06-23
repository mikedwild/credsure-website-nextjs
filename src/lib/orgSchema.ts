/**
 * Site-wide JSON-LD (Organization + WebSite), rendered server-side in the locale
 * layout so every page ships baseline structured data in its HTML — instead of
 * relying on client-side react-helmet, which crawlers may not execute.
 */
const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://credsure.io"
).replace(/\/$/, "");

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "CredSure",
    url: SITE_URL,
    logo: `${SITE_URL}/og-image.webp`,
    description:
      "Issue, manage and verify blockchain-backed digital credentials and badges at scale. GDPR-compliant, EU-hosted.",
    sameAs: [
      "https://www.linkedin.com/company/credsure",
      "https://x.com/Cred_Sure",
      "https://www.facebook.com/credsureverified",
      "https://youtube.com/channel/UCRM0p7-tHa2I9MSjeUuJdfQ",
    ],
  };
}

export function websiteJsonLd(locale: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "CredSure",
    url: `${SITE_URL}/${locale}`,
    inLanguage: locale === "de" ? "de-DE" : "en-US",
    publisher: { "@type": "Organization", name: "CredSure" },
  };
}

/**
 * Per-article BlogPosting schema. Blog posts previously emitted only the
 * site-wide Organization/WebSite nodes — Google's Rich Results test flagged
 * each post as missing Article markup. JSON.stringify drops `undefined` fields,
 * so optional dates collapse cleanly when absent.
 */
export function blogPostingJsonLd(opts: {
  title: string;
  description: string;
  url: string;
  image: string;
  datePublished?: string;
  dateModified?: string;
  author: string;
  locale: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: opts.title,
    description: opts.description || undefined,
    image: opts.image ? [opts.image] : undefined,
    datePublished: opts.datePublished,
    dateModified: opts.dateModified || opts.datePublished,
    inLanguage: opts.locale === "de" ? "de-DE" : "en-US",
    author: { "@type": "Organization", name: opts.author || "CredSure" },
    publisher: {
      "@type": "Organization",
      name: "CredSure",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/og-image.webp` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": opts.url },
  };
}

/** Home › Blog › <post> breadcrumb trail for the post page. */
export function breadcrumbJsonLd(opts: {
  locale: string;
  title: string;
  slug: string;
}) {
  const base = `${SITE_URL}/${opts.locale}`;
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: base },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${base}/blog` },
      {
        "@type": "ListItem",
        position: 3,
        name: opts.title,
        item: `${base}/blog/${opts.slug}`,
      },
    ],
  };
}
