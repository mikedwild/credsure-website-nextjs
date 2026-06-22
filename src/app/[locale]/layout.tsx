import { getMessages } from "next-intl/server";
import { IntlClientProvider } from "@/components/IntlClientProvider";
import { getGlobalMessages } from "@/i18n/messageScopes";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Inter } from "next/font/google";
import { organizationJsonLd, websiteJsonLd } from "@/lib/orgSchema";
import { GtmScripts, PostHogScript } from "@/components/AnalyticsScripts";

const inter = Inter({ subsets: ["latin"] });

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "en" | "de")) {
    notFound();
  }

  // Global provider ships everything EXCEPT the route-isolated blog + legal
  // namespaces (~77 KB). Those are merged back on their own routes via
  // <ScopedMessagesProvider>, keeping them off the homepage + marketing-page
  // RSC flight (the dominant mobile-LCP cost).
  const messages = await getGlobalMessages(await getMessages(), locale);

  return (
    <html lang={locale} className={inter.className} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col">
        <GtmScripts />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd()),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteJsonLd(locale)),
          }}
        />
        <IntlClientProvider locale={locale} messages={messages}>
          {children}
        </IntlClientProvider>
        <PostHogScript />
      </body>
    </html>
  );
}
