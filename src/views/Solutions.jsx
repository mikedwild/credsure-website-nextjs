"use client";
/**
 * Solutions — vertical-by-vertical landing page (Beamery-style refresh).
 *
 * Each vertical card uses the system `<PersonaPortrait>` so visuals stay
 * consistent with feature pages, with a contextual headline + outcome line
 * + popular-workflow link. Anchored by a hero, a `<MetricStrip>` and a
 * `<TrustBand>` to seal credibility. Routes wire to the existing six
 * vertical solution pages so navigation never breaks.
 */
import React from 'react';
import { useTranslations as useTranslation } from 'next-intl';
import { motion } from 'framer-motion';
import { GraduationCap, HeartPulse, Stethoscope, Briefcase, Users, Factory, Sparkles, ArrowRight } from 'lucide-react';
import { SEO, createBreadcrumbSchema, getBaseUrl } from '@/components/SEO';
import { LocalizedLink as Link } from '@/components/LocalizedLink';
import { Button } from '@/components/ui/button';
import { useLocalizedNavigate } from '@/hooks/useLocalizedNavigate';
import { PersonaPortrait, MetricStrip, TrustBand } from '@/components/system';

// Six verticals already on the site — each links to its own page.
// Tints rotate through the system pastel palette so the grid feels alive.
const VERTICALS = [
  {
    key: 'higher-education',
    Icon: GraduationCap,
    tint: 'lavender',
    role: 'Higher Education',
    title: 'Diplomas, transcripts, skills passports — your alumni actually share.',
    workflow: 'Bulk-issue cohort',
    workflowHref: '/features/bulk-issuance',
    href: '/solutions/higher-education',
  },
  {
    key: 'healthcare',
    Icon: HeartPulse,
    tint: 'blush',
    role: 'Healthcare',
    title: 'Verify CME, licences, and HIPAA training in 387ms — at every shift change.',
    workflow: 'Mobile verification',
    workflowHref: '/features/verification',
    href: '/solutions/healthcare',
  },
  {
    key: 'certification-bodies',
    Icon: Stethoscope,
    tint: 'sage',
    role: 'Certification Bodies',
    title: 'From your exam platform to a verifiable credential — automatically.',
    workflow: 'Auto-issue triggers',
    workflowHref: '/features/auto-issue',
    href: '/solutions/certification-bodies',
  },
  {
    key: 'corporate-training',
    Icon: Briefcase,
    tint: 'butter',
    role: 'Corporate Training',
    title: 'Turn training into provable, portable skills your workforce brags about.',
    workflow: 'Workday integration',
    workflowHref: '/features/api-integration',
    href: '/solutions/corporate-training',
  },
  {
    key: 'associations',
    Icon: Users,
    tint: 'peach',
    role: 'Associations',
    title: 'Renew membership. Reward expertise. Both with one credential platform.',
    workflow: 'Member portal',
    workflowHref: '/features/recipient-wall',
    href: '/solutions/associations',
  },
  {
    key: 'manufacturing',
    Icon: Factory,
    tint: 'lavender',
    role: 'Manufacturing',
    title: 'Every operator. Every shift. Verified in 387ms — even on the line.',
    workflow: 'Mobile verification',
    workflowHref: '/features/verification',
    href: '/solutions/manufacturing',
  },
];

const HERO_METRICS = [
  { icon: GraduationCap, stat: '500+', label: 'Universities, training providers and corporates running on CredSure' },
  { icon: HeartPulse,    stat: '12M+', label: 'Verifiable credentials issued — across 45 countries' },
  { icon: Briefcase,     stat: '387ms', label: 'p99 verification — even offline, even at the bedside' },
];

export const Solutions = () => {
  const t = useTranslation();
  const navigate = useLocalizedNavigate();
  const baseUrl = getBaseUrl();
  const breadcrumbs = [{ name: 'Home', path: '/' }, { name: 'Solutions', path: '/solutions' }];

  return (
    <div className="min-h-screen" style={{ background: '#FFFFFF' }} data-testid="solutions-index">
      <SEO
        titleKey="seo.solutions.title"
        descriptionKey="seo.solutions.description"
        keywordsKey="seo.solutions.keywords"
        canonical="/solutions"
        structuredData={createBreadcrumbSchema(breadcrumbs, baseUrl)}
      />

      {/* Hero */}
      <section className="pt-28 pb-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[640px] h-[640px] rounded-full blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(187,158,255,0.30) 0%, transparent 70%)' }} aria-hidden="true" />
        <div className="absolute -bottom-32 -left-32 w-[460px] h-[460px] rounded-full blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,184,158,0.25) 0%, transparent 70%)' }} aria-hidden="true" />

        <div className="container mx-auto px-6 md:px-12 relative z-10 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-6 rounded-full" style={{ background: 'rgba(91,34,214,0.06)', border: '1px solid rgba(91,34,214,0.18)' }}>
              <Sparkles className="w-3.5 h-3.5" style={{ color: '#5B22D6' }} />
              <span className="text-xs font-bold uppercase tracking-[0.18em] cs-grad-text">
                {t('pages.solutions.badge', 'Solutions for every team')}
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#0F0E1A] leading-[1.05] mb-6 max-w-4xl">
              {t('pages.solutions.heroTitle', 'Built for teams that')}{' '}
              <span className="cs-grad-text">{t('pages.solutions.heroTitleHighlight', 'ship credentials.')}</span>
            </h1>
            <p className="text-base md:text-lg text-[#2E2A3D] leading-relaxed max-w-2xl">
              {t('pages.solutions.heroSubtitle', 'From higher-ed registrars to manufacturing HSE leads, CredSure powers credential workflows wherever trust matters most.')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Metric strip */}
      <section className="pb-16">
        <div className="container mx-auto px-6 md:px-12 max-w-6xl">
          <MetricStrip testId="solutions-metric-strip" metrics={HERO_METRICS} />
        </div>
      </section>

      {/* Vertical grid */}
      <section className="py-16" data-testid="solutions-grid">
        <div className="container mx-auto px-6 md:px-12 max-w-6xl">
          <div className="max-w-2xl mb-12">
            <p className="text-xs uppercase tracking-[0.18em] font-bold mb-3 cs-grad-text">By industry</p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#0F0E1A] tracking-tight leading-tight">
              Pick your team. <span className="cs-grad-text">See the workflow.</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {VERTICALS.map((v) => (
              <motion.div
                key={v.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45 }}
                data-testid={`solutions-vertical-${v.key}`}
                className="relative group"
              >
                {/* Whole-card click target. Keep the PersonaPortrait's own
                    inner "Popular workflow" link interactive by raising
                    its z-index above this overlay. */}
                <Link
                  to={v.href}
                  aria-label={`Explore ${v.role} solution`}
                  className="absolute inset-0 z-10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#5B22D6]"
                  data-testid={`solutions-vertical-${v.key}-link`}
                />
                <PersonaPortrait
                  tint={v.tint}
                  role={v.role}
                  title={v.title}
                  workflow={v.workflow}
                  workflowHref={v.workflowHref}
                  testId="solutions-card"
                />
                <span className="hidden">popular workflow link is rendered inside PersonaPortrait with its own z-index above the overlay</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust band */}
      <section className="py-12">
        <div className="container mx-auto px-6 md:px-12 max-w-5xl">
          <TrustBand testId="solutions-trust-band" />
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20" style={{ background: '#FAFAFC' }}>
        <div className="container mx-auto px-6 md:px-12 max-w-3xl text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-[#0F0E1A] mb-5 tracking-tight leading-tight">
            Don&apos;t see your team? <span className="cs-grad-text">Talk to us.</span>
          </h2>
          <p className="text-base md:text-lg text-[#2E2A3D] mb-8 max-w-xl mx-auto">
            We power credential workflows across 22 verticals. Tell us about yours.
          </p>
          <Button
            onClick={() => navigate('/demo')}
            data-testid="solutions-cta-bottom"
            className="cs-btn cs-btn-gradient !rounded-full !px-9 !py-7 !text-base !font-bold"
          >
            {t('nav.bookDemo', 'Book a demo')}
            <ArrowRight className="ml-1 w-5 h-5" />
          </Button>
        </div>
      </section>
    </div>
  );
};
