"use client";
import React from 'react';
import { SEO } from '@/components/SEO';
import { useTranslations as useTranslation } from 'next-intl';

import { motion } from 'framer-motion';
import { Shield, CheckCircle } from 'lucide-react';
export const GDPR = () => {
  const t = useTranslation();
  const items = t('pages.gdpr.items', { returnObjects: true, defaultValue: [] });
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#FAFAFA] to-white">
      <SEO
        titleKey="seo.gdpr.title"
        descriptionKey="seo.gdpr.description"
        keywordsKey="seo.gdpr.keywords"
        canonical="/gdpr"
      />
      <section className="pt-32 pb-20">
        <div className="container mx-auto px-6 md:px-12 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#5B22D6] to-[#3F2BD9] mb-6">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 data-testid="gdpr-title" className="text-4xl md:text-5xl font-extrabold text-[#0F0E1A] mb-4">{t('pages.gdpr.title')}</h1>
            <p className="text-gray-600">{t('pages.gdpr.subtitle')}</p>
          </motion.div>
          <div className="grid gap-6">
            {Array.isArray(items) && items.map((item, i) => (
              <motion.div
                key={`gdpr-${i}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white border border-gray-200 rounded-3xl p-6 flex items-start gap-4"
              >
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                <p className="text-gray-700 font-medium">{item}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
