"use client";
/**
 * CustomerStorySpotlight — Beamery's signature mid-page module.
 *
 * Big photographic customer card: left = photo (warm halo), right =
 * Employees · HQ · Industry meta + tags + huge gradient pull-quote +
 * "Read case study →". Drops between Features and Testimonials to
 * give the homepage a real-world moment.
 */
import React from 'react';
import { useTranslations as useTranslation } from 'next-intl';
import { ArrowUpRight } from 'lucide-react';
import { LocalizedLink as Link } from '@/components/LocalizedLink';

const CUSTOMER_PHOTO = 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=900&q=80';

export const CustomerStorySpotlight = () => {
  const t = useTranslation();

  return (
    <section className="py-24 md:py-28 relative overflow-hidden" style={{ background: '#FAFAFC' }} data-testid="customer-spotlight">
      <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(187,158,255,0.20) 0%, transparent 70%)' }} aria-hidden="true" />

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="rounded-3xl overflow-hidden grid lg:grid-cols-12 items-center" style={{ background: '#FFFFFF', border: '1px solid #ECE7F1', boxShadow: '0 24px 60px -24px rgba(15,14,26,0.18)' }}>

          {/* Photo column */}
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-[4/5] lg:aspect-auto lg:h-full min-h-[420px]">
              <img
                src={CUSTOMER_PHOTO}
                alt={t('customerSpotlight.imageAlt', 'University leader reviewing credentialing platform')}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(91,34,214,0.12) 0%, rgba(232,43,138,0.18) 100%)' }} />
              {/* Big employees stat float */}
              <div className="absolute bottom-4 left-4 bg-white rounded-xl px-4 py-2.5 shadow-md" style={{ border: '1px solid #ECE7F1' }}>
                <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-[#6A6478]">Employees</p>
                <p className="text-xl font-bold text-[#0F0E1A]">75,000+</p>
              </div>
            </div>
          </div>

          {/* Story column */}
          <div className="lg:col-span-7 p-8 md:p-12 lg:p-14">
            <div className="grid grid-cols-3 gap-4 pb-6 mb-6 border-b" style={{ borderColor: '#ECE7F1' }}>
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-[#6A6478] mb-1">Industry</p>
                <p className="text-sm font-bold text-[#0F0E1A]">{t('customerSpotlight.industry', 'Higher Education')}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-[#6A6478] mb-1">Headquarters</p>
                <p className="text-sm font-bold text-[#0F0E1A]">{t('customerSpotlight.hq', 'United Kingdom')}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-[#6A6478] mb-1">Live since</p>
                <p className="text-sm font-bold text-[#0F0E1A]">{t('customerSpotlight.since', '6 days · 50K diplomas')}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {['Bulk issuance', 'Audit logs', 'Workday integration'].map(tag => (
                <span key={tag} className="cs-pill" data-testid={`spotlight-tag-${tag}`}>{tag}</span>
              ))}
            </div>

            <p className="text-2xl md:text-3xl font-bold tracking-tight text-[#0F0E1A] leading-[1.2]">
              "{t('customerSpotlight.quote.lead', 'We replaced eighteen years of paper diplomas in')} <span className="cs-grad-text">{t('customerSpotlight.quote.bold', 'six weeks')}</span>{t('customerSpotlight.quote.tail', ". CredSure didn't ask for a single engineer — it just worked.")}"
            </p>

            <div className="mt-7 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full" style={{ background: 'linear-gradient(135deg, #5B22D6, #E22B8A)' }} />
              <div className="flex-1">
                <p className="text-sm font-bold text-[#0F0E1A]">{t('customerSpotlight.author', 'Dr. Eleanor Whitfield')}</p>
                <p className="text-xs text-[#6A6478]">{t('customerSpotlight.role', 'Director of Digital Credentialing · Cambridge Training')}</p>
              </div>
              <Link to="/customer-success/byteedge" className="cs-btn cs-btn-ghost !text-sm !py-2.5 !px-5" data-testid="spotlight-case-link">
                Read case study <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default CustomerStorySpotlight;
