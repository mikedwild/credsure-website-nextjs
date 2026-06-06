"use client";
import React from 'react';
import { useLocalizedNavigate } from '@/utils/useLocalizedNavigate';
import { useTranslations as useTranslation } from 'next-intl';
import { useLocation } from '@/lib/router-shim';
import { motion } from 'framer-motion';
import { CheckCircle, Sparkles, ArrowRight, ShieldCheck, Award, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SEO, createSpeakableSchema, createFAQSchema, combineSchemas, getBaseUrl } from '@/components/SEO';
import { featureContent } from '@/data/featureContent';
import { featureMedia } from '@/data/featureMedia';
import { ProductUIWindow, MetricStrip, TrustBand } from '@/components/system';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

// Persona tints rotated across capability cards so the grid feels alive
// without breaking the site palette.
const TINTS = ['#F0DAD2', '#E2D4F2', '#D8E5DA', '#FCE7B5', '#F8D9E1'];
const METRIC_ICONS = [Zap, ShieldCheck, Award];

export const FeaturePageTemplate = ({ featureKey, Icon }) => {
  const t = useTranslation();
  const navigate = useLocalizedNavigate();
  const location = useLocation();
  const baseUrl = getBaseUrl();
  const items = t(`features.${featureKey}.items`, { returnObjects: true });
  const title = t(`features.${featureKey}.title`);
  const titleWords = title.split(' ');
  const mainTitle = titleWords.slice(0, -1).join(' ');
  const highlightTitle = titleWords.slice(-1)[0];
  const subtitle = t(`features.${featureKey}.subtitle`);
  const badge = t(`features.${featureKey}.badge`);

  const content = featureContent[featureKey] || {};
  const media = featureMedia[featureKey] || {};
  const faqData = content.faq || [];

  const schemas = [];
  if (content.description) {
    schemas.push(createSpeakableSchema(
      { title, description: content.description },
      ['h1', '.feature-description', 'h2']
    ));
  }
  if (faqData.length > 0) {
    const faqSchema = createFAQSchema(
      faqData.map(f => ({ question: f.q, answer: f.a })),
      baseUrl,
      location.pathname
    );
    if (faqSchema) schemas.push(faqSchema);
  }

  return (
    <div className="min-h-screen" style={{ background: '#FFFFFF' }} data-testid={`feature-page-${featureKey}`}>
      <SEO
        title={badge}
        description={subtitle}
        structuredData={schemas.length > 0 ? combineSchemas(...schemas) : undefined}
      />

      {/* ─── Hero — split layout (text left, product image right) ─── */}
      <section className="pt-28 pb-20 relative overflow-hidden">
        {/* Ambient orbs — same wash as homepage */}
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

              <p className="feature-description text-base md:text-lg text-[#2E2A3D] leading-relaxed mb-8 max-w-xl">
                {subtitle}
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => navigate('/demo')}
                  data-testid={`${featureKey}-cta-primary`}
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

              {/* Trust strip — feature icon + tagline */}
              <div className="mt-10 flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-md" style={{ background: 'linear-gradient(135deg, #5B22D6 0%, #B82BC4 50%, #E83C5C 100%)' }}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-[#6A6478]">CredSure Platform</p>
                  <p className="text-sm font-bold text-[#0F0E1A]">Built into every workflow</p>
                </div>
              </div>
            </motion.div>

            {/* Right — product image inside Mac-chrome window */}
            <motion.div
              className="lg:col-span-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {media.hero ? (
                <div className="relative">
                  {/* The radial-halo cushion used to sit behind the image to soften
                      its hard white edges. Hero PNGs are now transparent, so the
                      halo would bleed through every empty pixel and read as the
                      page itself being tinted pink. Removed deliberately. */}
                  {media.composed ? (
                    /* Pre-composed marketing tile: image already has its own
                       headline + structure baked in. Now exported with a
                       proper alpha channel, so render it directly on the
                       page gradient — no white card, no border. */
                    <img
                      src={media.hero}
                      alt={media.alt || title}
                      loading="eager"
                      fetchPriority="high"
                      decoding="async"
                      className="relative block w-full h-auto"
                      data-testid={`${featureKey}-composed-hero`}
                    />
                  ) : (
                    /* Standard feature/use-case hero — image floats directly
                       on the page gradient. ProductUIWindow now only reserves
                       layout space (CLS prevention); no chrome, no card. */
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
                  )}
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

      {/* ─── Detailed description band ─── */}
      {content.description && (
        <section className="py-16 border-t" style={{ background: '#FAFAFC', borderColor: '#ECE7F1' }}>
          <div className="container mx-auto px-6 md:px-12 max-w-4xl">
            <p className="text-lg md:text-xl text-[#2E2A3D] leading-relaxed text-center">
              {content.description}
            </p>
          </div>
        </section>
      )}

      {/* ─── Key Capabilities — pastel-tinted grid ─── */}
      {Array.isArray(items) && items.length > 0 && (
        <section className="py-24" data-testid={`${featureKey}-capabilities`}>
          <div className="container mx-auto px-6 md:px-12 max-w-6xl">
            <div className="max-w-2xl mb-12">
              <p className="text-xs uppercase tracking-[0.18em] font-bold mb-3 cs-grad-text">Capabilities</p>
              <h2 className="text-3xl md:text-4xl font-bold text-[#0F0E1A] tracking-tight leading-tight">
                Everything you need to make this <span className="cs-grad-text">work at scale.</span>
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {items.map((item, i) => (
                <motion.div
                  key={`cap-${i}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (i % 3) * 0.08 }}
                  className="rounded-2xl p-6 h-full"
                  style={{ background: TINTS[i % TINTS.length] }}
                  data-testid={`${featureKey}-cap-${i}`}
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

      {/* ─── Metrics strip — system MetricStrip on cream band ─── */}
      {content.metrics && content.metrics.length > 0 && (
        <section className="py-20" style={{ background: '#FAFAFC' }} data-testid={`${featureKey}-metrics`}>
          <div className="container mx-auto px-6 md:px-12 max-w-6xl">
            <div className="max-w-2xl mb-10">
              <p className="text-xs uppercase tracking-[0.18em] font-bold mb-3 cs-grad-text">Proof in numbers</p>
              <h2 className="text-3xl md:text-4xl font-bold text-[#0F0E1A] tracking-tight leading-tight">
                Metrics that matter.
              </h2>
            </div>
            <MetricStrip
              testId={`${featureKey}-metric-strip`}
              metrics={content.metrics.slice(0, 3).map((m, i) => ({
                icon: METRIC_ICONS[i % METRIC_ICONS.length],
                stat: m.value,
                label: m.label,
              }))}
            />
          </div>
        </section>
      )}

      {/* ─── Use cases ─── */}
      {content.useCases && content.useCases.length > 0 && (
        <section className="py-24" data-testid={`${featureKey}-use-cases`}>
          <div className="container mx-auto px-6 md:px-12 max-w-6xl">
            <div className="max-w-2xl mb-12">
              <p className="text-xs uppercase tracking-[0.18em] font-bold mb-3 cs-grad-text">In production</p>
              <h2 className="text-3xl md:text-4xl font-bold text-[#0F0E1A] tracking-tight leading-tight">
                How teams use this <span className="cs-grad-text">today.</span>
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {content.useCases.map((uc, i) => (
                <motion.article
                  key={`uc-${i}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="rounded-2xl p-7 h-full"
                  style={{ background: '#FFFFFF', border: '1px solid #ECE7F1', boxShadow: '0 12px 30px -16px rgba(15,14,26,0.10)' }}
                >
                  <div className="w-10 h-10 mb-5 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #5B22D6 0%, #B82BC4 50%, #E83C5C 100%)' }}>
                    <span className="text-white font-bold text-sm">{i + 1}</span>
                  </div>
                  <h3 className="text-lg font-bold text-[#0F0E1A] mb-2 tracking-tight">{uc.title}</h3>
                  <p className="text-sm text-[#2E2A3D] leading-relaxed">{uc.desc}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── FAQ ─── */}
      {faqData.length > 0 && (
        <section className="py-24" style={{ background: '#FAFAFC' }} data-testid={`${featureKey}-faq`}>
          <div className="container mx-auto px-6 md:px-12 max-w-3xl">
            <div className="text-center mb-12">
              <p className="text-xs uppercase tracking-[0.18em] font-bold mb-3 cs-grad-text">FAQ</p>
              <h2 className="text-3xl md:text-4xl font-bold text-[#0F0E1A] tracking-tight leading-tight">
                Frequently asked.
              </h2>
            </div>
            <Accordion type="single" collapsible className="space-y-3">
              {faqData.map((faq, index) => (
                <AccordionItem
                  key={`faq-${index}`}
                  value={`faq-${index}`}
                  className="bg-white border rounded-2xl px-6"
                  style={{ borderColor: '#ECE7F1' }}
                >
                  <AccordionTrigger className="text-left text-base font-bold text-[#0F0E1A] hover:text-[#5B22D6] py-5">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-[#2E2A3D] leading-relaxed pb-5">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      )}

      {/* ─── Trust band ─── */}
      <section className="py-12">
        <div className="container mx-auto px-6 md:px-12 max-w-5xl">
          <TrustBand testId={`${featureKey}-trust-band`} />
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="py-20" style={{ background: '#FAFAFC' }}>
        <div className="container mx-auto px-6 md:px-12 max-w-3xl text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-[#0F0E1A] mb-5 tracking-tight leading-tight">
            Ready to <span className="cs-grad-text">see it live?</span>
          </h2>
          <p className="text-base md:text-lg text-[#2E2A3D] mb-8 max-w-xl mx-auto">
            See how CredSure transforms credentialing for your team. Personalised demo, 15 minutes.
          </p>
          <Button
            onClick={() => navigate('/demo')}
            data-testid={`${featureKey}-cta-bottom`}
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
