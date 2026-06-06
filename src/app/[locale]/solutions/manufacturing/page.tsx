"use client";
import dynamic from "next/dynamic";
import PageShell from "@/components/PageShell";

const Manufacturing = dynamic(
  () => import("@/views/solutions/Manufacturing").then((m) => ({ default: m.Manufacturing })),
  { ssr: false }
);

export default function Page() {
  return (
    <PageShell>
      <Manufacturing />
    </PageShell>
  );
}
