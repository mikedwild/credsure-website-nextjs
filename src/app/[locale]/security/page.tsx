"use client";
import dynamic from "next/dynamic";
import PageShell from "@/components/PageShell";

const Security = dynamic(
  () => import("@/views/Security").then((m) => ({ default: m.Security })),
  { ssr: false }
);

export default function Page() {
  return (
    <PageShell>
      <Security />
    </PageShell>
  );
}
