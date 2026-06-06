"use client";
import dynamic from "next/dynamic";
import PageShell from "@/components/PageShell";

const TemplateDesigner = dynamic(
  () => import("@/views/features/TemplateDesigner").then((m) => ({ default: m.TemplateDesigner })),
  { ssr: false }
);

export default function Page() {
  return (
    <PageShell>
      <TemplateDesigner />
    </PageShell>
  );
}
