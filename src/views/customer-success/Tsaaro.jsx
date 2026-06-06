"use client";
import React from 'react';
import { SEO } from '@/components/SEO';
import { useTranslations as useTranslation } from 'next-intl';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Shield, Share2, Zap } from 'lucide-react';
import { LocalizedLink as Link } from '@/components/LocalizedLink';
import { Button } from '@/components/ui/button';

export const Tsaaro = () => {
  const { t } = useTranslation();

  const highlights = t('pages.tsaaro.highlights', { returnObjects: true, defaultValue: [] });

  const benefits = [
    { icon: Zap, titleKey: 'pages.tsaaro.benefit1Title', descKey: 'pages.tsaaro.benefit1Desc' },
    { icon: Share2, titleKey: 'pages.tsaaro.benefit2Title', descKey: 'pages.tsaaro.benefit2Desc' },
    { icon: Shield, titleKey: 'pages.tsaaro.benefit3Title', descKey: 'pages.tsaaro.benefit3Desc' }
  ];

  return (
    <>
      <SEO
        titleKey="seo.customerSuccess.title"
        descriptionKey="seo.customerSuccess.description"
        keywordsKey="seo.customerSuccess.keywords"
        canonical="/customer-success/tsaaro"
        ogImage={`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/og?${new URLSearchParams({
          title: t('pages.tsaaro.title') + ' ' + t('pages.tsaaro.titleHighlight'),
          highlight: t('pages.tsaaro.titleHighlight'),
          pill: t('pages.tsaaro.badge'),
          desc: t('pages.tsaaro.subtitle'),
          tileTitle: 'Compliance Certificate',
          tileSub: 'Tsaaro Academy',
        }).toString()}`}
      />
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-6 lg:px-12 pt-28">
          <Link to="/customer-success" className="inline-flex items-center gap-2 text-[#5B22D6] hover:text-[#3F2BD9] font-medium transition-colors">
            <ArrowLeft className="w-5 h-5" />
            {t('pages.tsaaro.backToStories')}
          </Link>
        </div>

        <section className="pt-12 pb-20">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="max-w-6xl mx-auto">
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
                <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 text-sm font-bold rounded-full mb-6">
                  {t('pages.tsaaro.badge')}
                </span>
                <h1 data-testid="tsaaro-title" className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#0F0E1A] mb-6">
                  {t('pages.tsaaro.title')} <span className="text-transparent bg-gradient-to-r from-[#5B22D6] to-[#E22B8A] bg-clip-text">{t('pages.tsaaro.titleHighlight')}</span>
                </h1>
                <p className="text-xl text-gray-600 mb-8">{t('pages.tsaaro.subtitle')}</p>
                <div className="aspect-video rounded-3xl overflow-hidden bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
                  <img src="/images/success-stories/tsaaro-hero.webp" alt="Tsaaro Academy" className="w-full h-full object-cover" />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-gradient-to-b from-white to-slate-50">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-[#0F0E1A] mb-6">{t('pages.tsaaro.aboutTitle')}</h2>
              <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
                <p>{t('pages.tsaaro.aboutP1')}</p>
                <p>{t('pages.tsaaro.aboutP2')}</p>
                <p>{t('pages.tsaaro.aboutP3')}</p>
              </div>

              <div className="mt-12 space-y-6">
                <div className="bg-gradient-to-br from-[#5B22D6] to-[#3F2BD9] rounded-2xl p-8 text-white">
                  <svg className="w-12 h-12 text-white/20 mb-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" />
                  </svg>
                  <p className="text-lg italic mb-4">&ldquo;{t('pages.tsaaro.quote1')}&rdquo;</p>
                  <div>
                    <p className="font-bold">{t('pages.tsaaro.quote1Name')}</p>
                    <p className="text-sm text-white/80">{t('pages.tsaaro.quote1Role')}</p>
                  </div>
                </div>

                <div className="bg-white border-2 border-[#5B22D6] rounded-2xl p-8">
                  <svg className="w-12 h-12 text-[#5B22D6]/20 mb-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" />
                  </svg>
                  <p className="text-lg italic mb-4 text-gray-700">&ldquo;{t('pages.tsaaro.quote2')}&rdquo;</p>
                  <div>
                    <p className="font-bold text-[#0F0E1A]">{t('pages.tsaaro.quote2Name')}</p>
                    <p className="text-sm text-gray-600">{t('pages.tsaaro.quote2Role')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-[#0F0E1A] mb-8">{t('pages.tsaaro.highlightsTitle')}</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {Array.isArray(highlights) && highlights.map((highlight, index) => (
                  <div key={`hl-${highlight.slice(0, 20)}`} className="flex items-start gap-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{highlight}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-[#0F0E1A] mb-12 text-center">{t('pages.tsaaro.benefitsTitle')}</h2>
              <div className="grid md:grid-cols-3 gap-8">
                {benefits.map((benefit, index) => {
                  const Icon = benefit.icon;
                  return (
                    <motion.div key={`ben-${t(benefit.titleKey)}`} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} viewport={{ once: true }}
                      className="bg-white border border-gray-200 rounded-2xl p-6 text-center hover:border-[#5B22D6] hover:shadow-lg transition-all">
                      <Icon className="w-12 h-12 text-[#5B22D6] mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-[#0F0E1A] mb-2">{t(benefit.titleKey)}</h3>
                      <p className="text-gray-600">{t(benefit.descKey)}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-gradient-to-br from-blue-600 to-cyan-600">
          <div className="container mx-auto px-6 lg:px-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">{t('pages.tsaaro.ctaTitle')}</h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">{t('pages.tsaaro.ctaDesc')}</p>
            <Link to="/demo">
              <Button className="bg-white text-blue-600 hover:bg-white/90 px-10 py-6 text-lg rounded-2xl font-semibold">
                {t('pages.tsaaro.ctaButton')}
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
};
