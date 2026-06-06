"use client";
import React from 'react';
import { SEO } from '@/components/SEO';
import { useTranslations as useTranslation } from 'next-intl';
import { motion } from 'framer-motion';
import { Scale, Mail, Globe, Building2, FileText } from 'lucide-react';

export const Impressum = () => {
  const t = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#FAFAFA] to-white   ">
      <SEO
        titleKey="impressum.title"
        descriptionKey="impressum.subtitle"
        canonical="/impressum"
      />
      <section className="pt-32 pb-20">
        <div className="container mx-auto px-6 md:px-12 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#5B22D6] to-[#3F2BD9] mb-6">
              <Scale className="w-8 h-8 text-white" />
            </div>
            <h1 data-testid="impressum-title" className="text-4xl md:text-5xl font-extrabold text-[#0F0E1A]  mb-4">{t('impressum.title')}</h1>
          </motion.div>

          <div className="space-y-6">
            {/* Company Info */}
            <div className="bg-white  border border-gray-200  rounded-3xl p-8">
              <h2 className="text-xl font-bold text-[#0F0E1A]  mb-6 flex items-center gap-3">
                <Building2 className="w-5 h-5 text-[#5B22D6]" />
                {t('impressum.subtitle')}
              </h2>
              <div className="space-y-3 text-gray-700 ">
                <p className="font-semibold text-lg text-[#0F0E1A] ">Certif-ID International GmbH</p>
                <p>Scheffelstr. 58a</p>
                <p>50935 Cologne, Germany</p>
                <div className="flex items-center gap-2 mt-4">
                  <Mail className="w-4 h-4 text-[#5B22D6]" />
                  <a href="mailto:info@certif-id.com" className="text-[#5B22D6] hover:underline">info@certif-id.com</a>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#5B22D6]" />
                  <a href="https://www.certif-id.com" target="_blank" rel="noopener noreferrer" className="text-[#5B22D6] hover:underline">www.certif-id.com</a>
                </div>
              </div>
            </div>

            {/* Legal Details */}
            <div className="bg-white  border border-gray-200  rounded-3xl p-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-semibold text-gray-500  uppercase tracking-wider mb-1">{t('impressum.managingDirector')}</p>
                  <p className="text-gray-900  font-medium">Timothy Miller</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500  uppercase tracking-wider mb-1">{t('impressum.registeredOffice')}</p>
                  <p className="text-gray-900  font-medium">Cologne, Germany</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500  uppercase tracking-wider mb-1">{t('impressum.commercialRegister')}</p>
                  <p className="text-gray-900  font-medium">AG Köln HRB 108 450</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500  uppercase tracking-wider mb-1">{t('impressum.vatId')}</p>
                  <p className="text-gray-900  font-medium">DE 32 88 61 440</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500  uppercase tracking-wider mb-1">{t('impressum.contentResponsible')}</p>
                  <p className="text-gray-900  font-medium">Timothy Miller</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500  uppercase tracking-wider mb-1">{t('impressum.conceptRealization')}</p>
                  <p className="text-gray-900  font-medium">Certif-ID International GmbH</p>
                </div>
              </div>
            </div>

            {/* Legal Disclaimer */}
            <div className="bg-white  border border-gray-200  rounded-3xl p-8">
              <h2 className="text-xl font-bold text-[#0F0E1A]  mb-2 flex items-center gap-3">
                <FileText className="w-5 h-5 text-[#5B22D6]" />
                {t('impressum.legalNotice')}
              </h2>
              <p className="text-sm text-gray-500  mb-6">
                {t('impressum.lastRevised')}: June 20, 2022
              </p>
              <div className="text-gray-700  leading-relaxed whitespace-pre-line">
                {t('impressum.disclaimer')}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
