import { getMessages } from "next-intl/server";
import { IntlClientProvider } from "@/components/IntlClientProvider";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Inter } from "next/font/google";

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

  const messages = await getMessages();

  return (
    <html lang={locale} className={inter.className} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col">
        <IntlClientProvider locale={locale} messages={messages}>
          {children}
        </IntlClientProvider>
      </body>
    </html>
  );
}
