"use client";
import React from 'react';
import { SEO } from '@/components/SEO';
import { useTranslations as useTranslation } from 'next-intl';
import { motion } from 'framer-motion';
import { Sparkles, Users, Target, Award } from 'lucide-react';

export const About = () => {
  const t = useTranslation();

  const values = [
    { icon: Users, titleKey: 'pages.about.mission', descKey: 'pages.about.missionDesc' },
    { icon: Target, titleKey: 'pages.about.vision', descKey: 'pages.about.visionDesc' },
    { icon: Award, titleKey: 'pages.about.values', descKey: 'pages.about.valuesDesc' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#FAFAFA] to-white   ">
      <SEO titleKey="seo.about.title" descriptionKey="seo.about.description" keywordsKey="seo.about.keywords" canonical="/about" />
      <section className="pt-32 pb-20 bg-gradient-to-br from-[#FAFAFA] via-white to-purple-50/30   ">
        <div className="container mx-auto px-6 md:px-12">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white  border border-purple-200  rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-[#B82BC4]" />
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#3F2BD9] ">{t('pages.about.badge')}</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#0F0E1A]  mb-6">{t('pages.about.title')} <span className="text-transparent bg-gradient-to-r from-[#5B22D6] to-[#E22B8A] bg-clip-text">{t('pages.about.titleHighlight')}</span></h1>
            <p className="text-base md:text-lg text-gray-600  leading-relaxed">{t('pages.about.subtitle')}</p>
          </motion.div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
            {values.map((item) => {
              const Icon = item.icon;
              return (
                <motion.div key={item.titleKey} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="text-center p-8 bg-white  border border-gray-200  rounded-3xl hover:shadow-xl transition-all">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#5B22D6] to-[#3F2BD9] mb-6">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#0F0E1A]  mb-4">{t(item.titleKey)}</h3>
                  <p className="text-gray-600  leading-relaxed">{t(item.descKey)}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};
