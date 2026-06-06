"use client";
export { useRouter as useNavigate } from "next/navigation";
export { usePathname } from "next/navigation";
export { useParams } from "next/navigation";

// Link shim
export { default as Link } from "next/link";

// Navigate component shim (redirect)
export { redirect as Navigate } from "next/navigation";

// useSearchParams
export { useSearchParams } from "next/navigation";

// useLocation shim
export function useLocation() {
  if (typeof window !== "undefined") {
    return {
      pathname: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
    };
  }
  return { pathname: "/", search: "", hash: "" };
}
