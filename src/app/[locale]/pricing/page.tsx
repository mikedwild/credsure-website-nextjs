"use client";
import dynamic from "next/dynamic";
import PageShell from "@/components/PageShell";

const Pricing = dynamic(
  () => import("@/views/Pricing").then((m) => ({ default: m.Pricing })),
  { ssr: false }
);

export default function Page() {
  return (
    <PageShell>
      <Pricing />
    </PageShell>
  );
}
