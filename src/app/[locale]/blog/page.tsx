"use client";
import dynamic from "next/dynamic";
import PageShell from "@/components/PageShell";

const Blog = dynamic(
  () => import("@/views/Blog").then((m) => ({ default: m.Blog })),
  { ssr: false }
);

export default function Page() {
  return (
    <PageShell>
      <Blog />
    </PageShell>
  );
}
