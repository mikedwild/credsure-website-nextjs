"use client";
import dynamic from "next/dynamic";
import PageShell from "@/components/PageShell";

const HelpCenter = dynamic(
  () => import("@/views/HelpCenter").then((m) => ({ default: m.HelpCenter })),
  { ssr: false }
);

export default function Page() {
  return (
    <PageShell>
      <HelpCenter />
    </PageShell>
  );
}
