import type { MetadataRoute } from "next";
import { routeConfig } from "@/config/routeConfig";

/**
 * Generates /sitemap.xml from the central routeConfig, with hreflang
 * (en / de / x-default) alternates per URL. Google fully supports hreflang
 * via sitemap, so this fixes both sitemap discovery AND international SEO
 * without touching any page component.
 */
const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://credsure.io"
).replace(/\/$/, "");

// Routes excluded from the index (auth, admin, legacy redirects, dynamic stubs).
const EXCLUDE = new Set(["signin", "analytics", "demo"]);

type RouteEntry = {
  en: string;
  de: string;
  redirectTo?: string;
};

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const entries: MetadataRoute.Sitemap = [];

  // Home (both locales)
  entries.push({
    url: `${SITE_URL}/en`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 1,
    alternates: {
      languages: {
        en: `${SITE_URL}/en`,
        de: `${SITE_URL}/de`,
        "x-default": `${SITE_URL}/en`,
      },
    },
  });

  for (const route of routeConfig as RouteEntry[]) {
    if (route.redirectTo) continue; // legacy → canonical, don't index
    if (route.en.includes(":")) continue; // dynamic patterns (blog/:slug)
    if (EXCLUDE.has(route.en)) continue;

    const enUrl = `${SITE_URL}/en/${route.en}`;
    const deUrl = `${SITE_URL}/de/${route.de}`;

    entries.push({
      url: enUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
      alternates: {
        languages: {
          en: enUrl,
          de: deUrl,
          "x-default": enUrl,
        },
      },
    });
  }

  return entries;
}
