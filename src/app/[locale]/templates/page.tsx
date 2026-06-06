"use client";
import dynamic from "next/dynamic";
import PageShell from "@/components/PageShell";

const Templates = dynamic(
  () => import("@/views/Templates").then((m) => ({ default: m.Templates })),
  { ssr: false }
);

export default function Page() {
  return (
    <PageShell>
      <Templates />
    </PageShell>
  );
}
