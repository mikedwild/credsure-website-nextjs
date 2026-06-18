"use client";
import React from 'react';
import { SEO, createBreadcrumbSchema, getBaseUrl } from '@/components/SEO';
import { useTranslation } from '@/lib/useTranslation';
import { motion } from 'framer-motion';
import { LocalizedLink as Link } from '@/components/LocalizedLink';
import { Award, Shield, Share2, BarChart3, CheckCircle2, Users, ArrowRight, Zap, Globe, ExternalLink } from 'lucide-react';
import { composedTiles } from '../data/featureMedia';

const badgeFeatureIcons = [Award, Shield, Share2, BarChart3, ExternalLink, Globe];

export const DigitalBadges = () => {
  const t = useTranslation();
  const baseUrl = getBaseUrl();
  const breadcrumbs = [{ name: 'Home', path: '/' }, { name: 'Digital Badges', path: '/digital-badges' }];

  const badgeFeatures = (t('pgx.digitalBadges.badgeFeatures', { returnObjects: true }) || []).map(
    (f, idx) => ({ ...f, icon: badgeFeatureIcons[idx % badgeFeatureIcons.length] })
  );
  const howItWorks = t('pgx.digitalBadges.howItWorks', { returnObjects: true }) || [];
  const useCases = t('pgx.digitalBadges.useCases', { returnObjects: true }) || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#FAFAFA] to-white" data-testid="digital-badges-page">
      <SEO
        titleKey="seo.digitalBadges.title"
        descriptionKey="seo.digitalBadges.description"
        keywordsKey="seo.digitalBadges.keywords"
        canonical="/digital-badges"
        structuredData={createBreadcrumbSchema(breadcrumbs, baseUrl)}
      />

      {/* Hero — split layout (text left, composed badges tile right) */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-[#FAFAFA] via-white to-purple-50/30">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-6"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#5B22D6]/10 rounded-full mb-6">
                <Award className="w-4 h-4 text-[#5B22D6]" />
                <span className="text-sm font-semibold text-[#5B22D6]">{t('pgx.digitalBadges.heroEyebrow')}</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#0F0E1A] mb-6 leading-[1.05]">
                {t('pgx.digitalBadges.heroTitleLead')}{' '}
                <span className="text-transparent bg-gradient-to-r from-[#5B22D6] to-[#E22B8A] bg-clip-text">{t('pgx.digitalBadges.heroTitleHighlight')}</span>
              </h1>
              <p className="text-base md:text-lg text-gray-600 max-w-xl mb-8">
                {t('pgx.digitalBadges.heroSubtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/demo" className="inline-flex items-center justify-center px-8 py-4 bg-[#5B22D6] text-white rounded-xl font-bold hover:bg-[#2d2461] transition-colors" data-testid="badges-demo-btn">
                  {t('pgx.digitalBadges.heroPrimaryCta')} <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <Link to="/features/template-designer" className="inline-flex items-center justify-center px-8 py-4 border-2 border-[#5B22D6] text-[#5B22D6] rounded-xl font-bold hover:bg-[#5B22D6]/5 transition-colors">
                  {t('pgx.digitalBadges.heroSecondaryCta')}
                </Link>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-8 mt-12 flex-wrap">
                <div>
                  <p className="text-3xl font-bold text-[#0F0E1A]">150+</p>
                  <p className="text-sm text-gray-500">{t('pgx.digitalBadges.statOrganisationsLabel')}</p>
                </div>
                <div className="w-px h-10 bg-slate-200 hidden sm:block"></div>
                <div>
                  <p className="text-3xl font-bold text-[#0F0E1A]">500K+</p>
                  <p className="text-sm text-gray-500">{t('pgx.digitalBadges.statBadgesSharedLabel')}</p>
                </div>
                <div className="w-px h-10 bg-slate-200 hidden sm:block"></div>
                <div>
                  <p className="text-3xl font-bold text-[#0F0E1A]">50+</p>
                  <p className="text-sm text-gray-500">{t('pgx.digitalBadges.statCountriesLabel')}</p>
                </div>
              </div>
            </motion.div>

            {/* Composed marketing tile — already includes its own headline,
                badge variants and "My Badges" recipient dashboard. Image is
                transparent so it floats directly on the page gradient with
                no overlay halo, no rounded-card frame, and no border. */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-6"
            >
              <img
                src={composedTiles.digitalBadges.src}
                alt={composedTiles.digitalBadges.alt}
                loading="eager"
                fetchPriority="high"
                decoding="async"
                className="block w-full h-auto"
                data-testid="digital-badges-composed-hero"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-6 md:px-12">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0F0E1A] mb-4">{t('pgx.digitalBadges.featuresTitle')}</h2>
            <p className="text-lg text-gray-600">{t('pgx.digitalBadges.featuresSubtitle')}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {badgeFeatures.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08 }}
                  className="bg-white border border-gray-100 rounded-2xl p-8 hover:shadow-xl hover:border-[#5B22D6]/20 transition-all group"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-[#5B22D6] to-[#3F2BD9] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-[#0F0E1A] mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{feature.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-6 md:px-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0F0E1A] text-center mb-12">{t('pgx.digitalBadges.howItWorksTitle')}</h2>
          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {howItWorks.map((item, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }} className="text-center">
                <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-[#5B22D6] to-[#3F2BD9] rounded-2xl flex items-center justify-center text-white font-bold text-xl">{item.step}</div>
                <h3 className="font-bold text-[#0F0E1A] mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20">
        <div className="container mx-auto px-6 md:px-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0F0E1A] text-center mb-12">{t('pgx.digitalBadges.useCasesTitle')}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {useCases.map((uc, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.06 }}
                className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg hover:border-[#5B22D6]/20 transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle2 className="w-5 h-5 text-[#5B22D6] flex-shrink-0" />
                  <h3 className="font-bold text-[#0F0E1A]">{uc.title}</h3>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{uc.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-[#5B22D6] to-[#3F2BD9]">
        <div className="container mx-auto px-6 lg:px-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">{t('pgx.digitalBadges.ctaTitle')}</h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">{t('pgx.digitalBadges.ctaSubtitle')}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/demo" className="inline-flex items-center justify-center px-8 py-4 bg-white text-[#5B22D6] rounded-xl font-bold hover:bg-white/90 transition-colors" data-testid="badges-cta-btn">
              {t('pgx.digitalBadges.ctaPrimary')} <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link to="/compare/accredible" className="inline-flex items-center justify-center px-8 py-4 border-2 border-white/30 text-white rounded-xl font-bold hover:bg-white/10 transition-colors">
              {t('pgx.digitalBadges.ctaSecondary')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
