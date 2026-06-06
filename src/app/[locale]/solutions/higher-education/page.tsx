"use client";
import dynamic from "next/dynamic";
import PageShell from "@/components/PageShell";

const HigherEducation = dynamic(
  () => import("@/views/solutions/HigherEducation").then((m) => ({ default: m.HigherEducation })),
  { ssr: false }
);

export default function Page() {
  return (
    <PageShell>
      <HigherEducation />
    </PageShell>
  );
}
