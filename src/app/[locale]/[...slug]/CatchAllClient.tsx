"use client";
import { Suspense, useEffect } from "react";
import PageShell from "@/components/PageShell";
import { enToRoute, deToRoute, NotFound } from "@/config/routeConfig";
import { localePath } from "@/utils/localePath";
import { useRouter } from "@/i18n/navigation";

type RouteEntry = {
  en: string;
  de: string;
  component?: React.ComponentType;
  redirectTo?: string;
};

export function CatchAllClient({
  locale,
  slug,
}: {
  locale: string;
  slug: string;
}) {
  const router = useRouter();

  const en = enToRoute as Record<string, RouteEntry>;
  const de = deToRoute as Record<string, RouteEntry>;
  const route = (locale === "de" ? de[slug] : en[slug]) || en[slug] || de[slug];

  // Legacy → canonical redirects (e.g. terms → policies/terms).
  useEffect(() => {
    if (route && route.redirectTo) {
      router.replace(localePath(`/${route.redirectTo}`, locale));
    }
  }, [route, router, locale]);

  if (!route || route.redirectTo) {
    if (!route) {
      return (
        <PageShell>
          <NotFound />
        </PageShell>
      );
    }
    return <PageShell>{null}</PageShell>;
  }

  const Component = route.component;
  if (!Component) {
    return (
      <PageShell>
        <NotFound />
      </PageShell>
    );
  }
  return (
    <PageShell>
      <Suspense fallback={null}>
        <Component />
      </Suspense>
    </PageShell>
  );
}
