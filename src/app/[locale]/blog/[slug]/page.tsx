"use client";
import dynamic from "next/dynamic";
import PageShell from "@/components/PageShell";

const BlogPost = dynamic(
  () => import("@/views/BlogPost").then((m) => ({ default: m.BlogPost })),
  { ssr: false }
);

export default function Page({ params }: { params: { slug: string } }) {
  return (
    <PageShell>
      <BlogPost />
    </PageShell>
  );
}
