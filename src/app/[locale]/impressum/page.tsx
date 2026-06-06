"use client";
import dynamic from "next/dynamic";
import PageShell from "@/components/PageShell";

const Impressum = dynamic(
  () => import("@/views/Impressum").then((m) => ({ default: m.Impressum })),
  { ssr: false }
);

export default function Page() {
  return (
    <PageShell>
      <Impressum />
    </PageShell>
  );
}
