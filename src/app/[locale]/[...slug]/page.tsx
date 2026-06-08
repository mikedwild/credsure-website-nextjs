"use client";
/**
 * Catch-all locale route.
 *
 * The site was migrated from a CRA + React Router app that served every page
 * through a single catch-all that looked the slug up in `routeConfig` — which
 * defines BOTH an English and a localized German slug for each page
 * (e.g. pricing ↔ preise, platform ↔ plattform, solutions ↔ loesungen).
 *
 * The Next.js migration only created explicit folders for the English slugs,
 * so every German localized URL (the entire DE navigation) and several
 * EN pages without folders (webinars, contact, customer-success, use-cases…)
 * returned 404. This catch-all restores the original behaviour: resolve any
 * EN or DE slug to its view. Explicit folders still take routing precedence,
 * so nothing that already worked changes.
 */
import { useParams } from "next/navigation";
import { Suspense } from "react";
import PageShell from "@/components/PageShell";
import {
  enToRoute,
  deToRoute,
  NotFound,
} from "@/config/routeConfig";
import { localePath } from "@/utils/localePath";
import { useRouter } from "@/i18n/navigation";
import { useEffect } from "react";

type RouteEntry = {
  en: string;
  de: string;
  component?: React.ComponentType;
  redirectTo?: string;
};

export default function CatchAllPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as string) || "en";
  const slug = Array.isArray(params.slug)
    ? params.slug.join("/")
    : (params.slug as string) || "";

  // Resolve the slug against the active locale first, then the other locale,
  // so both /de/preise and /en/pricing land on the same component.
  const en = enToRoute as Record<string, RouteEntry>;
  const de = deToRoute as Record<string, RouteEntry>;
  const route =
    (locale === "de" ? de[slug] : en[slug]) || en[slug] || de[slug];

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
