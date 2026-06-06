"use client";
import React from 'react';
import { SEO } from '@/components/SEO';
import { useTranslations as useTranslation } from 'next-intl';
import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';

export const Terms = () => {
  const t = useTranslation('legal');
  const sections = t('terms.sections', { returnObjects: true, defaultValue: [] });

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#FAFAFA] to-white   ">
      <SEO
        titleKey="terms.title"
        descriptionKey="terms.subtitle"
        canonical="/terms"
      />
      <section className="pt-32 pb-20">
        <div className="container mx-auto px-6 md:px-12 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#5B22D6] to-[#3F2BD9] mb-6">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h1 data-testid="terms-title" className="text-4xl md:text-5xl font-extrabold text-[#0F0E1A]  mb-4">{t('terms.title')}</h1>
            <p className="text-gray-600 ">{t('terms.subtitle')}</p>
          </motion.div>

          {/* Preamble */}
          <div className="bg-white  border border-gray-200  rounded-3xl p-8 mb-6">
            <p className="text-sm text-gray-500  mb-4 italic">{t('terms.lastRevised')}</p>
            <p className="text-gray-700  leading-relaxed">
              {t('terms.preamble')}
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-6">
            {Array.isArray(sections) && sections.map((section, index) => (
              <div key={`term-${section.title}`} className="bg-white  border border-gray-200  rounded-3xl p-8">
                <h2 className="text-xl font-bold text-[#0F0E1A]  mb-4">{section.title}</h2>
                <div className="text-gray-700  leading-relaxed whitespace-pre-line">{section.content}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
