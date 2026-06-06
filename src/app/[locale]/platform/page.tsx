"use client";
import dynamic from "next/dynamic";
import PageShell from "@/components/PageShell";

const Platform = dynamic(
  () => import("@/views/Platform").then((m) => ({ default: m.Platform })),
  { ssr: false }
);

export default function Page() {
  return (
    <PageShell>
      <Platform />
    </PageShell>
  );
}
