"use client";
import dynamic from "next/dynamic";
import PageShell from "@/components/PageShell";

const Associations = dynamic(
  () => import("@/views/solutions/Associations").then((m) => ({ default: m.Associations })),
  { ssr: false }
);

export default function Page() {
  return (
    <PageShell>
      <Associations />
    </PageShell>
  );
}
