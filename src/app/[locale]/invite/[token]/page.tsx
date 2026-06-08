"use client";
import dynamic from "next/dynamic";

// Public invite-acceptance landing (/:locale/invite/:token) → Google OAuth.
const InviteAccept = dynamic(() => import("@/views/InviteAccept"), { ssr: false });

export default function InviteRoute() {
  return <InviteAccept />;
}
