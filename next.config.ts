import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Pin the workspace root: a stray /Users/mikewild/package-lock.json makes
  // Next infer the home dir as the root, which breaks local dev resolution.
  turbopack: {
    root: __dirname,
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    return [
      { source: "/about-us", destination: "/about", permanent: true },
      { source: "/privacy-policy", destination: "/privacy", permanent: true },
      // Consolidate the legacy plural blog URLs (served by the [...slug]
      // catch-all with stale titles, no JSON-LD, and a self-referential
      // canonical) onto the optimized /[locale]/blog/<slug> pages. 301 so
      // search engines transfer the existing rankings. `:slug*` also matches
      // the bare index (/blogs -> /en/blog). next.config redirects run before
      // the next-intl middleware, so these win over its locale-prefixing.
      { source: "/:locale(en|de)/blogs/:slug*", destination: "/:locale/blog/:slug*", permanent: true },
      { source: "/blogs/:slug*", destination: "/en/blog/:slug*", permanent: true },
      // Recover backlink equity: the legacy /solutions/digital-badges URL (~50
      // referring domains) otherwise lands (via locale middleware) on the
      // noindexed alternate /en/solutions/digital-badges. Point it at the
      // indexable canonical /en/digital-badges instead.
      { source: "/solutions/digital-badges", destination: "/en/digital-badges", permanent: true },
      { source: "/en/solutions/digital-badges", destination: "/en/digital-badges", permanent: true },
    ];
  },
};

export default withNextIntl(nextConfig);
