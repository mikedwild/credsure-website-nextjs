"use client";
import dynamic from "next/dynamic";
import PageShell from "@/components/PageShell";

const CredentialSharing = dynamic(
  () => import("@/views/features/CredentialSharing").then((m) => ({ default: m.CredentialSharing })),
  { ssr: false }
);

export default function Page() {
  return (
    <PageShell>
      <CredentialSharing />
    </PageShell>
  );
}
