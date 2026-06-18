"use client";
/**
 * SolutionPageTemplate — unified Beamery-style template that powers every
 * vertical solution page (HigherEducation, Healthcare, CertificationBodies,
 * Associations, CorporateTraining, Manufacturing).
 *
 * Composes:
 *   - Split hero (text + `<ProductUIWindow>` with vertical-specific image)
 *   - `<CustomerCard>`  anchor story
 *   - `<PersonaPortrait>` × 3 (registrars / deans / career services etc.)
 *   - `<MetricStrip>` (uses existing solutionStats numbers from
 *     SolutionEnrichment)
 *   - `<SolutionHowItWorks>` (reused — works visually with current palette)
 *   - `<SolutionComparison>` (reused)
 *   - `<SolutionFAQ>` (reused)
 *   - `<TrustBand>` + final CTA
 *
 * One file change cascades across all 6 verticals.
 */
import React from 'react';
import { useTranslation } from '@/lib/useTranslation';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, TrendingUp, Award, ShieldCheck, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SEO } from '@/components/SEO';
import { useLocalizedNavigate } from '@/utils/useLocalizedNavigate';
import { ProductUIWindow, CustomerCard, PersonaPortrait, MetricStrip, TrustBand } from '@/components/system';
import { SolutionFAQ } from '@/components/SolutionFAQ';
import { SolutionHowItWorks, SolutionComparison } from '@/components/SolutionEnrichment';
import { solutionMedia } from '@/data/solutionMedia';

// Per-vertical 4-stat metric snapshots now live in i18n
// (solx.metrics.<solutionKey>, EN + DE). They mirror the SolutionStats
// numbers in SolutionEnrichment.jsx so we don't drift, but we render them
// inside the system `<MetricStrip>` for visual consistency with feature
// pages.
const METRIC_ICONS = [TrendingUp, Award, ShieldCheck, Globe];

export const SolutionPageTemplate = ({ solutionKey, Icon }) => {
  const t = useTranslation();
  const navigate = useLocalizedNavigate();
  const benefits = t(`pages.solutions.${solutionKey}.benefits`, { returnObjects: true });
  const safeBenefits = Array.isArray(benefits) ? benefits : [];
  const media = solutionMedia[solutionKey] || {};
  const rawMetrics = t(`solx.metrics.${solutionKey}`, { returnObjects: true });
  const metrics = (Array.isArray(rawMetrics) ? rawMetrics : []).map((m, i) => ({
    icon: METRIC_ICONS[i % METRIC_ICONS.length],
    stat: m.stat,
    label: m.label,
  }));

  // SEO labels — read straight from the already-loaded translation
  // bundle (matches the pattern used for benefits above).
  const seoTitleA = t(`pages.solutions.${solutionKey}.title`);
  const seoTitleB = t(`pages.solutions.${solutionKey}.titleHighlight`);
  const seoSubtitle = t(`pages.solutions.${solutionKey}.subtitle`);

  return (
    <>
      <SEO
        title={`${seoTitleA} ${seoTitleB}`.trim()}
        description={seoSubtitle}
      />
      <div className="min-h-screen" style={{ background: '#FFFFFF' }} data-testid={`solution-page-${solutionKey}`}>

        {/* ─── Hero — split layout ─── */}
        <section className="pt-28 pb-20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[640px] h-[640px] rounded-full blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(187,158,255,0.30) 0%, transparent 70%)' }} aria-hidden="true" />
          <div className="absolute -bottom-32 -left-32 w-[460px] h-[460px] rounded-full blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,184,158,0.25) 0%, transparent 70%)' }} aria-hidden="true" />

          <div className="container mx-auto px-6 md:px-12 relative z-10">
            <div className="grid lg:grid-cols-12 gap-12 items-center">
              <motion.div
                className="lg:col-span-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-6 rounded-full" style={{ background: 'rgba(91,34,214,0.06)', border: '1px solid rgba(91,34,214,0.18)' }}>
                  <Sparkles className="w-3.5 h-3.5" style={{ color: '#5B22D6' }} />
                  <span className="text-xs font-bold uppercase tracking-[0.18em] cs-grad-text">
                    {t(`pages.solutions.${solutionKey}.badge`)}
                  </span>
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#0F0E1A] leading-[1.05] mb-6">
                  {t(`pages.solutions.${solutionKey}.title`)}{' '}
                  <span className="cs-grad-text">{t(`pages.solutions.${solutionKey}.titleHighlight`)}</span>
                </h1>
                <p className="text-base md:text-lg text-[#2E2A3D] leading-relaxed mb-8 max-w-xl">
                  {t(`pages.solutions.${solutionKey}.subtitle`)}
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() => navigate('/demo')}
                    data-testid={`${solutionKey}-cta-primary`}
                    className="cs-btn cs-btn-gradient !rounded-full !px-7 !py-6 !text-base !font-bold"
                  >
                    {t('nav.bookDemo', 'Book a demo')}
                    <ArrowRight className="ml-1 w-5 h-5" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/platform')}
                    className="!bg-white !border-2 !border-[#0F0E1A] !text-[#0F0E1A] hover:!bg-[#0F0E1A] hover:!text-white !rounded-full !px-7 !py-6 !text-base !font-bold"
                  >
                    {t('solx.template.explorePlatform')}
                  </Button>
                </div>

                {Icon && (
                  <div className="mt-10 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-md" style={{ background: 'linear-gradient(135deg, #5B22D6 0%, #B82BC4 50%, #E83C5C 100%)' }}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-[#6A6478]">{t('solx.template.credsureSolutions')}</p>
                      <p className="text-sm font-bold text-[#0F0E1A]">{t('solx.template.builtFor')} {t(`pages.solutions.${solutionKey}.badge`)}</p>
                    </div>
                  </div>
                )}
              </motion.div>

              <motion.div
                className="lg:col-span-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                {media.hero?.src ? (
                  <div className="relative">
                    {/* Halo cushion removed — hero PNGs are transparent now,
                        so the pink/violet glow would bleed through every empty
                        pixel and tint the image. */}
                    <ProductUIWindow url={media.hero.urlBar} minHeight={460} className="relative">
                      <div className="w-full h-full flex items-center justify-center p-4" style={{ minHeight: 460 }}>
                        <img
                          src={media.hero.src}
                          alt={media.hero.alt || t(`pages.solutions.${solutionKey}.title`)}
                          loading="eager"
                          fetchPriority="high"
                          decoding="async"
                          className="max-w-full max-h-[440px] w-auto h-auto object-contain block"
                        />
                      </div>
                    </ProductUIWindow>
                  </div>
                ) : null}
              </motion.div>
            </div>
          </div>
        </section>

        {/* ─── Metrics strip ─── */}
        {metrics.length > 0 && (
          <section className="py-16" style={{ background: '#FAFAFC' }} data-testid={`${solutionKey}-metrics`}>
            <div className="container mx-auto px-6 md:px-12 max-w-6xl">
              <MetricStrip testId={`${solutionKey}-metric-strip`} metrics={metrics.slice(0, 3)} />
            </div>
          </section>
        )}

        {/* ─── Personas ─── */}
        {Array.isArray(media.personas) && media.personas.length > 0 && (
          <section className="py-24" data-testid={`${solutionKey}-personas`}>
            <div className="container mx-auto px-6 md:px-12 max-w-6xl">
              <div className="max-w-2xl mb-12">
                <p className="text-xs uppercase tracking-[0.18em] font-bold mb-3 cs-grad-text">{t('solx.template.forYourTeam')}</p>
                <h2 className="text-3xl md:text-4xl font-bold text-[#0F0E1A] tracking-tight leading-tight">
                  {t('solx.template.personasTitle')} <span className="cs-grad-text">{t('solx.template.personasTitleHighlight')}</span>
                </h2>
              </div>
              <div className="grid md:grid-cols-3 gap-5">
                {media.personas.map((p) => (
                  <PersonaPortrait
                    key={p.role}
                    tint={p.tint}
                    role={p.role}
                    title={p.title}
                    workflow={p.workflow}
                    workflowHref={p.workflowHref}
                    testId={`${solutionKey}-persona`}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ─── Anchor customer ─── */}
        {media.customer && (
          <section className="py-20" style={{ background: '#FAFAFC' }} data-testid={`${solutionKey}-customer`}>
            <div className="container mx-auto px-6 md:px-12 max-w-5xl">
              <div className="max-w-2xl mb-10">
                <p className="text-xs uppercase tracking-[0.18em] font-bold mb-3 cs-grad-text">{t('solx.template.customerStory')}</p>
                <h2 className="text-3xl md:text-4xl font-bold text-[#0F0E1A] tracking-tight leading-tight">
                  {t('solx.template.inProductionWith')} <span className="cs-grad-text">{media.customer.name}.</span>
                </h2>
              </div>
              <CustomerCard
                name={media.customer.name}
                industry={media.customer.industry}
                hq={media.customer.hq}
                employees={media.customer.employees}
                tags={media.customer.tags}
                quote={media.customer.quote}
                author={media.customer.author}
                caseStudyHref={media.customer.caseStudyHref}
                testId={`${solutionKey}-customer-card`}
              />
            </div>
          </section>
        )}

        {/* ─── Benefits (still i18n-driven, restyled as pastel grid) ─── */}
        {safeBenefits.length > 0 && (
          <section className="py-24" data-testid={`${solutionKey}-benefits`}>
            <div className="container mx-auto px-6 md:px-12 max-w-6xl">
              <div className="max-w-2xl mb-12">
                <p className="text-xs uppercase tracking-[0.18em] font-bold mb-3 cs-grad-text">{t('solx.template.whatYouShip')}</p>
                <h2 className="text-3xl md:text-4xl font-bold text-[#0F0E1A] tracking-tight leading-tight">
                  {t('solx.template.benefitsTitle')} <span className="cs-grad-text">{t('solx.template.benefitsTitleHighlight')}</span>
                </h2>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {safeBenefits.map((b, i) => (
                  <motion.div
                    key={b.title}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                    className="rounded-2xl p-6 h-full"
                    style={{ background: ['#F0DAD2', '#E2D4F2', '#D8E5DA', '#FCE7B5'][i % 4] }}
                    data-testid={`${solutionKey}-benefit-${i}`}
                  >
                    <p className="text-base font-bold text-[#0F0E1A] mb-2 tracking-tight">{b.title}</p>
                    <p className="text-sm text-[#0F0E1A]/80 leading-snug">{b.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ─── Reused enrichment sections ─── */}
        <SolutionHowItWorks solutionKey={solutionKey} />
        <SolutionComparison solutionKey={solutionKey} />
        <SolutionFAQ solutionKey={solutionKey} />

        {/* ─── Trust band ─── */}
        <section className="py-12">
          <div className="container mx-auto px-6 md:px-12 max-w-5xl">
            <TrustBand testId={`${solutionKey}-trust-band`} />
          </div>
        </section>

        {/* ─── Final CTA ─── */}
        <section className="py-20" style={{ background: '#FAFAFC' }}>
          <div className="container mx-auto px-6 md:px-12 max-w-3xl text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-[#0F0E1A] mb-5 tracking-tight leading-tight">
              {t('solx.template.ctaTitle')} <span className="cs-grad-text">{t('solx.template.ctaTitleHighlight')}</span>
            </h2>
            <p className="text-base md:text-lg text-[#2E2A3D] mb-8 max-w-xl mx-auto">
              {t('solx.template.ctaSubtitle')}
            </p>
            <Button
              onClick={() => navigate('/demo')}
              data-testid={`${solutionKey}-cta-bottom`}
              className="cs-btn cs-btn-gradient !rounded-full !px-9 !py-7 !text-base !font-bold"
            >
              {t('nav.bookDemo', 'Book a demo')}
              <ArrowRight className="ml-1 w-5 h-5" />
            </Button>
          </div>
        </section>
      </div>
    </>
  );
};

export default SolutionPageTemplate;
