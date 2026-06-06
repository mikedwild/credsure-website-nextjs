"use client";
import dynamic from "next/dynamic";
import PageShell from "@/components/PageShell";

const CompareCredly = dynamic(
  () => import("@/views/compare/CompareCredly").then((m) => ({ default: m.CompareCredly })),
  { ssr: false }
);

export default function Page() {
  return (
    <PageShell>
      <CompareCredly />
    </PageShell>
  );
}
