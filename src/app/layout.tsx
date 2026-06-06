import type { Metadata } from "next";
import "./globals.css";
import "../styles/beamery-system.css";

export const metadata: Metadata = {
  title: {
    default: "Credsure — Digital Credential Management",
    template: "%s | Credsure",
  },
  description:
    "Issue, manage and verify digital credentials and badges at scale. Blockchain-verified, instant, and beautifully designed.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://credsure.io"
  ),
  openGraph: {
    type: "website",
    images: ["/og-image.webp"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
