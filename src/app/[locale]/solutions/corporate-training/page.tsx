"use client";
import dynamic from "next/dynamic";
import PageShell from "@/components/PageShell";

const CorporateTraining = dynamic(
  () => import("@/views/solutions/CorporateTraining").then((m) => ({ default: m.CorporateTraining })),
  { ssr: false }
);

export default function Page() {
  return (
    <PageShell>
      <CorporateTraining />
    </PageShell>
  );
}
