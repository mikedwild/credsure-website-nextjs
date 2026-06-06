"use client";
import dynamic from "next/dynamic";
import PageShell from "@/components/PageShell";

const CompareAccredible = dynamic(
  () => import("@/views/compare/CompareAccredible").then((m) => ({ default: m.CompareAccredible })),
  { ssr: false }
);

export default function Page() {
  return (
    <PageShell>
      <CompareAccredible />
    </PageShell>
  );
}
