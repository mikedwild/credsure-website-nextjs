"use client";
import dynamic from "next/dynamic";
import PageShell from "@/components/PageShell";

const Terms = dynamic(
  () => import("@/views/Terms").then((m) => ({ default: m.Terms })),
  { ssr: false }
);

export default function Page() {
  return (
    <PageShell>
      <Terms />
    </PageShell>
  );
}
