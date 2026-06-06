"use client";
import dynamic from "next/dynamic";
import PageShell from "@/components/PageShell";

const Resources = dynamic(
  () => import("@/views/Resources").then((m) => ({ default: m.Resources })),
  { ssr: false }
);

export default function Page() {
  return (
    <PageShell>
      <Resources />
    </PageShell>
  );
}
