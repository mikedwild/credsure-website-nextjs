"use client";
import dynamic from "next/dynamic";
import PageShell from "@/components/PageShell";

const AnalyticsInsights = dynamic(
  () => import("@/views/features/AnalyticsInsights").then((m) => ({ default: m.AnalyticsInsights })),
  { ssr: false }
);

export default function Page() {
  return (
    <PageShell>
      <AnalyticsInsights />
    </PageShell>
  );
}
