"use client";
import dynamic from "next/dynamic";
import PageShell from "@/components/PageShell";

const Privacy = dynamic(
  () => import("@/views/Privacy").then((m) => ({ default: m.Privacy })),
  { ssr: false }
);

export default function Page() {
  return (
    <PageShell>
      <Privacy />
    </PageShell>
  );
}
