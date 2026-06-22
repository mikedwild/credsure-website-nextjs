"use client";
import { useMemo } from "react";
import { useMessages, useLocale } from "next-intl";
import type { AbstractIntlMessages } from "next-intl";
import { IntlClientProvider } from "@/components/IntlClientProvider";

/**
 * Adds route-isolated message namespaces (blog post slugs, legal pages) on top
 * of the global catalog WITHOUT re-serializing the global catalog into the RSC
 * flight.
 *
 * next-intl providers REPLACE messages rather than merge them, so a plain
 * nested `<NextIntlClientProvider messages={extra}>` would drop the global
 * chrome namespaces (nav/footer/megaMenu) for this subtree. Instead we read the
 * inherited messages from context and merge client-side: the server only
 * serializes `extra` (the small isolated bundle), never the global catalog
 * again. Top-level keys don't overlap (global already omits these), so a shallow
 * spread is correct.
 */
export function ScopedMessagesProvider({
  extra,
  children,
}: {
  extra: AbstractIntlMessages;
  children: React.ReactNode;
}) {
  const parent = useMessages();
  const locale = useLocale();
  const messages = useMemo(
    () => ({ ...(parent ?? {}), ...extra }),
    [parent, extra]
  );
  return (
    <IntlClientProvider locale={locale} messages={messages}>
      {children}
    </IntlClientProvider>
  );
}
