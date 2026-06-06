"use client";
import dynamic from "next/dynamic";
import PageShell from "@/components/PageShell";

const AboutUs = dynamic(
  () => import("@/views/AboutUs").then((m) => ({ default: m.AboutUs })),
  { ssr: false }
);

export default function Page() {
  return (
    <PageShell>
      <AboutUs />
    </PageShell>
  );
}
