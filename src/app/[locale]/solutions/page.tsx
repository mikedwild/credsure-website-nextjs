"use client";
import dynamic from "next/dynamic";
import PageShell from "@/components/PageShell";

const Solutions = dynamic(
  () => import("@/views/Solutions").then((m) => ({ default: m.Solutions })),
  { ssr: false }
);

export default function Page() {
  return (
    <PageShell>
      <Solutions />
    </PageShell>
  );
}
