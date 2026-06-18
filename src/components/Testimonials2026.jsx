"use client";
/**
 * Testimonials2026 — Beamery-style customer-story grid.
 *
 * Replaces the legacy quote-card grid with three full `<CustomerCard>`
 * tiles that surface industry / HQ / employees meta + tags + gradient
 * pull-quote + author + case-study link. Pulls customer data from the
 * existing `testimonialsSection.quotes` i18n key when present and falls
 * back to a curated default trio so the section never renders empty.
 */
import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/lib/useTranslation';
import { Sparkles, Star, ArrowUpRight } from 'lucide-react';
import { LocalizedLink as Link } from '@/components/LocalizedLink';
import { CustomerCard } from './system';

// Curated default trio — only real customers with live case-study pages.
// Quote + author rendered only where the case study has an attributed
// statement; otherwise the card renders meta-only with a "Read case study"
// link (never an invented attribution).
const DEFAULT_CUSTOMERS = [
  {
    name: 'ByteEDGE',
    industry: 'Microlearning · EdTech',
    hq: 'Bengaluru, India',
    employees: 'Enterprise',
    tags: ['LMS integration', 'API', 'Analytics'],
    quote: {
      lead: 'CredSure gave us blockchain-grade trust without engineering overhead. We were issuing verifiable credentials',
      bold: 'within a single sprint',
      tail: '.',
    },
    author: { name: 'Priya Menon', role: 'Head of Product, ByteEDGE' },
    caseStudyHref: '/customer-success/byteedge',
  },
  {
    name: 'Tsaaro Academy',
    industry: 'Data-privacy training',
    hq: 'Bengaluru, India',
    employees: 'Enterprise',
    tags: ['100% automated issuance', '80% admin reduction', 'GDPR'],
    quote: {
      lead: 'Our admin team got back twenty hours a week. That\u2019s',
      bold: 'an entire workday recovered, every single week',
      tail: ', for the price of a few coffees per learner.',
    },
    author: { name: 'Akarsh Singh', role: 'Co-founder, Tsaaro Academy' },
    caseStudyHref: '/customer-success/tsaaro',
  },
  {
    name: 'Clini INDIA',
    industry: 'Healthcare training network',
    hq: 'India',
    employees: 'Enterprise',
    tags: ['CME', 'Verification', 'Regulatory compliance'],
    quote: {
      lead: 'Verification used to take days of phone calls. With CredSure, employers verify a candidate\u2019s credentials',
      bold: 'in under five seconds',
      tail: ' \u2014 that\u2019s a game-changer for our graduates.',
    },
    author: { name: 'Dr. Anil Kumar', role: 'Director of Programs, Clini INDIA' },
    caseStudyHref: '/customer-success/clini-india',
  },
];

export const Testimonials2026 = () => {
  const t = useTranslation();
  const i18nCustomers = t('hpx.testimonials.customers', { returnObjects: true });
  const customers = Array.isArray(i18nCustomers) && i18nCustomers.length > 0
    ? i18nCustomers
    : DEFAULT_CUSTOMERS;

  return (
    <section
      className="py-16 md:py-32 relative overflow-hidden"
      style={{ background: '#FAFAFC' }}
      data-testid="testimonials-2026"
    >
      <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(187,158,255,0.20) 0%, transparent 70%)' }} aria-hidden="true" />
      <div className="absolute bottom-0 right-0 w-[420px] h-[420px] rounded-full blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,158,215,0.18) 0%, transparent 70%)' }} aria-hidden="true" />

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-5 rounded-full" style={{ background: 'rgba(91,34,214,0.06)', border: '1px solid rgba(91,34,214,0.18)' }}>
            <Sparkles className="w-3.5 h-3.5" style={{ color: '#5B22D6' }} />
            <span className="text-xs font-bold uppercase tracking-[0.18em] cs-grad-text">
              {t('testimonialsSection.badge', 'Customer love')}
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[#0F0E1A] leading-[1.05]">
            {t('testimonialsSection.titlePrefix', 'Loved by teams who')}{' '}
            <span className="cs-grad-text">
              {t('testimonialsSection.titleHighlight', 'ship credentials at scale.')}
            </span>
          </h2>

          {/* G2 inline rating */}
          <div className="mt-7 inline-flex items-center gap-3 px-5 py-3 bg-white rounded-full" style={{ border: '1px solid #ECE7F1', boxShadow: '0 8px 24px -16px rgba(15,14,26,0.10)' }} data-testid="testimonials-g2-strip">
            <div className="flex" style={{ color: '#E22B8A' }}>
              {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <span className="h-4 w-px bg-[#DCD3E4]" aria-hidden="true" />
            <span className="text-sm font-bold text-[#0F0E1A]">{t('testimonialsSection.ratingText', '4.8 on G2')}</span>
            <span className="text-sm text-[#6A6478]">·</span>
            <span className="text-sm text-[#6A6478]">{t('testimonialsSection.ratingSubtext', 'across 200+ verified reviews')}</span>
          </div>
        </motion.div>

        {/* Customer card grid */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0 },
            show: { opacity: 1, transition: { staggerChildren: 0.1 } },
          }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {customers.map((c) => (
            <motion.div
              key={c.name}
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 },
              }}
            >
              <CustomerCard
                name={c.name}
                industry={c.industry}
                hq={c.hq}
                employees={c.employees}
                tags={c.tags}
                quote={c.quote}
                author={c.author}
                caseStudyHref={c.caseStudyHref}
                testId="testimonials-card"
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom links */}
        <div className="mt-16 flex flex-wrap justify-center gap-x-8 gap-y-3">
          <Link to="/customer-success" className="inline-flex items-center gap-1.5 font-bold text-sm cs-grad-text" data-testid="testimonials-see-stories">
            {t('hpx.testimonials.seeAllStories')} <ArrowUpRight className="w-3.5 h-3.5" style={{ color: '#5B22D6' }} />
          </Link>
          <a
            href="https://www.g2.com/products/credsure/reviews"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#6A6478] hover:text-[#0F0E1A]"
          >
            {t('hpx.testimonials.readG2Reviews')} <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
};
