"use client";
import React from "react";
import NextLink, { type LinkProps as NextLinkProps } from "next/link";

export { useRouter as useNavigate } from "next/navigation";
export { usePathname } from "next/navigation";
export { useParams } from "next/navigation";

// Link shim — accepts React Router's `to` prop and maps it to Next's `href`,
// so legacy `<Link to="...">` usages from the CRA codebase keep working.
// Passing `to` to next/link leaves `href` undefined, which throws a fatal
// render error and surfaces Next's global "This page couldn't load" page.
type ShimLinkProps = Omit<NextLinkProps, "href"> & {
  href?: NextLinkProps["href"];
  to?: NextLinkProps["href"];
  children?: React.ReactNode;
  className?: string;
  [key: string]: unknown;
};

export const Link = React.forwardRef<HTMLAnchorElement, ShimLinkProps>(
  function Link({ to, href, ...props }, ref) {
    const resolved = href ?? to ?? "#";
    return React.createElement(NextLink, { ...props, href: resolved, ref });
  }
);

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
