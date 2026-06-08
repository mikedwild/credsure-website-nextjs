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
  return <HomeClient />;
}
