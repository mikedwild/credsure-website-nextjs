"use client";
import dynamic from "next/dynamic";
import PageShell from "@/components/PageShell";

const GDPR = dynamic(
  () => import("@/views/GDPR").then((m) => ({ default: m.GDPR })),
  { ssr: false }
);

export default function Page() {
  return (
    <PageShell>
      <GDPR />
    </PageShell>
  );
}
