"use client";
import dynamic from "next/dynamic";
import PageShell from "@/components/PageShell";

const Features = dynamic(
  () => import("@/views/Features").then((m) => ({ default: m.Features })),
  { ssr: false }
);

export default function Page() {
  return (
    <PageShell>
      <Features />
    </PageShell>
  );
}
