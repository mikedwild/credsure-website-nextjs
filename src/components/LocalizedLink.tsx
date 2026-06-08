"use client";
/**
 * LocalizedLink — drop-in replacement for React Router's <Link to="...">.
 *
 * Callers pass a plain English path (`to="/pricing"`). This component:
 *   1. reads the active locale from the route params,
 *   2. translates the slug to that locale (pricing → preise for DE) via
 *      localePath, producing a fully-prefixed path (`/de/preise`),
 *   3. renders a plain next/link with that href.
 *
 * The previous version destructured `href` (which callers never pass) and
 * forwarded the unknown `to` prop to next-intl's <Link>, whose href was
 * therefore undefined — producing broken `/enundefined` links across the
 * entire site navigation.
 */
import NextLink from "next/link";
import { useParams } from "next/navigation";
import React, { ComponentProps } from "react";
import { localePath } from "@/utils/localePath";

type LocalizedLinkProps = Omit<ComponentProps<typeof NextLink>, "href"> & {
  to?: string;
  href?: string;
};

export const LocalizedLink = React.forwardRef<
  HTMLAnchorElement,
  LocalizedLinkProps
>(function LocalizedLink({ to, href, children, ...props }, ref) {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const target = href ?? to ?? "/";
  const resolved =
    target.startsWith("/en/") ||
    target.startsWith("/de/") ||
    target === "/en" ||
    target === "/de"
      ? target
      : localePath(target, locale);

  return (
    <NextLink ref={ref} href={resolved} {...props}>
      {children}
    </NextLink>
  );
});

export default LocalizedLink;
