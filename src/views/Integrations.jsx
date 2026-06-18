"use client";
import React from 'react';
import { SEO, createBreadcrumbSchema, getBaseUrl } from '@/components/SEO';
import { useTranslation } from '@/lib/useTranslation';
import { motion } from 'framer-motion';
import { LocalizedLink as Link } from '@/components/LocalizedLink';
import { Sparkles, ArrowRight, Zap, GraduationCap, Users, BarChart3, ShoppingCart, FileSpreadsheet, Calendar, CheckCircle2, Globe } from 'lucide-react';

// Icons stay in code (not serializable to JSON); matched to category id.
const CATEGORY_ICONS = {
  lms: GraduationCap,
  crm: Users,
  productivity: FileSpreadsheet,
  ecommerce: ShoppingCart,
  social: BarChart3,
};

const IntegrationCard = ({ integration, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.05 }}
    className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl hover:border-[#5B22D6]/30 hover:shadow-lg transition-all group"
    data-testid={`integration-${integration.name.toLowerCase().replace(/\s+/g, '-')}`}
  >
    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#5B22D6]/10 to-[#3F2BD9]/10 flex items-center justify-center flex-shrink-0 group-hover:from-[#5B22D6]/20 group-hover:to-[#3F2BD9]/20 transition-colors">
      <span className="text-lg font-bold text-[#5B22D6]">{integration.name.charAt(0)}</span>
    </div>
    <div className="min-w-0">
      <h4 className="font-bold text-[#0F0E1A] text-sm">{integration.name}</h4>
      <p className="text-xs text-gray-500 truncate">{integration.desc}</p>
    </div>
  </motion.div>
);

export const Integrations = () => {
  const t = useTranslation();
  const baseUrl = getBaseUrl();
  const breadcrumbs = [{ name: 'Home', path: '/' }, { name: 'Integrations', path: '/integrations' }];
  const integrationCategories = t('resx.integrations.categories', { returnObjects: true });
  const totalIntegrations = integrationCategories.reduce((sum, cat) => sum + cat.integrations.length, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#FAFAFA] to-white" data-testid="integrations-page">
      <SEO titleKey="seo.integrations.title" descriptionKey="seo.integrations.description" keywordsKey="seo.integrations.keywords" canonical="/integrations" structuredData={createBreadcrumbSchema(breadcrumbs, baseUrl)} />

      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-[#FAFAFA] via-white to-purple-50/30">
        <div className="container mx-auto px-6 md:px-12 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#5B22D6]/10 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-[#5B22D6]" />
              <span className="text-sm font-semibold text-[#5B22D6]">{t('pages.integrations.badge')}</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#0F0E1A] mb-6">
              {t('pages.integrations.heroTitle')}{' '}
              <span className="text-transparent bg-gradient-to-r from-[#5B22D6] to-[#E22B8A] bg-clip-text">{t('pages.integrations.heroTitleHighlight')}</span>
            </h1>
            <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto mb-8">{t('pages.integrations.heroSubtitle')}</p>

            {/* Stats */}
            <div className="flex items-center justify-center gap-8 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Zap className="w-5 h-5 text-[#5B22D6]" />
                </div>
                <div className="text-left">
                  <p className="text-2xl font-bold text-[#0F0E1A]">{totalIntegrations}+</p>
                  <p className="text-xs text-gray-500">{t('resx.integrations.statIntegrations')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <Globe className="w-5 h-5 text-[#3F2BD9]" />
                </div>
                <div className="text-left">
                  <p className="text-2xl font-bold text-[#0F0E1A]">8,000+</p>
                  <p className="text-xs text-gray-500">{t('resx.integrations.statApps')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-left">
                  <p className="text-2xl font-bold text-[#0F0E1A]">REST API</p>
                  <p className="text-xs text-gray-500">{t('resx.integrations.statCustom')}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Zapier Banner */}
      <section className="py-8">
        <div className="container mx-auto px-6 md:px-12">
          <div className="bg-gradient-to-r from-[#5B22D6] to-[#3F2BD9] rounded-2xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="white" className="w-8 h-8"><path d="M15.682 2.018l-2.968 6.58L5.088 2.37l-.27.27 6.228 7.626L4.58 13.3v.37l6.58-2.966 6.228 7.626.37-.27-6.352-7.626 6.58-2.968v-.37l-6.938 2.966L4.82 2.288l-.37.27 7.626 6.228-2.968 6.58h.37l2.968-6.938 7.626 6.352.27-.37-7.626-6.228L15.682 2.388l-.37-.37z"/></svg>
              </div>
              <div className="text-white">
                <h3 className="text-xl font-bold">{t('resx.integrations.zapierTitle')}</h3>
                <p className="text-white/80 text-sm">{t('resx.integrations.zapierSubtitle')}</p>
              </div>
            </div>
            <a href="https://zapier.com/apps/credsure/integrations" target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-6 py-3 bg-white text-[#5B22D6] rounded-xl font-bold hover:bg-white/90 transition-colors whitespace-nowrap" data-testid="zapier-link">
              {t('resx.integrations.zapierCta')} <ArrowRight className="ml-2 w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Integration Categories */}
      <section className="py-16">
        <div className="container mx-auto px-6 md:px-12">
          <div className="space-y-16">
            {integrationCategories.map((category, catIdx) => {
              const Icon = CATEGORY_ICONS[category.id];
              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: catIdx * 0.1 }}
                  data-testid={`integration-category-${category.id}`}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#5B22D6] to-[#3F2BD9] rounded-xl flex items-center justify-center">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-[#0F0E1A]">{category.title}</h2>
                      <p className="text-sm text-gray-500">{category.description}</p>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {category.integrations.map((integration, idx) => (
                      <IntegrationCard key={integration.name} integration={integration} index={idx} />
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Custom API Section */}
      <section className="py-16 bg-gradient-to-br from-slate-50 to-purple-50/30">
        <div className="container mx-auto px-6 md:px-12">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0F0E1A] mb-4">{t('resx.integrations.customTitle')}</h2>
            <p className="text-lg text-gray-600 mb-8">{t('resx.integrations.customSubtitle')}</p>
            <div className="grid sm:grid-cols-3 gap-6 mb-10">
              {t('resx.integrations.customCards', { returnObjects: true }).map((item) => (
                <div key={item.title} className="bg-white rounded-2xl p-6 border border-gray-100">
                  <h3 className="font-bold text-[#0F0E1A] mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              ))}
            </div>
            <Link to="/demo" className="inline-flex items-center px-8 py-4 bg-[#5B22D6] text-white rounded-xl font-bold hover:bg-[#2d2461] transition-colors" data-testid="integrations-cta">
              {t('resx.integrations.customCta')} <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
