"use client";
import React from 'react';
import { useLocalizedNavigate } from '@/utils/useLocalizedNavigate';
import { useTranslations as useTranslation } from 'next-intl';
import { motion } from 'framer-motion';
import { CheckCircle, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SEO, createSpeakableSchema, getBaseUrl } from '@/components/SEO';
import { useCaseMedia } from '@/data/featureMedia';
import { ProductUIWindow, TrustBand } from '@/components/system';

// Pastel tint rotation reused from FeaturePageTemplate so a/b layouts stay
// visually consistent across the site.
const TINTS = ['#F0DAD2', '#E2D4F2', '#D8E5DA', '#FCE7B5', '#F8D9E1'];

export const UseCasePageTemplate = ({ useCaseKey, Icon }) => {
  const { t } = useTranslation();
  const navigate = useLocalizedNavigate();
  const baseUrl = getBaseUrl();
  const items = t(`useCases.${useCaseKey}.items`, { returnObjects: true });
  const title = t(`useCases.${useCaseKey}.title`);
  const titleWords = title.split(' ');
  const mainTitle = titleWords.slice(0, -1).join(' ');
  const highlightTitle = titleWords.slice(-1)[0];
  const subtitle = t(`useCases.${useCaseKey}.subtitle`);
  const badge = t(`useCases.${useCaseKey}.badge`);
  const media = useCaseMedia[useCaseKey] || {};

  const speakableSchema = createSpeakableSchema(
    { title, description: subtitle },
    ['h1', 'h2', '.use-case-description']
  );

  return (
    <div className="min-h-screen" style={{ background: '#FFFFFF' }} data-testid={`use-case-page-${useCaseKey}`}>
      <SEO
        title={badge}
        description={subtitle}
        structuredData={speakableSchema}
      />

      {/* ─── Hero — split layout ─── */}
      <section className="pt-28 pb-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[640px] h-[640px] rounded-full blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(187,158,255,0.30) 0%, transparent 70%)' }} aria-hidden="true" />
        <div className="absolute -bottom-32 -left-32 w-[460px] h-[460px] rounded-full blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,184,158,0.25) 0%, transparent 70%)' }} aria-hidden="true" />

        <div className="container mx-auto px-6 md:px-12 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left — text */}
            <motion.div
              className="lg:col-span-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-6 rounded-full" style={{ background: 'rgba(91,34,214,0.06)', border: '1px solid rgba(91,34,214,0.18)' }}>
                <Sparkles className="w-3.5 h-3.5" style={{ color: '#5B22D6' }} />
                <span className="text-xs font-bold uppercase tracking-[0.18em] cs-grad-text">{badge}</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#0F0E1A] leading-[1.05] mb-6">
                {mainTitle}{' '}
                <span className="cs-grad-text">{highlightTitle}</span>
              </h1>

              <p className="use-case-description text-base md:text-lg text-[#2E2A3D] leading-relaxed mb-8 max-w-xl">
                {subtitle}
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => navigate('/demo')}
                  data-testid={`${useCaseKey}-cta-primary`}
                  className="cs-btn cs-btn-gradient !rounded-full !px-7 !py-6 !text-base !font-bold"
                >
                  {t('nav.bookDemo')}
                  <ArrowRight className="ml-1 w-5 h-5" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/platform')}
                  className="!bg-white !border-2 !border-[#0F0E1A] !text-[#0F0E1A] hover:!bg-[#0F0E1A] hover:!text-white !rounded-full !px-7 !py-6 !text-base !font-bold"
                >
                  Explore platform
                </Button>
              </div>
            </motion.div>

            {/* Right — image inside Mac-chrome window */}
            <motion.div
              className="lg:col-span-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {media.hero ? (
                <div className="relative">
                  {/* Halo cushion removed — hero PNGs are transparent now,
                      so the pink/violet glow would bleed through every empty
                      pixel and tint the image. */}
                  <ProductUIWindow url={media.urlBar} minHeight={460} className="relative">
                    <div className="w-full h-full flex items-center justify-center p-4" style={{ minHeight: 460 }}>
                      <img
                        src={media.hero}
                        alt={media.alt || title}
                        loading="eager"
                        fetchPriority="high"
                        decoding="async"
                        className="max-w-full max-h-[440px] w-auto h-auto object-contain block"
                      />
                    </div>
                  </ProductUIWindow>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[460px] rounded-2xl" style={{ background: '#F8F5FB', border: '1px solid #ECE7F1' }}>
                  <div className="w-32 h-32 rounded-3xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #5B22D6 0%, #B82BC4 50%, #E83C5C 100%)' }}>
                    <Icon className="w-16 h-16 text-white" />
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── What you get — pastel-tinted grid ─── */}
      {Array.isArray(items) && items.length > 0 && (
        <section className="py-24" data-testid={`${useCaseKey}-items`}>
          <div className="container mx-auto px-6 md:px-12 max-w-6xl">
            <div className="max-w-2xl mb-12">
              <p className="text-xs uppercase tracking-[0.18em] font-bold mb-3 cs-grad-text">What teams ship</p>
              <h2 className="text-3xl md:text-4xl font-bold text-[#0F0E1A] tracking-tight leading-tight">
                Everything you need <span className="cs-grad-text">in one place.</span>
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {items.map((item, i) => (
                <motion.div
                  key={`uc-item-${i}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (i % 3) * 0.08 }}
                  className="rounded-2xl p-6 h-full"
                  style={{ background: TINTS[i % TINTS.length] }}
                  data-testid={`${useCaseKey}-item-${i}`}
                >
                  <div className="w-10 h-10 mb-4 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.65)' }}>
                    <CheckCircle className="w-5 h-5" style={{ color: '#0F0E1A' }} strokeWidth={2.2} />
                  </div>
                  <p className="text-base font-bold text-[#0F0E1A] leading-snug">{item}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Trust band ─── */}
      <section className="py-12" style={{ background: '#FAFAFC' }}>
        <div className="container mx-auto px-6 md:px-12 max-w-5xl">
          <TrustBand testId={`${useCaseKey}-trust-band`} />
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="py-20">
        <div className="container mx-auto px-6 md:px-12 max-w-3xl text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-[#0F0E1A] mb-5 tracking-tight leading-tight">
            Ready to <span className="cs-grad-text">put this to work?</span>
          </h2>
          <p className="text-base md:text-lg text-[#2E2A3D] mb-8 max-w-xl mx-auto">
            See how CredSure fits your stack with a 15-minute personalised demo.
          </p>
          <Button
            onClick={() => navigate('/demo')}
            data-testid={`${useCaseKey}-cta-bottom`}
            className="cs-btn cs-btn-gradient !rounded-full !px-9 !py-7 !text-base !font-bold"
          >
            {t('nav.bookDemo')}
            <ArrowRight className="ml-1 w-5 h-5" />
          </Button>
        </div>
      </section>
    </div>
  );
};
