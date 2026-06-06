"use client";
import dynamic from "next/dynamic";
import PageShell from "@/components/PageShell";

const ApiIntegration = dynamic(
  () => import("@/views/features/ApiIntegration").then((m) => ({ default: m.ApiIntegration })),
  { ssr: false }
);

export default function Page() {
  return (
    <PageShell>
      <ApiIntegration />
    </PageShell>
  );
}
