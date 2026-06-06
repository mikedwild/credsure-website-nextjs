"use client";
import dynamic from "next/dynamic";
import PageShell from "@/components/PageShell";

const BlockchainVerification = dynamic(
  () => import("@/views/features/BlockchainVerification").then((m) => ({ default: m.BlockchainVerification })),
  { ssr: false }
);

export default function Page() {
  return (
    <PageShell>
      <BlockchainVerification />
    </PageShell>
  );
}
