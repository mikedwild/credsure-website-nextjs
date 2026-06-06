"use client";
import dynamic from "next/dynamic";
import PageShell from "@/components/PageShell";

const Tutorials = dynamic(
  () => import("@/views/Tutorials").then((m) => ({ default: m.Tutorials })),
  { ssr: false }
);

export default function Page() {
  return (
    <PageShell>
      <Tutorials />
    </PageShell>
  );
}
