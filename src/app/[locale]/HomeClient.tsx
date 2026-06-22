"use client";
import dynamic from "next/dynamic";
import { Suspense, lazy } from "react";
import PageShell from "@/components/PageShell";
import LazyMount from "@/components/LazyMount";
// Hero is the mobile LCP element. Static-import it so it ships in this chunk
// and renders the moment HomeClient loads — a dynamic() import would add an
// extra round-trip in front of the largest paint.
import { Hero2026 } from "@/components/Hero2026";
import { useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";

const CustomerLogos = dynamic(() =>
  import("@/components/CustomerLogos").then((m) => ({ default: m.CustomerLogos }))
);
const StatsSection = dynamic(() =>
  import("@/components/StatsSection").then((m) => ({ default: m.StatsSection }))
);
const BeameryPlatform = dynamic(() =>
  import("@/components/BeameryPlatform").then((m) => ({ default: m.BeameryPlatform }))
);
const ProductShowcase = dynamic(() =>
  import("@/components/ProductShowcase").then((m) => ({ default: m.ProductShowcase }))
);
const Features2026 = dynamic(() =>
  import("@/components/Features2026").then((m) => ({ default: m.Features2026 }))
);
// Below-fold, JS-heavy widgets with negligible crawlable text — deferred via
// React.lazy + <LazyMount> (the project's established pattern, see Platform.jsx)
// so their chunks leave the critical path and stop starving the hero image of
// bandwidth on slow mobile. Content/text sections stay SSR'd for crawlers.
const DemoVideo = lazy(() =>
  import("@/components/DemoVideo").then((m) => ({ default: m.DemoVideo }))
);
const IndustryUseCases = dynamic(() =>
  import("@/components/IndustryUseCases").then((m) => ({ default: m.IndustryUseCases }))
);
const Benefits = dynamic(() =>
  import("@/components/Benefits").then((m) => ({ default: m.Benefits }))
);
const Pricing2026 = dynamic(() =>
  import("@/components/Pricing2026").then((m) => ({ default: m.Pricing2026 }))
);
const ROICalculator = lazy(() =>
  import("@/components/ROICalculator").then((m) => ({ default: m.ROICalculator }))
);
const G2Badges = lazy(() =>
  import("@/components/G2Badges").then((m) => ({ default: m.G2Badges }))
);
const Testimonials2026 = dynamic(() =>
  import("@/components/Testimonials2026").then((m) => ({
    default: m.Testimonials2026,
  }))
);
const FAQ = dynamic(() =>
  import("@/components/FAQ").then((m) => ({ default: m.FAQ }))
);
const HomepageTrustBand = lazy(() =>
  import("@/components/HomepageTrustBand").then((m) => ({
    default: m.HomepageTrustBand,
  }))
);
const CTASection = dynamic(() =>
  import("@/components/CTASection").then((m) => ({ default: m.CTASection }))
);

export function HomeClient() {
  const router = useRouter();
  const locale = useLocale();
  const handleCtaClick = () => router.push("/demo");

  return (
    <PageShell>
      <Hero2026 />
      <Suspense fallback={null}>
        <CustomerLogos />
        <StatsSection />
        <BeameryPlatform />
        <ProductShowcase />
        <Features2026 />
        <LazyMount minHeight={620} testId="lazy-home-demo-video">
          <DemoVideo />
        </LazyMount>
        <IndustryUseCases />
        <Benefits />
        <Pricing2026 onCtaClick={handleCtaClick} />
        <LazyMount minHeight={760} testId="lazy-home-roi-calculator">
          <ROICalculator onCtaClick={handleCtaClick} />
        </LazyMount>
        <LazyMount minHeight={420} testId="lazy-home-g2-badges">
          <G2Badges />
        </LazyMount>
        <Testimonials2026 />
        <FAQ />
        <LazyMount minHeight={320} testId="lazy-home-trust-band">
          <HomepageTrustBand />
        </LazyMount>
        <CTASection onCtaClick={handleCtaClick} />
      </Suspense>
    </PageShell>
  );
}
