"use client";
/**
 * Features2026 — Beamery-style alternating feature rows.
 *
 * Replaces the legacy bento grid with three image-led rows, each pairing
 * a real CredSure product moment (rendered inside `<ProductUIWindow>`)
 * with a short headline + bullet list + ghost CTA. The rows alternate
 * left/right so the eye keeps moving as visitors scroll.
 *
 * Data is pulled from the existing `features.items.*` translation keys
 * (so EN/DE keep working) and enriched with hero images from
 * `featureMedia.js` so we don't duplicate URLs across the site.
 */
import React from 'react';
import { motion } from 'framer-motion';
import { useTranslations as useTranslation } from 'next-intl';
import { ArrowUpRight, Check, Sparkles } from 'lucide-react';
import { LocalizedLink as Link } from '@/components/LocalizedLink';
import { ProductUIWindow } from './system';
import { featureMedia } from '@/data/featureMedia';

const ROWS = [
  {
    key: 'sharing',
    href: '/features/sharing',
    mediaKey: 'sharing',
    eyebrow: 'Recipients become recruiters',
    bullets: [
      'One-click LinkedIn, X, WhatsApp, email shares',
      'Branded share images optimised per channel',
      'Recipient wall — every badge in one URL',
      '7× more shares than legacy issuers',
    ],
  },
  {
    key: 'analytics',
    href: '/features/analytics',
    mediaKey: 'analytics',
    eyebrow: 'Stop reporting in spreadsheets',
    bullets: [
      'Live dashboards on issuance, share velocity, verification',
      'Cohort, programme, and year comparisons',
      'CSV export for ops, dashboards for executives',
      'Forrester ROI lift baked into every metric',
    ],
  },
  {
    key: 'verification',
    href: '/features/verification',
    mediaKey: 'instantVerification',
    eyebrow: 'Border-grade verification',
    bullets: [
      '387ms p99 verification across 14 EU countries',
      'Polygon-anchored, eIDAS-trusted, GDPR-compliant',
      'Works on any device, on any signal — even offline',
      '98.4% verified on first scan',
    ],
  },
];

export const Features2026 = () => {
  const t = useTranslation();

  return (
    <section
      id="features"
      className="py-28 md:py-32 relative overflow-hidden"
      style={{ background: '#FFFFFF' }}
      data-testid="features-2026"
    >
      <div className="absolute top-0 right-0 w-[640px] h-[640px] rounded-full blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(187,158,255,0.18) 0%, transparent 70%)' }} aria-hidden="true" />

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-5 rounded-full" style={{ background: 'rgba(91,34,214,0.06)', border: '1px solid rgba(91,34,214,0.18)' }}>
            <Sparkles className="w-3.5 h-3.5" style={{ color: '#5B22D6' }} />
            <span className="text-xs font-bold uppercase tracking-[0.18em] cs-grad-text">
              {t('features2026.badge', 'Built into every workflow')}
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[#0F0E1A] leading-[1.05]">
            {t('features.title', 'Built for teams who ship credentials,')}{' '}
            <span className="cs-grad-text">{t('features2026.titleAccent', 'not paperwork.')}</span>
          </h2>
          <p className="mt-5 text-lg text-[#2E2A3D] max-w-2xl">
            {t('features.subtitle', 'Three product moments that turn credentials into recruiter-grade signal — without growing your team.')}
          </p>
        </motion.div>

        {/* Alternating rows */}
        <div className="space-y-24 md:space-y-28">
          {ROWS.map((row, i) => {
            const media = featureMedia[row.mediaKey] || {};
            const flipped = i % 2 === 1;
            return (
              <motion.div
                key={row.key}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.55, delay: 0.05 }}
                className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center"
                data-testid={`features-row-${row.key}`}
              >
                {/* Image */}
                <div className={`lg:col-span-6 ${flipped ? 'lg:order-2' : ''}`}>
                  {media.hero ? (
                    <div className="relative">
                      {/* Halo cushion removed — hero PNGs are transparent now. */}
                      <ProductUIWindow url={media.urlBar} minHeight={420} className="relative">
                        <div className="w-full h-full flex items-center justify-center p-4" style={{ minHeight: 420 }}>
                          <img
                            src={media.hero}
                            alt={media.alt || row.eyebrow}
                            loading="lazy"
                            decoding="async"
                            className="max-w-full max-h-[400px] w-auto h-auto object-contain block"
                          />
                        </div>
                      </ProductUIWindow>
                    </div>
                  ) : null}
                </div>

                {/* Text */}
                <div className={`lg:col-span-6 ${flipped ? 'lg:order-1' : ''}`}>
                  <p className="text-xs uppercase tracking-[0.18em] font-bold text-[#6A6478] mb-3">{row.eyebrow}</p>
                  <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-[#0F0E1A] leading-[1.1] mb-5">
                    {t(`features.items.${row.key}.title`)}
                  </h3>
                  <p className="text-base md:text-lg text-[#2E2A3D] leading-relaxed mb-6 max-w-xl">
                    {t(`features.items.${row.key}.description`)}
                  </p>
                  <ul className="space-y-2.5 mb-7">
                    {row.bullets.map(b => (
                      <li key={b} className="flex items-start gap-3 text-base text-[#0F0E1A]">
                        <Check className="w-4 h-4 mt-1 shrink-0" style={{ color: '#5B22D6' }} strokeWidth={3} />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to={row.href} className="cs-btn cs-btn-ghost" data-testid={`features-row-cta-${row.key}`}>
                    {t('features2026.learnMore', 'Learn more')} <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-24">
          <p className="text-base text-[#6A6478] mb-3">{t('featuresCta.ready', 'Ready to see the rest?')}</p>
          <Link
            to="/platform"
            className="inline-flex items-center gap-2 text-[#5B22D6] hover:text-[#3F2BD9] font-bold text-lg group"
            data-testid="features-explore-platform"
          >
            {t('features2026.explorePlatform', 'Explore the full platform')}
            <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
};
