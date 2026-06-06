"use client";
import React from 'react';
import { SEO } from '@/components/SEO';
import { useTranslations as useTranslation } from 'next-intl';

import { motion } from 'framer-motion';
import { Sparkles, Layout } from 'lucide-react';
export const Templates = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#FAFAFA] to-white">
      <SEO
        titleKey="seo.templates.title"
        descriptionKey="seo.templates.description"
        keywordsKey="seo.templates.keywords"
        canonical="/templates"
      />
      <section className="pt-32 pb-20">
        <div className="container mx-auto px-6 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-purple-200 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-[#B82BC4]" />
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#3F2BD9]">Templates</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-[#0F0E1A] mb-6">
              500+ Professional{' '}
              <span className="text-transparent bg-gradient-to-r from-[#5B22D6] to-[#E22B8A] bg-clip-text">
                Certificate Templates
              </span>
            </h1>
            <p className="text-lg text-gray-600">{t('pages.templates.subtitle', 'Choose from industry-leading designs or create your own with our intuitive template builder.')}</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {['Education', 'Corporate', 'Healthcare', 'Technology', 'Professional', 'Events'].map((cat, i) => (
              <motion.div
                key={cat}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 bg-white border border-gray-200 rounded-3xl hover:border-[#5B22D6] hover:shadow-xl transition-all text-center"
              >
                <Layout className="w-12 h-12 text-[#5B22D6] mx-auto mb-4" />
                <h3 className="text-xl font-bold text-[#0F0E1A] mb-2">{cat}</h3>
                <p className="text-gray-600 text-sm">50+ templates</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
