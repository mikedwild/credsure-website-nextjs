"use client";
import dynamic from "next/dynamic";
import PageShell from "@/components/PageShell";

const SecurityCompliance = dynamic(
  () => import("@/views/features/SecurityCompliance").then((m) => ({ default: m.SecurityCompliance })),
  { ssr: false }
);

export default function Page() {
  return (
    <PageShell>
      <SecurityCompliance />
    </PageShell>
  );
}
