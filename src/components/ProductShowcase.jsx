"use client";
/**
 * ProductShowcase — single-tab Beamery-style product moment.
 *
 * The legacy version pointed to four `/images/product/*.webp` files that
 * never shipped, so the section rendered four broken images on every
 * homepage load. This rewrite pivots to one focused product moment using
 * the analytics dashboard inside `<ProductUIWindow>`, with a tabbed text
 * column on the left that highlights what the product can do.
 *
 * Translation keys are reused from the original component
 * (`productShowcase.{manage,secure,share,analytics}.{title,description,stats}`)
 * so EN/DE keep working without locale-file edits.
 */
import React, { useState } from 'react';
import { useTranslation } from '@/lib/useTranslation';
import { LayoutDashboard, Shield, Share2, BarChart3 } from 'lucide-react';
import { PillarTabs, ProductUIWindow } from './system';
import { featureMedia } from '@/data/featureMedia';

const TAB_KEYS = ['manage', 'secure', 'share', 'analytics'];
const TAB_ICONS = { manage: LayoutDashboard, secure: Shield, share: Share2, analytics: BarChart3 };

// Each tab points to a real product image already mapped in featureMedia.
const TAB_TO_MEDIA = {
  manage: 'credentialManagement',
  secure: 'blockchain',
  share: 'sharing',
  analytics: 'analytics',
};

export const ProductShowcase = () => {
  const t = useTranslation();
  const [activeKey, setActiveKey] = useState('manage');
  const media = featureMedia[TAB_TO_MEDIA[activeKey]] || {};

  return (
    <section className="py-24 md:py-28 relative overflow-hidden" style={{ background: '#FFFFFF' }} data-testid="product-showcase">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(187,158,255,0.18) 0%, transparent 70%)' }} aria-hidden="true" />

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="max-w-3xl mb-12">
          <p className="text-xs uppercase tracking-[0.18em] font-bold mb-3 cs-grad-text">{t('productShowcase.featured', 'A live product moment')}</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-[#0F0E1A] leading-[1.1]">
            {t('productShowcase.title', 'Everything you need to')}{' '}
            <span className="cs-grad-text">{t('productShowcase.titleHighlight', 'ship credentials at scale.')}</span>
          </h2>
          <p className="mt-4 text-base md:text-lg text-[#2E2A3D] max-w-2xl">
            {t('productShowcase.subtitle', 'One platform. Four workflows. Switch between Manage, Secure, Share and Analyze without leaving the page.')}
          </p>
        </div>

        <PillarTabs
          tabs={TAB_KEYS.map(key => ({
            key,
            label: t(`productShowcase.${key}.title`, key.charAt(0).toUpperCase() + key.slice(1)),
            icon: TAB_ICONS[key],
          }))}
          activeKey={activeKey}
          onChange={setActiveKey}
          testIdPrefix="product-tab"
          className="mb-10"
        />

        <div className="grid lg:grid-cols-12 gap-12 items-center" data-testid={`product-panel-${activeKey}`}>
          <div className="lg:col-span-5">
            <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-[#0F0E1A] leading-tight mb-4">
              {t(`productShowcase.${activeKey}.title`)}
            </h3>
            <p className="text-base md:text-lg text-[#2E2A3D] leading-relaxed mb-6">
              {t(`productShowcase.${activeKey}.description`)}
            </p>
            <ul className="space-y-2.5">
              {(Array.isArray(t(`productShowcase.${activeKey}.stats`, { returnObjects: true })) ? t(`productShowcase.${activeKey}.stats`, { returnObjects: true }) : []).map((stat, idx) => (
                <li key={`stat-${idx}`} className="flex items-start gap-3 text-base text-[#0F0E1A]">
                  <span className="w-1.5 h-1.5 mt-2.5 rounded-full shrink-0" style={{ background: '#5B22D6' }} aria-hidden="true" />
                  <span>{stat}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-7">
            {media.hero ? (
              <div className="relative">
                {/* Halo cushion removed — hero PNGs are transparent now. */}
                <ProductUIWindow url={media.urlBar} minHeight={420} className="relative">
                  <div className="w-full h-full flex items-center justify-center p-4" style={{ minHeight: 420 }}>
                    <img
                      src={media.hero}
                      alt={media.alt || t(`productShowcase.${activeKey}.title`)}
                      loading="lazy"
                      decoding="async"
                      className="max-w-full max-h-[400px] w-auto h-auto object-contain block"
                    />
                  </div>
                </ProductUIWindow>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
};
