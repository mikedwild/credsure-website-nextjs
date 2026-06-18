"use client";
import React, { useState } from 'react';
import { SEO, createBreadcrumbSchema, getBaseUrl } from '@/components/SEO';
import { useTranslation } from '@/lib/useTranslation';
import { motion } from 'framer-motion';
import { LocalizedLink as Link } from '@/components/LocalizedLink';
import { ArrowRight, BookOpen, Download, Clock, Lock } from 'lucide-react';
import { GatedContentModal } from '@/components/GatedContentModal';


export const Guides = () => {
  const t = useTranslation();
  const baseUrl = getBaseUrl();
  const guides = t('resx.guides.guides', { returnObjects: true });
  const [gateModal, setGateModal] = useState({ open: false, title: '', guideId: '' });
  const [activeGuide, setActiveGuide] = useState(null);
  const [, forceUpdate] = useState(0);
  const breadcrumbs = [
    { name: 'Home', path: '/' },
    { name: 'Resources', path: '/resources' },
    { name: 'Guides', path: '/guides' },
  ];

  const isUnlocked = (title) => {
    const unlocked = JSON.parse(localStorage.getItem('unlocked-content') || '[]');
    return unlocked.includes(title);
  };

  const handleGuideClick = (guide) => {
    if (isUnlocked(guide.title)) {
      setActiveGuide(guide);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setGateModal({ open: true, title: guide.title, guideId: guide.id });
  };

  const handleGateClose = () => {
    const justUnlockedTitle = gateModal.title;
    const guide = guides.find(g => g.title === justUnlockedTitle);
    setGateModal({ open: false, title: '', guideId: '' });
    // If it was just unlocked, open the guide
    if (guide && isUnlocked(justUnlockedTitle)) {
      setActiveGuide(guide);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      forceUpdate(n => n + 1);
    }
  };

  const featured = guides.find(g => g.featured);
  const rest = guides.filter(g => !g.featured);

  return (
    <>
    <div className="min-h-screen bg-gradient-to-b from-white via-[#FAFAFA] to-white   ">
      <SEO
        titleKey="seo.guides.title"
        descriptionKey="seo.guides.description"
        canonical="/guides"
        structuredData={createBreadcrumbSchema(breadcrumbs, baseUrl)}
      />

      {/* Guide Reader View */}
      {activeGuide && (
        <section className="pt-32 pb-16">
          <div className="container mx-auto px-6 md:px-12 max-w-4xl">
            <button
              onClick={() => setActiveGuide(null)}
              className="inline-flex items-center gap-2 text-[#5B22D6] hover:text-[#2e2668] font-semibold mb-8 transition-colors"
              data-testid="guide-back-btn"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              {t('resx.guides.backToGuides')}
            </button>

            <div className="mb-8">
              <span className="text-sm font-semibold text-[#5B22D6] bg-[#5B22D6]/10 px-3 py-1 rounded-full">
                {activeGuide.category}
              </span>
              <span className="text-sm text-gray-500  ml-3">{activeGuide.readTime}</span>
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#0F0E1A]  mb-6 leading-tight">
              {activeGuide.title}
            </h2>

            <p className="text-lg text-gray-600  mb-10 leading-relaxed">
              {activeGuide.description}
            </p>

            <img
              src={activeGuide.image}
              alt={activeGuide.title}
              className="w-full h-64 md:h-80 object-cover rounded-2xl mb-12"
              loading="lazy"
            />

            <div className="space-y-10" data-testid="guide-content">
              {activeGuide.content?.map((section, i) => (
                <div key={i}>
                  <h2 className="text-2xl md:text-3xl font-bold text-[#0F0E1A]  mb-4">
                    {section.heading}
                  </h2>
                  <p className="text-gray-700  leading-relaxed text-base md:text-lg">
                    {section.body}
                  </p>
                </div>
              ))}
            </div>

            {/* CTA at end of guide */}
            <div className="mt-16 p-8 md:p-10 rounded-3xl bg-gradient-to-br from-[#5B22D6] to-[#E22B8A] text-white text-center">
              <h3 className="text-2xl font-extrabold mb-3">{t('resx.guides.readerCtaTitle')}</h3>
              <p className="text-white/80 mb-6 max-w-md mx-auto">{t('resx.guides.readerCtaDesc')}</p>
              <Link to="/demo" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#5B22D6] font-bold rounded-xl hover:bg-white/90 transition-all">
                {t('resx.guides.readerCtaButton')} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Hero */}
      {!activeGuide && (<>
      <section className="pt-32 pb-16 bg-gradient-to-br from-[#FAFAFA] via-white to-purple-50/30   ">
        <div className="container mx-auto px-6 md:px-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#5B22D6]/10  rounded-full mb-6">
            <BookOpen className="w-4 h-4 text-[#5B22D6]" />
            <span className="text-sm font-semibold text-[#5B22D6]">{t('pages.guides.badge', 'Expert Resources')}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#0F0E1A]  mb-6">
            {t('pages.guides.title', 'Guides &')}{' '}
            <span className="text-transparent bg-gradient-to-r from-[#5B22D6] to-[#E22B8A] bg-clip-text">
              {t('pages.guides.titleHighlight', 'Insights')}
            </span>
          </h1>
          <p className="text-base md:text-lg text-gray-600  max-w-2xl mx-auto">
            {t('pages.guides.subtitle', 'In-depth guides, whitepapers, and best practices to help you build and scale your digital credentialing program.')}
          </p>
        </div>
      </section>

      {/* Featured Guide */}
      {featured && (
        <section className="py-12">
          <div className="container mx-auto px-6 md:px-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white  border border-gray-200  rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-500 group"
            >
              <div className="grid md:grid-cols-2 gap-0">
                <div className="relative aspect-video md:aspect-auto overflow-hidden">
                  <img src={featured.image} alt={featured.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-[#5B22D6]/90 backdrop-blur-sm rounded-full text-xs font-bold text-white">{t('resx.guides.featuredLabel')}</span>
                  </div>
                </div>
                <div className="p-8 md:p-12 flex flex-col justify-center">
                  <span className="text-sm text-[#E22B8A] font-semibold mb-3">{featured.category}</span>
                  <h2 className="text-2xl md:text-3xl font-bold text-[#0F0E1A]  mb-4 group-hover:text-[#5B22D6] transition-colors">{featured.title}</h2>
                  <p className="text-gray-600  mb-6 leading-relaxed">{featured.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500  mb-6">
                    <div className="flex items-center gap-1"><Clock className="w-4 h-4" />{featured.readTime}</div>
                    <div className="flex items-center gap-1"><Download className="w-4 h-4" />{t('resx.guides.pdfAvailable')}</div>
                  </div>
                  <button onClick={() => handleGuideClick(featured)} className="inline-flex items-center text-[#5B22D6] hover:text-[#3F2BD9] font-bold" data-testid="guide-featured-cta">
                    {isUnlocked(featured.title) ? t('resx.guides.readGuide') : (
                      <><Lock className="w-4 h-4 mr-1.5" />{t('resx.guides.unlockGuide')}</>
                    )} <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-2 transition-transform" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Guide Grid */}
      <section className="py-12">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rest.map((guide, idx) => (
              <motion.div
                key={guide.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group bg-white  border border-gray-200  rounded-2xl overflow-hidden hover:border-[#5B22D6] hover:shadow-xl transition-all duration-500"
              >
                <div className="relative aspect-video overflow-hidden">
                  <img src={guide.image} alt={guide.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold text-[#5B22D6]">{guide.category}</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-[#0F0E1A]  mb-2 group-hover:text-[#5B22D6] transition-colors line-clamp-2">{guide.title}</h3>
                  <p className="text-sm text-gray-600  mb-4 line-clamp-2">{guide.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500  flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{guide.readTime}</span>
                    <button onClick={() => handleGuideClick(guide)} className="inline-flex items-center text-[#5B22D6] hover:text-[#3F2BD9] font-bold text-sm">
                      {isUnlocked(guide.title) ? t('resx.guides.read') : <><Lock className="w-3.5 h-3.5 mr-1" />{t('resx.guides.unlock')}</>}
                      <ArrowRight className="ml-1 w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-[#5B22D6] to-[#3F2BD9]">
        <div className="container mx-auto px-6 lg:px-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">{t('pages.guides.ctaTitle', 'Need a Custom Guide?')}</h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">{t('pages.guides.ctaDesc', 'Our team can create tailored resources for your specific industry and use case.')}</p>
          <Link to="/demo" className="inline-flex items-center px-8 py-4 bg-white text-[#5B22D6] rounded-xl font-bold hover:bg-white/90 transition-colors" data-testid="guides-cta-btn">
            {t('resx.guides.ctaButton')} <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>
      </>)}
    </div>

    <GatedContentModal
      isOpen={gateModal.open}
      onClose={handleGateClose}
      contentTitle={gateModal.title}
      contentType="guide"
    />
    </>
  );
};
