"use client";
import dynamic from "next/dynamic";
import { Toaster } from "./ui/sonner";
import { ThemeProvider } from "./ThemeProvider";
import { CurrencyProvider } from "@/utils/CurrencyContext";
import { SkipLinks } from "./SkipLinks";
import { ScrollToTop } from "./ScrollToTop";
// Header + Footer are SSR'd (static import): they carry the whole internal-link
// graph (mega-menu + footer), so crawlers/AI bots must see them in the raw HTML,
// and rendering them server-side removes the post-hydration chrome pop-in (CLS).
// Both verified free of render-time browser/location access.
import { HeaderWithMegaMenu } from "./HeaderWithMegaMenu";
import { Footer } from "./Footer";

const CookieConsent = dynamic(
  () => import("./CookieConsent").then((m) => ({ default: m.CookieConsent })),
  { ssr: false }
);
const StickyBottomBar = dynamic(
  () => import("./StickyBottomBar").then((m) => ({ default: m.StickyBottomBar })),
  { ssr: false }
);
const ExitIntentPopup = dynamic(
  () => import("./ExitIntentPopup").then((m) => ({ default: m.ExitIntentPopup })),
  { ssr: false }
);

export default function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <CurrencyProvider>
        <SkipLinks />
        <ScrollToTop />
        <Toaster position="top-right" />
        <HeaderWithMegaMenu />
        <div className="pt-20">
          <main id="main-content" role="main">
            {children}
          </main>
        </div>
        <Footer />
        <CookieConsent />
        <StickyBottomBar />
        <ExitIntentPopup onSubmit={() => {}} />
      </CurrencyProvider>
    </ThemeProvider>
  );
}
