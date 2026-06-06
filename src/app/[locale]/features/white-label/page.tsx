"use client";
import dynamic from "next/dynamic";
import PageShell from "@/components/PageShell";

const WhiteLabel = dynamic(
  () => import("@/views/features/WhiteLabel").then((m) => ({ default: m.WhiteLabel })),
  { ssr: false }
);

export default function Page() {
  return (
    <PageShell>
      <WhiteLabel />
    </PageShell>
  );
}
