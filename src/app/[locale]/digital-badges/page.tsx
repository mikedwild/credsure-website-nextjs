"use client";
import dynamic from "next/dynamic";
import PageShell from "@/components/PageShell";

const DigitalBadges = dynamic(
  () => import("@/views/DigitalBadges").then((m) => ({ default: m.DigitalBadges })),
  { ssr: false }
);

export default function Page() {
  return (
    <PageShell>
      <DigitalBadges />
    </PageShell>
  );
}
