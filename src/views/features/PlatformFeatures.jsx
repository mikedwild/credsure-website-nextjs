"use client";
import React from 'react';
import { useTranslations as useTranslation } from 'next-intl';
import { LocalizedLink as Link } from '@/components/LocalizedLink';
import { motion } from 'framer-motion';
import { Sparkles, LayoutDashboard, Shield, Share2, BarChart3, Zap, Plug, CheckCircle, Palette, Tag, Globe, Search, ShieldCheck } from 'lucide-react';
import { SEO } from '@/components/SEO';

const featureList = [
  { key: 'credentialManagement', Icon: LayoutDashboard, link: '/features/credential-management' },
  { key: 'blockchain', Icon: Shield, link: '/features/blockchain' },
  { key: 'sharing', Icon: Share2, link: '/features/sharing' },
  { key: 'analytics', Icon: BarChart3, link: '/features/analytics' },
  { key: 'bulkIssuance', Icon: Zap, link: '/features/bulk-issuance' },
  { key: 'apiIntegration', Icon: Plug, link: '/features/api-integration' },
  { key: 'autoIssue', Icon: CheckCircle, link: '/features/auto-issue' },
  { key: 'templateDesigner', Icon: Palette, link: '/features/template-designer' },
  { key: 'whiteLabel', Icon: Tag, link: '/features/white-label' },
  { key: 'customDomains', Icon: Globe, link: '/features/custom-domains' },
  { key: 'instantVerification', Icon: Search, link: '/features/verification' },
  { key: 'security', Icon: ShieldCheck, link: '/features/security-compliance' },
];

export const PlatformFeatures = () => {
  const t = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#FAFAFA] to-white   ">
      <SEO titleKey="pages.platform.badge" descriptionKey="pages.platform.subtitle" canonical="/features" />
      <section className="pt-32 pb-20">
        <div className="container mx-auto px-6 md:px-12 max-w-6xl">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-4xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white  border border-purple-200  rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-[#B82BC4]" />
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#3F2BD9] ">{t('pages.platform.coreFeatures')}</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#0F0E1A]  mb-6">{t('pages.platform.title')}</h1>
            <p className="text-base md:text-lg text-gray-600 ">{t('pages.platform.subtitle')}</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featureList.map((feature) => {
              const Icon = feature.Icon;
              return (
                <Link key={feature.link} to={feature.link}>
                  <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} whileHover={{ y: -4 }} className="bg-white  border border-gray-200  rounded-2xl p-6 hover:shadow-xl transition-all h-full">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#5B22D6] to-[#3F2BD9] rounded-xl flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-[#0F0E1A]  mb-2">{t(`features.${feature.key}.badge`)}</h3>
                    <p className="text-gray-600  text-sm">{t(`features.${feature.key}.subtitle`)}</p>
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
