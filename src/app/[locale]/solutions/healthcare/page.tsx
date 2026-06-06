"use client";
import dynamic from "next/dynamic";
import PageShell from "@/components/PageShell";

const Healthcare = dynamic(
  () => import("@/views/solutions/Healthcare").then((m) => ({ default: m.Healthcare })),
  { ssr: false }
);

export default function Page() {
  return (
    <PageShell>
      <Healthcare />
    </PageShell>
  );
}
