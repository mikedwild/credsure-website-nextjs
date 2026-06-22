import type { AbstractIntlMessages } from "next-intl";

/**
 * Route-scoped message partitioning.
 *
 * The root layout used to hand the ENTIRE merged catalog (~249 KB) to the
 * client provider on every page, so the homepage and every marketing page
 * shipped the full blog (123 post slugs, ~45 KB) and legal (~32 KB) namespaces
 * they never render — the dominant chunk of the mobile-LCP RSC flight.
 *
 * These namespaces are route-isolated: blog slugs are consumed only by
 * BlogCard/BlogPost on /blog and /blog/[slug]; legal namespaces only by the
 * Privacy/Impressum views. So the global provider drops them, and the few
 * routes that need them merge them back client-side via <ScopedMessagesProvider>
 * — which, because the merge happens from inherited context, never re-serializes
 * the global catalog (no double-payload on blog/legal pages).
 *
 * The per-route "extra" is pick()ed from the already-merged `all` (not the raw
 * JSON) so deep-merged namespaces — e.g. `privacy` (a title stub in common.json
 * + full body in legal.json) — are restored exactly as the global catalog had
 * them.
 */

type Dict = Record<string, unknown>;

async function loadKeys(locale: string, file: "blog" | "legal"): Promise<string[]> {
  const safe = locale === "de" ? "de" : "en";
  const mod = await import(`../messages/${safe}/${file}.json`);
  return Object.keys((mod.default ?? mod) as Dict);
}

function omit(messages: AbstractIntlMessages, keys: Iterable<string>): AbstractIntlMessages {
  const drop = new Set(keys);
  const out: Dict = {};
  for (const [k, v] of Object.entries(messages as Dict)) {
    if (!drop.has(k)) out[k] = v;
  }
  return out as AbstractIntlMessages;
}

function pick(messages: AbstractIntlMessages, keys: string[]): AbstractIntlMessages {
  const keep = new Set(keys);
  const out: Dict = {};
  for (const [k, v] of Object.entries(messages as Dict)) {
    if (keep.has(k)) out[k] = v;
  }
  return out as AbstractIntlMessages;
}

/** Global catalog minus the route-isolated blog + legal namespaces. */
export async function getGlobalMessages(
  all: AbstractIntlMessages,
  locale: string
): Promise<AbstractIntlMessages> {
  const [blogKeys, legalKeys] = await Promise.all([
    loadKeys(locale, "blog"),
    loadKeys(locale, "legal"),
  ]);
  return omit(all, [...blogKeys, ...legalKeys]);
}

/** Blog post-slug namespaces — merged back on /blog and /blog/[slug]. */
export async function getBlogMessages(
  all: AbstractIntlMessages,
  locale: string
): Promise<AbstractIntlMessages> {
  return pick(all, await loadKeys(locale, "blog"));
}

/** Legal namespaces (privacy/terms/impressum) — merged back on legal routes. */
export async function getLegalMessages(
  all: AbstractIntlMessages,
  locale: string
): Promise<AbstractIntlMessages> {
  return pick(all, await loadKeys(locale, "legal"));
}

/**
 * EN + DE catch-all slugs whose view consumes legal.json namespaces:
 * Privacy (privacy/datenschutz) and Impressum (impressum). PoliciesTerms uses
 * `mscx` (global) and the `terms`-namespace Terms view is not routed, so
 * neither needs legal scoping.
 */
const LEGAL_SLUGS = new Set(["privacy", "datenschutz", "impressum"]);
export function isLegalSlug(slug: string): boolean {
  return LEGAL_SLUGS.has(slug);
}
