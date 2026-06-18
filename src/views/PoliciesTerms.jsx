"use client";
import React from 'react';
import PropTypes from 'prop-types';
import { SEO } from '@/components/SEO';
import { motion } from 'framer-motion';
import { FileText, Mail, Globe, Calendar, Building2 } from 'lucide-react';
import { useTranslation } from '@/lib/useTranslation';
import { MSA_META, MSA_SECTIONS } from '../data/msa';

const Section = ({ section }) => (
  <article
    id={section.id}
    className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 scroll-mt-32"
    data-testid={`msa-section-${section.id}`}
  >
    <h2 className="text-xl md:text-2xl font-bold text-[#0F0E1A] mb-5 flex items-baseline gap-3">
      <span className="text-[#5B22D6] font-extrabold tracking-tight">{section.number}.</span>
      <span>{section.title}</span>
    </h2>
    <div className="space-y-4 text-[15px] leading-relaxed text-gray-700">
      {section.body.map((block, idx) => (
        <div key={`${section.id}-b-${idx}`}>
          {block.sub && (
            <h3 className="text-base font-semibold text-[#0F0E1A] mb-2">{block.sub}</h3>
          )}
          {block.text && <p className="whitespace-pre-line">{block.text}</p>}
          {block.list && (
            <ul className="list-disc pl-6 mt-2 space-y-1.5">
              {block.list.map((item, i) => (
                <li key={`${section.id}-l-${idx}-${i}`}>{item}</li>
              ))}
            </ul>
          )}
          {block.textAfter && <p className="mt-3 whitespace-pre-line">{block.textAfter}</p>}
        </div>
      ))}
    </div>
  </article>
);

Section.propTypes = {
  section: PropTypes.shape({
    id: PropTypes.string.isRequired,
    number: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    body: PropTypes.array.isRequired,
  }).isRequired,
};

export const PoliciesTerms = () => {
  // NOTE: DE legal copy is machine-translated and MUST be reviewed by legal before being
  // relied upon. This applies to the German values under `mscx.terms.*` in
  // src/messages/de/misc-extra.json AND to the contract body itself in src/data/msa
  // (MSA_META / MSA_SECTIONS), which is outside the scope of this i18n migration.
  const t = useTranslation();
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#FAFAFA] to-white">
      <SEO
        title={t('mscx.terms.seoTitle')}
        description={t('mscx.terms.seoDescription')}
        canonical="/policies/terms"
      />

      <section className="pt-32 pb-12">
        <div className="container mx-auto px-6 md:px-12 max-w-5xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#5B22D6] to-[#3F2BD9] mb-5">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h1
              data-testid="policies-terms-title"
              className="text-4xl md:text-5xl font-extrabold text-[#0F0E1A] mb-3"
            >
              {t('mscx.terms.heading')}
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {t('mscx.terms.subtitle')}
            </p>
          </motion.div>

          {/* Document meta card */}
          <div className="grid sm:grid-cols-2 gap-3 mb-10 max-w-3xl mx-auto">
            <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-4">
              <Calendar className="w-5 h-5 text-[#5B22D6] flex-shrink-0" />
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">{t('mscx.terms.effectiveLabel')}</p>
                <p className="text-sm font-bold text-[#0F0E1A]">{MSA_META.effectiveDate} · {MSA_META.version}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-4">
              <Building2 className="w-5 h-5 text-[#5B22D6] flex-shrink-0" />
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">{t('mscx.terms.supplierLabel')}</p>
                <p className="text-sm font-bold text-[#0F0E1A]">{MSA_META.supplier.legalName}</p>
              </div>
            </div>
          </div>

          {/* Two-col layout: TOC sidebar + content */}
          <div className="lg:grid lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-10">
            {/* TOC */}
            <aside className="hidden lg:block sticky top-32 self-start max-h-[calc(100vh-10rem)] overflow-y-auto pr-2">
              <p className="text-xs uppercase tracking-widest font-bold text-gray-500 mb-3">{t('mscx.terms.contentsLabel')}</p>
              <nav className="space-y-1" data-testid="msa-toc">
                {MSA_SECTIONS.map((s) => (
                  <a
                    key={`toc-${s.id}`}
                    href={`#${s.id}`}
                    className="block text-sm text-gray-600 hover:text-[#5B22D6] hover:bg-[#5B22D6]/5 rounded-md px-3 py-1.5 transition-colors"
                  >
                    <span className="text-[#5B22D6] font-semibold mr-2">{s.number}.</span>
                    {s.title}
                  </a>
                ))}
              </nav>
            </aside>

            {/* Sections */}
            <div className="space-y-5">
              {MSA_SECTIONS.map((s) => (
                <Section key={s.id} section={s} />
              ))}

              {/* Footer card with supplier info */}
              <div className="bg-gradient-to-br from-[#5B22D6]/5 to-[#E22B8A]/5 border border-[#5B22D6]/15 rounded-2xl p-6 md:p-8">
                <h3 className="text-lg font-bold text-[#0F0E1A] mb-4">{t('mscx.terms.supplierInfoHeading')}</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <p className="font-semibold">{MSA_META.supplier.legalName}</p>
                  {MSA_META.supplier.addressLines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                  <p className="flex items-center gap-2 pt-2">
                    <Mail className="w-4 h-4 text-[#5B22D6]" />
                    <a href={`mailto:${MSA_META.supplier.contactEmail}`} className="text-[#5B22D6] hover:underline">
                      {MSA_META.supplier.contactEmail}
                    </a>
                  </p>
                  <p className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-[#5B22D6]" />
                    <a href={MSA_META.supplier.website} target="_blank" rel="noopener noreferrer" className="text-[#5B22D6] hover:underline">
                      {MSA_META.supplier.website}
                    </a>
                  </p>
                </div>
                <p className="text-xs text-gray-500 mt-5 pt-4 border-t border-[#5B22D6]/10">
                  {t('mscx.terms.documentFooter', { version: MSA_META.version, effectiveDate: MSA_META.effectiveDate })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
