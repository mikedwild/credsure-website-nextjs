"use client";
import dynamic from "next/dynamic";
import PageShell from "@/components/PageShell";

const Demo = dynamic(
  () => import("@/views/Demo").then((m) => ({ default: m.Demo })),
  { ssr: false }
);

export default function Page() {
  return (
    <PageShell>
      <Demo />
    </PageShell>
  );
}
