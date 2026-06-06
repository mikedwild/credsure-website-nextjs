"use client";
import React from 'react';
import { SEO } from '@/components/SEO';
import { useTranslations as useTranslation } from 'next-intl';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, TrendingUp, Zap, Award } from 'lucide-react';
import { LocalizedLink as Link } from '@/components/LocalizedLink';
import { Button } from '@/components/ui/button';

export const ByteEdge = () => {
  const t = useTranslation();

  const stats = [
    { icon: Zap, valueKey: 'pages.byteedge.stat1Value', labelKey: 'pages.byteedge.stat1Label' },
    { icon: TrendingUp, valueKey: 'pages.byteedge.stat2Value', labelKey: 'pages.byteedge.stat2Label' },
    { icon: Award, valueKey: 'pages.byteedge.stat3Value', labelKey: 'pages.byteedge.stat3Label' }
  ];

  const challenges = t('pages.byteedge.challenges', { returnObjects: true, defaultValue: [] });
  const solutions = t('pages.byteedge.solutions', { returnObjects: true, defaultValue: [] });

  return (
    <>
      <SEO
        titleKey="seo.customerSuccess.title"
        descriptionKey="seo.customerSuccess.description"
        keywordsKey="seo.customerSuccess.keywords"
        canonical="/customer-success/byteedge"
        ogImage={`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/og?${new URLSearchParams({
          title: t('pages.byteedge.title') + ' ' + t('pages.byteedge.titleHighlight'),
          highlight: t('pages.byteedge.titleHighlight'),
          pill: t('pages.byteedge.badge'),
          desc: t('pages.byteedge.subtitle'),
          tileTitle: 'Microlearning Cert',
          tileSub: 'ByteEDGE',
        }).toString()}`}
      />
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-6 lg:px-12 pt-28">
          <Link to="/customer-success" className="inline-flex items-center gap-2 text-[#5B22D6] hover:text-[#3F2BD9] font-medium transition-colors">
            <ArrowLeft className="w-5 h-5" />
            {t('pages.byteedge.backToStories')}
          </Link>
        </div>

        <section className="pt-12 pb-20">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="max-w-6xl mx-auto">
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
                <span className="inline-block px-4 py-2 bg-purple-100 text-[#5B22D6] text-sm font-bold rounded-full mb-6">
                  {t('pages.byteedge.badge')}
                </span>
                <h1 data-testid="byteedge-title" className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#0F0E1A] mb-6">
                  {t('pages.byteedge.title')} <span className="text-transparent bg-gradient-to-r from-[#5B22D6] to-[#E22B8A] bg-clip-text">{t('pages.byteedge.titleHighlight')}</span>
                </h1>
                <p className="text-xl text-gray-600 mb-8">{t('pages.byteedge.subtitle')}</p>
                <div className="aspect-video rounded-3xl overflow-hidden bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                  <img src="/images/success-stories/byteedge-hero.webp" alt="ByteEDGE Learning" className="w-full h-full object-cover" />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-gradient-to-b from-white to-slate-50">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-[#0F0E1A] mb-6">{t('pages.byteedge.aboutTitle')}</h2>
              <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
                <p>{t('pages.byteedge.aboutP1')}</p>
                <p>{t('pages.byteedge.aboutP2')}</p>
              </div>
              <div className="mt-12 bg-gradient-to-br from-[#5B22D6] to-[#3F2BD9] rounded-2xl p-8 text-white">
                <svg className="w-12 h-12 text-white/20 mb-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" />
                </svg>
                <p className="text-lg italic mb-4">&ldquo;{t('pages.byteedge.quote')}&rdquo;</p>
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-bold">{t('pages.byteedge.quoteName')}</p>
                    <p className="text-sm text-white/80">{t('pages.byteedge.quoteRole')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-[#0F0E1A] mb-8">{t('pages.byteedge.challengeTitle')}</h2>
              <p className="text-xl text-gray-700 mb-8">{t('pages.byteedge.challengeDesc')}</p>
              <div className="grid md:grid-cols-2 gap-4">
                {Array.isArray(challenges) && challenges.map((challenge, index) => (
                  <div key={`ch-${challenge.slice(0, 20)}`} className="flex items-start gap-3 bg-slate-50 rounded-xl p-4">
                    <CheckCircle2 className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{challenge}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-gradient-to-b from-slate-50 to-white">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-[#0F0E1A] mb-8">{t('pages.byteedge.solutionTitle')}</h2>
              <p className="text-xl text-gray-700 mb-8">{t('pages.byteedge.solutionDesc')}</p>
              <div className="grid md:grid-cols-2 gap-4 mb-12">
                {Array.isArray(solutions) && solutions.map((solution, index) => (
                  <div key={`sol-${solution.slice(0, 20)}`} className="flex items-start gap-3 bg-white border border-gray-200 rounded-xl p-4 hover:border-[#5B22D6] transition-colors">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{solution}</span>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl overflow-hidden">
                <img src="/images/success-stories/byteedge-certificate.webp" alt="ByteEDGE Digital Certificate Example" className="w-full" />
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-gradient-to-br from-[#5B22D6] to-[#3F2BD9]">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="max-w-5xl mx-auto text-center">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-12">{t('pages.byteedge.resultsTitle')}</h2>
              <div className="grid md:grid-cols-3 gap-8">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div key={`stat-${t(stat.valueKey)}`} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} viewport={{ once: true }}
                      className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8">
                      <Icon className="w-12 h-12 text-white mx-auto mb-4" />
                      <div className="text-5xl font-bold text-white mb-2">{t(stat.valueKey)}</div>
                      <div className="text-white/90">{t(stat.labelKey)}</div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-6 lg:px-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0F0E1A] mb-6">{t('pages.byteedge.ctaTitle')}</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">{t('pages.byteedge.ctaDesc')}</p>
            <Link to="/demo">
              <Button className="bg-gradient-to-r from-[#5B22D6] to-[#3F2BD9] text-white hover:opacity-90 px-10 py-6 text-lg rounded-2xl font-semibold">
                {t('pages.byteedge.ctaButton')}
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
};
