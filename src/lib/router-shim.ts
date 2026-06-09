"use client";
import React from "react";
import NextLink, { type LinkProps as NextLinkProps } from "next/link";
import { useRouter, usePathname } from "next/navigation";

export { usePathname } from "next/navigation";
export { useParams } from "next/navigation";

/**
 * React Router's useNavigate() returns a FUNCTION you call as navigate('/path')
 * or navigate(-1). next/navigation's useRouter() returns an OBJECT ({push,...}).
 * The CRA codebase calls `const navigate = useNavigate(); navigate('/demo')`,
 * which would invoke the router object as a function and throw — silently
 * breaking every nav CTA, the mega-menu, breadcrumbs, and the language switcher.
 * This wrapper restores the callable React Router signature.
 */
export function useNavigate() {
  const router = useRouter();
  return (to: string | number, options?: { replace?: boolean }) => {
    if (typeof to === "number") {
      if (typeof window !== "undefined") window.history.go(to);
      return;
    }
    if (options?.replace) router.replace(to);
    else router.push(to);
  };
}

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

// useSearchParams shim — React Router's useSearchParams() returns a
// [searchParams, setSearchParams] TUPLE, but next/navigation's returns the
// ReadonlyURLSearchParams object DIRECTLY. The CRA codebase destructures it
// (`const [searchParams] = useSearchParams()`); applied to next's return value
// that grabs the first [key,value] entry (or undefined) instead of the params
// object, so `.get(...)` throws and crashes the page. This wrapper restores the
// React Router tuple signature.
import { useSearchParams as useNextSearchParams } from "next/navigation";

export function useSearchParams() {
  const params = useNextSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const setSearchParams = (
    next:
      | URLSearchParams
      | Record<string, string>
      | ((prev: URLSearchParams) => URLSearchParams | Record<string, string>)
  ) => {
    const prev = new URLSearchParams(params?.toString() ?? "");
    const resolved = typeof next === "function" ? next(prev) : next;
    const sp = resolved instanceof URLSearchParams ? resolved : new URLSearchParams(resolved);
    const qs = sp.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };
  return [params, setSearchParams] as const;
}

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
