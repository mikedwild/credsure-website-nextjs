"use client";
import React from 'react';
import { SEO } from '@/components/SEO';
import { useTranslations as useTranslation } from 'next-intl';
import { motion } from 'framer-motion';
import { Shield, Lock, CheckCircle } from 'lucide-react';

export const Security = () => {
  const { t } = useTranslation();
  
  const features = [
    { icon: Lock, titleKey: 'pages.security.encryption', descKey: 'pages.security.encryptionDesc' },
    { icon: Shield, titleKey: 'pages.security.soc2', descKey: 'pages.security.soc2Desc' },
    { icon: CheckCircle, titleKey: 'pages.security.gdpr', descKey: 'pages.security.gdprDesc' }
  ];
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#FAFAFA] to-white">
      <SEO
        titleKey="seo.security.title"
        descriptionKey="seo.security.description"
        keywordsKey="seo.security.keywords"
        canonical="/security"
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
            <h1 data-testid="security-title" className="text-4xl md:text-5xl font-extrabold text-[#0F0E1A] mb-4">
              {t('pages.security.title')} <span className="text-transparent bg-gradient-to-r from-[#5B22D6] to-[#E22B8A] bg-clip-text">{t('pages.security.titleHighlight')}</span>
            </h1>
            <p className="text-gray-600">{t('pages.security.subtitle')}</p>
          </motion.div>
          
          <div className="grid gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.titleKey} className="bg-white border border-gray-200 rounded-2xl p-6 flex items-start gap-4">
                  <Icon className="w-8 h-8 text-[#5B22D6] flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-bold text-[#0F0E1A] mb-2">{t(feature.titleKey)}</h3>
                    <p className="text-gray-600">{t(feature.descKey)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};
