"use client";
import dynamic from "next/dynamic";
import PageShell from "@/components/PageShell";

const ROICalculatorPage = dynamic(
  () => import("@/views/ROICalculatorPage").then((m) => ({ default: m.ROICalculatorPage })),
  { ssr: false }
);

export default function Page() {
  return (
    <PageShell>
      <ROICalculatorPage />
    </PageShell>
  );
}
