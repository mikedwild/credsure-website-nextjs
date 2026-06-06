"use client";
import { Link, usePathname } from "@/i18n/navigation";
import { ComponentProps } from "react";

type LocalizedLinkProps = ComponentProps<typeof Link>;

export const LocalizedLink = ({ href, children, ...props }: LocalizedLinkProps) => {
  return (
    <Link href={href} {...props}>
      {children}
    </Link>
  );
};

export default LocalizedLink;
