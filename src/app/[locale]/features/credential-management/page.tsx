"use client";
import dynamic from "next/dynamic";
import PageShell from "@/components/PageShell";

const CredentialManagement = dynamic(
  () => import("@/views/features/CredentialManagement").then((m) => ({ default: m.CredentialManagement })),
  { ssr: false }
);

export default function Page() {
  return (
    <PageShell>
      <CredentialManagement />
    </PageShell>
  );
}
