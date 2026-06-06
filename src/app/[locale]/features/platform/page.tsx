"use client";
import dynamic from "next/dynamic";
import PageShell from "@/components/PageShell";

const PlatformFeatures = dynamic(
  () => import("@/views/features/PlatformFeatures").then((m) => ({ default: m.PlatformFeatures })),
  { ssr: false }
);

export default function Page() {
  return (
    <PageShell>
      <PlatformFeatures />
    </PageShell>
  );
}
