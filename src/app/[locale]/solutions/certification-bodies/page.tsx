"use client";
import dynamic from "next/dynamic";
import PageShell from "@/components/PageShell";

const CertificationBodies = dynamic(
  () => import("@/views/solutions/CertificationBodies").then((m) => ({ default: m.CertificationBodies })),
  { ssr: false }
);

export default function Page() {
  return (
    <PageShell>
      <CertificationBodies />
    </PageShell>
  );
}
