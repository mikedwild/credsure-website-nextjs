"use client";
import { NextIntlClientProvider, type AbstractIntlMessages } from "next-intl";

/**
 * Client wrapper around NextIntlClientProvider so we can attach the
 * onError / getMessageFallback handlers. These can't live in the
 * Server Component layout because functions can't cross the RSC boundary.
 *
 * Without a client-side error handler, every missing/invalid message
 * throws during client render, which loops the error boundary and
 * eventually crashes the renderer ("This page couldn't load").
 */
export function IntlClientProvider({
  locale,
  messages,
  children,
}: {
  locale: string;
  messages: AbstractIntlMessages;
  children: React.ReactNode;
}) {
  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      onError={() => {
        // Degrade gracefully — do not throw on missing/invalid messages.
      }}
      getMessageFallback={({ key }) => key.split(".").pop() ?? key}
    >
      {children}
    </NextIntlClientProvider>
  );
}
