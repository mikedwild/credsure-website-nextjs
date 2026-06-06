"use client";
import dynamic from "next/dynamic";
import PageShell from "@/components/PageShell";

const AutoIssue = dynamic(
  () => import("@/views/features/AutoIssue").then((m) => ({ default: m.AutoIssue })),
  { ssr: false }
);

export default function Page() {
  return (
    <PageShell>
      <AutoIssue />
    </PageShell>
  );
}
