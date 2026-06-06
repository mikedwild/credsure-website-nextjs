"use client";
import dynamic from "next/dynamic";
import PageShell from "@/components/PageShell";

const SignIn = dynamic(
  () => import("@/views/SignIn").then((m) => ({ default: m.SignIn })),
  { ssr: false }
);

export default function Page() {
  return (
    <PageShell>
      <SignIn />
    </PageShell>
  );
}
