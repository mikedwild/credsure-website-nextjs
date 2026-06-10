/**
 * Locale home page (server wrapper).
 * Emits real homepage metadata server-side; renders the client homepage.
 */
import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/pageMetadata";
import { HomeClient } from "./HomeClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata(locale, "");
}

export default function HomePage() {
  return (
    <>
      {/* Preload the hero image — it's the mobile LCP element. Without this the
          browser only discovers it deep in the ~336KB HTML (after CSS), so a
          tiny 26KB webp starts downloading late and LCP lands ~4.8s on Slow 4G.
          srcset/sizes mirror the <picture> in Hero2026.jsx. */}
      <link
        rel="preload"
        as="image"
        href="/img/heroes/hero-passport-800.webp"
        imageSrcSet="/img/heroes/hero-passport-480.webp 480w, /img/heroes/hero-passport-800.webp 800w, /img/heroes/hero-passport-1200.webp 1200w"
        imageSizes="(max-width: 640px) 480px, (max-width: 1024px) 600px, 800px"
        fetchPriority="high"
      />
      <HomeClient />
    </>
  );
}
