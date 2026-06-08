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
