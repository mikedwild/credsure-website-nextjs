"use client";
import dynamic from "next/dynamic";
import PageShell from "@/components/PageShell";

const CustomDomains = dynamic(
  () => import("@/views/features/CustomDomains").then((m) => ({ default: m.CustomDomains })),
  { ssr: false }
);

export default function Page() {
  return (
    <PageShell>
      <CustomDomains />
    </PageShell>
  );
}
