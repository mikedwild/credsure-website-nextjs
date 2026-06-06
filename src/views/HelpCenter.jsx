"use client";
import React from 'react';
import { SEO } from '@/components/SEO';
import { useTranslations as useTranslation } from 'next-intl';
import { motion } from 'framer-motion';
import { Sparkles, Book, FileText, Video } from 'lucide-react';
import { LocalizedLink as Link } from '@/components/LocalizedLink';

const HELP_RESOURCES = [
  {
    icon: Book,
    titleKey: 'pages.helpCenter.documentation',
    descKey: 'pages.helpCenter.documentationDesc',
    to: '/blog'
  },
  {
    icon: FileText,
    titleKey: 'pages.helpCenter.faqs',
    descKey: 'pages.helpCenter.faqsDesc',
    to: '/blog'
  },
  {
    icon: Video,
    titleKey: 'pages.helpCenter.videoTutorials',
    descKey: 'pages.helpCenter.videoTutorialsDesc',
    to: '/tutorials'
  }
];

export const HelpCenter = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#FAFAFA] to-white">
      <SEO
        titleKey="seo.helpCenter.title"
        descriptionKey="seo.helpCenter.description"
        keywordsKey="seo.helpCenter.keywords"
        canonical="/help-center"
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
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#3F2BD9]">{t('pages.helpCenter.badge')}</span>
            </div>
            <h1 data-testid="help-center-title" className="text-5xl md:text-6xl font-extrabold text-[#0F0E1A] mb-6">
              {t('pages.helpCenter.title')}{' '}
              <span className="text-transparent bg-gradient-to-r from-[#5B22D6] to-[#E22B8A] bg-clip-text">
                {t('pages.helpCenter.titleHighlight')}
              </span>
            </h1>
            <p className="text-lg text-gray-600">{t('pages.helpCenter.subtitle')}</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {HELP_RESOURCES.map((item, i) => {
              const Icon = item.icon;
              return (
                <Link key={item.to} to={item.to}>
                  <motion.div
                    data-testid={`help-card-${i}`}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="p-8 bg-white border border-gray-200 rounded-3xl hover:border-[#5B22D6] hover:shadow-xl transition-all text-center group cursor-pointer h-full"
                  >
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#5B22D6] to-[#3F2BD9] mb-6">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-[#0F0E1A] mb-3">{t(item.titleKey)}</h3>
                    <p className="text-gray-600">{t(item.descKey)}</p>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};
