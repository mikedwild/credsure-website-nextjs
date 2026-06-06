"use client";
import React from 'react';
import { useTranslations as useTranslation } from 'next-intl';
import { TrendingDown, Zap, Heart } from 'lucide-react';

export const Benefits = () => {
  const t = useTranslation();
  const icons = [TrendingDown, Zap, Heart];
  const DEFAULT_BENEFITS = [
    { title: '80%', metric: 'Faster issuance', description: 'Issue credentials in seconds, not days. Bulk workflows handle thousands at once.' },
    { title: '60%', metric: 'Cost reduction', description: 'Eliminate manual verification costs with blockchain-backed instant verification.' },
    { title: '99.9%', metric: 'Uptime SLA', description: 'Enterprise-grade reliability with SOC 2 compliance and GDPR-ready infrastructure.' },
  ];
  const DEFAULT_CATEGORIES = ['Higher Education', 'Professional Bodies', 'Corporate Training', 'Healthcare', 'Government'];
  const rawItems = t('benefitsSection.items', { returnObjects: true });
  const rawCats = t('benefitsSection.categories', { returnObjects: true });
  const benefitItems = Array.isArray(rawItems) ? rawItems : DEFAULT_BENEFITS;
  const categories = Array.isArray(rawCats) ? rawCats : DEFAULT_CATEGORIES;

  return (
    <section className="py-24 brand-gradient relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 font-heading">
            {t('benefitsSection.headline')}
          </h2>
          <p className="text-xl text-white/80 font-body">
            {t('benefitsSection.subtitle')}
          </p>
        </div>

        {/* Benefits grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {benefitItems.map((benefit, index) => {
            const IconComponent = icons[index];
            return (
              <div
                key={`benefit-${benefit.title || index}`}
                className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 hover:bg-white/20 transition-all duration-300 hover:transform hover:scale-105"
              >
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-6">
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-2">
                  {benefit.title}
                </div>
                <div className="text-sm text-white/80 mb-4 font-medium">
                  {benefit.metric}
                </div>
                <p className="text-sm sm:text-base text-white/90 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Social proof bar */}
        <div className="mt-20 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 max-w-4xl mx-auto">
          <div className="text-center">
            <p className="text-white/90 text-lg mb-6">
              {t('benefitsSection.socialProof')}
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8">
              {categories.map((cat) => (
                <div key={`cat-${cat}`} className="text-white font-semibold text-sm md:text-base">
                  {cat}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
