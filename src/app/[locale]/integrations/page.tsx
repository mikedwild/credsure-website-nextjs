"use client";
import dynamic from "next/dynamic";
import PageShell from "@/components/PageShell";

const Integrations = dynamic(
  () => import("@/views/Integrations").then((m) => ({ default: m.Integrations })),
  { ssr: false }
);

export default function Page() {
  return (
    <PageShell>
      <Integrations />
    </PageShell>
  );
}
