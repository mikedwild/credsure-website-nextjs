"use client";
import dynamic from "next/dynamic";
import { Toaster } from "./ui/sonner";
import { ThemeProvider } from "./ThemeProvider";

const HeaderWithMegaMenu = dynamic(
  () => import("./HeaderWithMegaMenu").then((m) => ({ default: m.HeaderWithMegaMenu })),
  { ssr: false }
);
const Footer = dynamic(
  () => import("./Footer").then((m) => ({ default: m.Footer })),
  { ssr: false }
);
const CookieConsent = dynamic(
  () => import("./CookieConsent").then((m) => ({ default: m.CookieConsent })),
  { ssr: false }
);

export default function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <Toaster position="top-right" />
      <HeaderWithMegaMenu />
      <div className="pt-20">
        <main id="main-content" role="main">
          {children}
        </main>
      </div>
      <Footer />
      <CookieConsent />
    </ThemeProvider>
  );
}
