"use client";
import React, { lazy, Suspense } from 'react';
import { LocalizedLink as Link } from '@/components/LocalizedLink';
import { Calculator } from 'lucide-react';
import { useTranslations as useTranslation } from 'next-intl';
import { useLocalizedNavigate } from '@/hooks/useLocalizedNavigate';
import { SEO, createBreadcrumbSchema, createPricingProductSchema, combineSchemas, getBaseUrl } from '@/components/SEO';
import { Pricing2026 } from '@/components/Pricing2026';
import LazyMount from '@/components/LazyMount';

// `PricingFeaturesComparison` is a heavy 2-language table — defer its
// chunk + hydration until the user scrolls toward it. Saves ~600 ms of
// initial-paint blocking time on slow CPUs.
const PricingFeaturesComparison = lazy(() =>
  import('../components/PricingFeaturesComparison').then(m => ({ default: m.PricingFeaturesComparison }))
);

export const Pricing = () => {
  const { t } = useTranslation();
  const navigate = useLocalizedNavigate();
  const baseUrl = getBaseUrl();

  const handleCtaClick = () => {
    navigate('/demo');
  };

  // PHASE 1 (P0): Breadcrumb schema
  const breadcrumbs = [
    { name: 'Home', path: '/' },
    { name: 'Pricing', path: '/pricing' }
  ];

  // PHASE 3 (P2): Product schema for pricing plans
  const pricingPlans = [
    {
      name: 'Free',
      description: 'Perfect for getting started with digital credentials',
      price: '0',
      billingPeriod: 'Monthly',
      priceValidUntil: '2026-12-31'
    },
    {
      name: 'Professional',
      description: 'For growing teams and organizations',
      price: '49',
      billingPeriod: 'Monthly',
      priceValidUntil: '2026-12-31'
    },
    {
      name: 'Enterprise',
      description: 'Custom solutions for large organizations',
      price: 'Custom',
      billingPeriod: 'Annual',
      priceValidUntil: '2026-12-31'
    }
  ];

  const combinedSchema = {
    "@context": "https://schema.org",
    "@graph": [
      createBreadcrumbSchema(breadcrumbs, baseUrl),
      ...pricingPlans.map(plan => createPricingProductSchema(plan, baseUrl))
    ]
  };

  return (
    <>
      <SEO
        titleKey="seo.pricing.title"
        descriptionKey="seo.pricing.description"
        keywordsKey="seo.pricing.keywords"
        canonical="/pricing"
        structuredData={combinedSchema}
      />
      <div>
        {/* ROI Calculator CTA Banner */}
        <div className="bg-gradient-to-r from-[#5B22D6] via-[#B82BC4] to-[#E22B8A] text-white py-12">
          <div className="container mx-auto px-6 lg:px-8 text-center">
            <Calculator className="w-12 h-12 mx-auto mb-4" />
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              {t('pricingBanner.title')}
            </h1>
            <p className="text-xl mb-6 opacity-90 max-w-2xl mx-auto">
              {t('pricingBanner.subtitle')}
            </p>
            <Link
              to="/roi-calculator"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#5B22D6] rounded-2xl font-bold text-lg hover:bg-gray-50 transition-colors shadow-xl"
            >
              <Calculator className="w-5 h-5" />
              {t('pricingBanner.cta')}
            </Link>
          </div>
        </div>
        
        <Pricing2026 onCtaClick={handleCtaClick} />
        <Suspense fallback={null}>
          <LazyMount minHeight={900} testId="lazy-pricing-features"><PricingFeaturesComparison /></LazyMount>
        </Suspense>
      </div>
    </>
  );
};