import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as "en" | "de")) {
    locale = routing.defaultLocale;
  }

  const [common, pages, marketing, features, legal, blog] = await Promise.all([
    import(`../messages/${locale}/common.json`),
    import(`../messages/${locale}/pages.json`),
    import(`../messages/${locale}/marketing.json`),
    import(`../messages/${locale}/features.json`),
    import(`../messages/${locale}/legal.json`),
    import(`../messages/${locale}/blog.json`),
  ]);

  return {
    locale,
    messages: {
      ...common.default,
      ...pages.default,
      ...marketing.default,
      ...features.default,
      ...legal.default,
      ...blog.default,
    },
    onError() {
      // suppress missing message errors — degrade gracefully
    },
    getMessageFallback({ key }: { key: string }) {
      return key.split(".").pop() ?? key;
    },
  };
});
