import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

type Dict = Record<string, unknown>;

/**
 * Deep-merge message dictionaries. A shallow spread ({...a, ...b}) would make a
 * later file's top-level namespace REPLACE an earlier one — silently dropping
 * keys when the same namespace (e.g. `megaMenu`, `seo`, `statsSection`) is split
 * across files. Deep merge combines them instead.
 */
function deepMerge(target: Dict, source: Dict): Dict {
  for (const key of Object.keys(source)) {
    const sv = source[key];
    const tv = target[key];
    if (
      sv && typeof sv === "object" && !Array.isArray(sv) &&
      tv && typeof tv === "object" && !Array.isArray(tv)
    ) {
      target[key] = deepMerge({ ...(tv as Dict) }, sv as Dict);
    } else {
      target[key] = sv;
    }
  }
  return target;
}

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

  const messages = [common, pages, marketing, features, legal, blog].reduce(
    (acc, m) => deepMerge(acc, m.default as Dict),
    {} as Dict
  );

  return {
    locale,
    messages,
    onError() {
      // suppress missing message errors — degrade gracefully
    },
    getMessageFallback({ key }: { key: string }) {
      return key.split(".").pop() ?? key;
    },
  };
});
