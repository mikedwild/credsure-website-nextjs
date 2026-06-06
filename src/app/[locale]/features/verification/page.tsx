"use client";
import dynamic from "next/dynamic";
import PageShell from "@/components/PageShell";

const InstantVerification = dynamic(
  () => import("@/views/features/InstantVerification").then((m) => ({ default: m.InstantVerification })),
  { ssr: false }
);

export default function Page() {
  return (
    <PageShell>
      <InstantVerification />
    </PageShell>
  );
}
