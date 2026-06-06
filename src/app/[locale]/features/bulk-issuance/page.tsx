"use client";
import dynamic from "next/dynamic";
import PageShell from "@/components/PageShell";

const BulkIssuance = dynamic(
  () => import("@/views/features/BulkIssuance").then((m) => ({ default: m.BulkIssuance })),
  { ssr: false }
);

export default function Page() {
  return (
    <PageShell>
      <BulkIssuance />
    </PageShell>
  );
}
