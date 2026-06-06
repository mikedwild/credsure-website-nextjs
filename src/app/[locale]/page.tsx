"use client";
import dynamic from "next/dynamic";
import { Suspense, lazy } from "react";
import PageShell from "@/components/PageShell";
import { useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";

const Hero2026 = dynamic(() =>
  import("@/components/Hero2026").then((m) => ({ default: m.Hero2026 }))
);
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
const DemoVideo = dynamic(() =>
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
const ROICalculator = dynamic(() =>
  import("@/components/ROICalculator").then((m) => ({ default: m.ROICalculator }))
);
const G2Badges = dynamic(() =>
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
const HomepageTrustBand = dynamic(() =>
  import("@/components/HomepageTrustBand").then((m) => ({
    default: m.HomepageTrustBand,
  }))
);
const CTASection = dynamic(() =>
  import("@/components/CTASection").then((m) => ({ default: m.CTASection }))
);

export default function HomePage() {
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
        <DemoVideo />
        <IndustryUseCases />
        <Benefits />
        <Pricing2026 onCtaClick={handleCtaClick} />
        <ROICalculator onCtaClick={handleCtaClick} />
        <G2Badges />
        <Testimonials2026 />
        <FAQ />
        <HomepageTrustBand />
        <CTASection onCtaClick={handleCtaClick} />
      </Suspense>
    </PageShell>
  );
}
