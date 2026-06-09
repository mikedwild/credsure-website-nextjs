"use client";
import dynamic from "next/dynamic";
import { Suspense } from "react";

// Admin SPA shell (auth, blog editor, settings incl. AI/API keys, users).
// Client-only: it relies on localStorage/session and has no SEO value.
const AdminPanel = dynamic(() => import("@/views/AdminPanel"), { ssr: false });

export default function AdminRoute() {
  // Suspense boundary required: AdminPanel uses useSearchParams(), which
  // de-opts to client rendering and must be wrapped or the prod build throws
  // the global "This page couldn't load" error.
  return (
    <Suspense fallback={null}>
      <AdminPanel />
    </Suspense>
  );
}
