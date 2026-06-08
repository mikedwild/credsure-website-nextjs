"use client";
import dynamic from "next/dynamic";

// Admin SPA shell (auth, blog editor, settings incl. AI/API keys, users).
// Client-only: it relies on localStorage/session and has no SEO value.
const AdminPanel = dynamic(() => import("@/views/AdminPanel"), { ssr: false });

export default function AdminRoute() {
  return <AdminPanel />;
}
