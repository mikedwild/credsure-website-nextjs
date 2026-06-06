"use client";
import React from 'react';
import { SEO, createBreadcrumbSchema, getBaseUrl } from '@/components/SEO';
import { useTranslations as useTranslation } from 'next-intl';
import { motion } from 'framer-motion';
import { LocalizedLink as Link } from '@/components/LocalizedLink';
import { 
  LayoutDashboard, Shield, Share2, BarChart3, Zap, Plug, 
  CheckCircle2, Award, Globe, Palette, ArrowRight 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Features = () => {
  const t = useTranslation();
  const baseUrl = getBaseUrl();
  const breadcrumbs = [{ name: 'Home', path: '/' }, { name: 'Features', path: '/features' }];

  const featureCategories = [
    {
      title: t('pages.features.coreTitle'),
      description: t('pages.features.coreDesc'),
      gradient: 'from-purple-600 to-blue-600',
      features: [
        { icon: LayoutDashboard, title: t('pages.features.credentialMgmt'), description: t('pages.features.credentialMgmtDesc'), link: '/features/digital-certificates' },
        { icon: Shield, title: t('pages.features.blockchainVerification'), description: t('pages.features.blockchainVerificationDesc'), link: '/features/blockchain' },
        { icon: Share2, title: t('pages.features.socialSharing'), description: t('pages.features.socialSharingDesc'), link: '/features/sharing' },
        { icon: BarChart3, title: t('pages.features.analyticsDashboard'), description: t('pages.features.analyticsDashboardDesc'), link: '/features/analytics' }
      ]
    },
    {
      title: t('pages.features.automationTitle'),
      description: t('pages.features.automationDesc'),
      gradient: 'from-orange-600 to-red-600',
      features: [
        { icon: Zap, title: t('pages.features.bulkIssuance'), description: t('pages.features.bulkIssuanceDesc'), link: '/features/bulk-issuance' },
        { icon: Plug, title: t('pages.features.apiIntegration'), description: t('pages.features.apiIntegrationDesc'), link: '/features/api-integration' },
        { icon: CheckCircle2, title: t('pages.features.autoIssue'), description: t('pages.features.autoIssueDesc'), link: '/features/auto-issue' }
      ]
    },
    {
      title: t('pages.features.customizationTitle'),
      description: t('pages.features.customizationDesc'),
      gradient: 'from-pink-600 to-purple-600',
      features: [
        { icon: Award, title: t('pages.features.templateDesigner'), description: t('pages.features.templateDesignerDesc'), link: '/features/template-designer' },
        { icon: Palette, title: t('pages.features.whiteLabel'), description: t('pages.features.whiteLabelDesc'), link: '/features/white-label' },
        { icon: Globe, title: t('pages.features.customDomains'), description: t('pages.features.customDomainsDesc'), link: '/features/custom-domains' }
      ]
    }
  ];

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  return (
    <>
      <SEO titleKey="seo.features.title" descriptionKey="seo.features.description" keywordsKey="seo.features.keywords" canonical="/features" structuredData={createBreadcrumbSchema(breadcrumbs, baseUrl)} />
      <div className="min-h-screen bg-white">
        {/* Hero */}
        <section className="pt-32 pb-20 bg-gradient-to-br from-[#5B22D6] to-[#3F2BD9] text-white">
          <div className="container mx-auto px-6 lg:px-12">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
                {t('pages.features.heroTitle')} <span className="text-transparent bg-gradient-to-r from-white to-blue-200 bg-clip-text">{t('pages.features.heroTitleHighlight')}</span>
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-8">{t('pages.features.heroSubtitle')}</p>
              <Link to="/demo">
                <Button className="bg-white text-[#5B22D6] hover:bg-white/90 px-10 py-6 text-lg rounded-2xl font-semibold">{t('pages.features.scheduleDemo')}</Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Feature Categories */}
        {featureCategories.map((category) => (
          <section key={category.title} className={`py-20 ${featureCategories.indexOf(category) % 2 === 0 ? 'bg-white' : 'bg-gradient-to-b from-white to-slate-50'}`}>
            <div className="container mx-auto px-6 lg:px-12">
              <div className="max-w-6xl mx-auto">
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
                  <h2 className="text-4xl md:text-5xl font-bold text-[#0F0E1A] mb-4">{category.title}</h2>
                  <p className="text-xl text-gray-600">{category.description}</p>
                </motion.div>
                <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }}
                  className={`grid gap-6 ${category.features.length === 4 ? 'md:grid-cols-4 md:grid-rows-2' : 'md:grid-cols-6'}`}>
                  {category.features.map((feature) => {
                    const Icon = feature.icon;
                    const isHero = category.features.indexOf(feature) === 0;
                    const spanClass = category.features.length === 4
                      ? (isHero ? 'md:col-span-2 md:row-span-2' : 'md:col-span-2')
                      : (isHero ? 'md:col-span-3 md:row-span-2' : 'md:col-span-3');
                    return (
                      <motion.div key={feature.link} variants={item} className={spanClass}>
                        <Link to={feature.link}
                          className={`block group border-2 border-gray-200 rounded-2xl ${isHero ? 'p-8 md:p-10' : 'p-6'} hover:border-transparent hover:shadow-2xl transition-all h-full bg-white hover:bg-gradient-to-br hover:from-[#5B22D6] hover:to-[#3F2BD9]`}>
                          <Icon className={`${isHero ? 'w-14 h-14 mb-6' : 'w-10 h-10 mb-4'} text-[#5B22D6] group-hover:text-white transition-colors`} />
                          <h3 className={`${isHero ? 'text-2xl md:text-3xl' : 'text-xl'} font-bold text-[#0F0E1A] mb-3 group-hover:text-white transition-colors`}>{feature.title}</h3>
                          <p className={`${isHero ? 'text-lg' : 'text-base'} text-gray-600 mb-4 group-hover:text-white/90 transition-colors`}>{feature.description}</p>
                          <div className="flex items-center text-[#5B22D6] font-medium group-hover:text-white/90 transition-colors">
                            <span className="mr-2">{t('pages.features.learnMore')}</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </div>
            </div>
          </section>
        ))}

        {/* Additional Features */}
        <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-[#0F0E1A] mb-8">{t('pages.features.moreTitle')}</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { title: t('pages.features.instantVerification'), link: '/features/verification' },
                  { title: t('pages.features.securityCompliance'), link: '/features/security' },
                  { title: t('pages.features.multiLanguage'), link: '/platform' },
                  { title: t('pages.features.mobileOptimized'), link: '/platform' }
                ].map((feature) => (
                  <Link key={feature.link} to={feature.link}
                    className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-4 hover:border-[#5B22D6] hover:shadow-lg transition-all">
                    <span className="font-semibold text-gray-800">{feature.title}</span>
                    <ArrowRight className="w-5 h-5 text-[#5B22D6]" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-br from-[#5B22D6] to-[#3F2BD9]">
          <div className="container mx-auto px-6 lg:px-12 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">{t('pages.features.ctaTitle')}</h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">{t('pages.features.ctaSubtitle')}</p>
            <div className="flex gap-4 justify-center">
              <Link to="/demo">
                <Button className="bg-white text-[#5B22D6] hover:bg-white/90 px-10 py-6 text-lg rounded-2xl font-semibold">{t('pages.features.scheduleDemo')}</Button>
              </Link>
              <Link to="/pricing">
                <Button variant="outline" className="border-2 border-white text-white hover:bg-white/10 px-10 py-6 text-lg rounded-2xl font-semibold">{t('pages.features.viewPricing')}</Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};
