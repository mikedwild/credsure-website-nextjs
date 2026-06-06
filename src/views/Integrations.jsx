"use client";
import React from 'react';
import { SEO, createBreadcrumbSchema, getBaseUrl } from '@/components/SEO';
import { useTranslations as useTranslation } from 'next-intl';
import { motion } from 'framer-motion';
import { LocalizedLink as Link } from '@/components/LocalizedLink';
import { Sparkles, ArrowRight, Zap, GraduationCap, Users, BarChart3, ShoppingCart, FileSpreadsheet, Calendar, CheckCircle2, Globe } from 'lucide-react';

const integrationCategories = [
  {
    id: 'lms',
    icon: GraduationCap,
    title: 'Learning Management Systems',
    titleDe: 'Lernmanagementsysteme',
    description: 'Automatically issue credentials when learners complete courses, modules, or assessments.',
    descriptionDe: 'Automatische Ausstellung von Zertifikaten, wenn Lernende Kurse, Module oder Prüfungen abschließen.',
    integrations: [
      { name: 'Moodle', desc: 'Issue credentials for course completions and enrollments', logo: null },
      { name: 'LearnDash', desc: 'WordPress LMS with automated certificate triggers', logo: null },
      { name: 'Teachable', desc: 'Online course platform credential automation', logo: null },
      { name: 'TalentLMS', desc: 'Enterprise training completion credentials', logo: null },
      { name: 'Thinkific', desc: 'Course completion and milestone badges', logo: null },
      { name: 'LearnWorlds', desc: 'Interactive course credential delivery', logo: null },
      { name: 'Skilljar', desc: 'Customer education certification', logo: null },
      { name: 'LearnUpon', desc: 'Corporate training program credentials', logo: null },
      { name: 'EdApp', desc: 'Microlearning completion badges', logo: null },
      { name: 'Pluto LMS', desc: 'Custom LMS integration via API', logo: null },
    ],
  },
  {
    id: 'crm',
    icon: Users,
    title: 'CRM & Marketing',
    titleDe: 'CRM & Marketing',
    description: 'Sync credential data with your CRM to track engagement and nurture certified contacts.',
    descriptionDe: 'Synchronisieren Sie Zertifikatsdaten mit Ihrem CRM, um Engagement zu verfolgen und zertifizierte Kontakte zu pflegen.',
    integrations: [
      { name: 'Salesforce', desc: 'Sync credential status and recipient data', logo: null },
      { name: 'HubSpot', desc: 'Trigger workflows based on credential events', logo: null },
      { name: 'Microsoft Dynamics 365', desc: 'Enterprise CRM credential tracking', logo: null },
      { name: 'ActiveCampaign', desc: 'Email automation for credential holders', logo: null },
    ],
  },
  {
    id: 'productivity',
    icon: FileSpreadsheet,
    title: 'Productivity & Data',
    titleDe: 'Produktivität & Daten',
    description: 'Connect your existing tools to automate credential workflows without code.',
    descriptionDe: 'Verbinden Sie Ihre bestehenden Tools, um Zertifikats-Workflows ohne Code zu automatisieren.',
    integrations: [
      { name: 'Google Sheets', desc: 'Bulk issue from spreadsheet data', logo: null },
      { name: 'Airtable', desc: 'Database-driven credential automation', logo: null },
      { name: 'Typeform', desc: 'Issue credentials on form submission', logo: null },
      { name: 'Asana', desc: 'Project milestone credential triggers', logo: null },
      { name: 'Calendly', desc: 'Event attendance verification', logo: null },
    ],
  },
  {
    id: 'ecommerce',
    icon: ShoppingCart,
    title: 'E-Commerce & Websites',
    titleDe: 'E-Commerce & Webseiten',
    description: 'Issue credentials for purchases, course enrollments, and membership achievements.',
    descriptionDe: 'Vergeben Sie Zertifikate für Käufe, Kursanmeldungen und Mitgliedschaftsleistungen.',
    integrations: [
      { name: 'WooCommerce', desc: 'WordPress e-commerce credential delivery', logo: null },
      { name: 'Wix', desc: 'Website builder integration', logo: null },
    ],
  },
  {
    id: 'social',
    icon: BarChart3,
    title: 'Social & Communication',
    titleDe: 'Social & Kommunikation',
    description: 'Enable credential sharing and team notifications across communication platforms.',
    descriptionDe: 'Ermöglichen Sie das Teilen von Zertifikaten und Team-Benachrichtigungen über Kommunikationsplattformen.',
    integrations: [
      { name: 'LinkedIn', desc: 'One-click credential sharing to profiles', logo: null, color: '#0A66C2' },
      { name: 'Slack', desc: 'Team notifications for issued credentials', logo: null, color: '#4A154B' },
      { name: 'Microsoft Teams', desc: 'Credential alerts in team channels', logo: null, color: '#6264A7' },
      { name: 'Google Workspace', desc: 'Gmail and Drive integration', logo: null, color: '#4285F4' },
    ],
  },
];

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
  const { t, i18n } = useTranslation();
  const isDE = i18n.language === 'de';
  const baseUrl = getBaseUrl();
  const breadcrumbs = [{ name: 'Home', path: '/' }, { name: 'Integrations', path: '/integrations' }];
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
                  <p className="text-xs text-gray-500">{isDE ? 'Integrationen' : 'Integrations'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <Globe className="w-5 h-5 text-[#3F2BD9]" />
                </div>
                <div className="text-left">
                  <p className="text-2xl font-bold text-[#0F0E1A]">8,000+</p>
                  <p className="text-xs text-gray-500">{isDE ? 'Apps via Zapier' : 'Apps via Zapier'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-left">
                  <p className="text-2xl font-bold text-[#0F0E1A]">REST API</p>
                  <p className="text-xs text-gray-500">{isDE ? 'Individuelle Integration' : 'Custom Integration'}</p>
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
                <h3 className="text-xl font-bold">{isDE ? 'Verbinden Sie sich mit 8.000+ Apps' : 'Connect to 8,000+ Apps'}</h3>
                <p className="text-white/80 text-sm">{isDE ? 'CredSure lässt sich nahtlos über Zapier mit Tausenden von Apps verbinden — ohne Code.' : 'CredSure connects seamlessly to thousands of apps via Zapier — no code required.'}</p>
              </div>
            </div>
            <a href="https://zapier.com/apps/credsure/integrations" target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-6 py-3 bg-white text-[#5B22D6] rounded-xl font-bold hover:bg-white/90 transition-colors whitespace-nowrap" data-testid="zapier-link">
              {isDE ? 'Auf Zapier ansehen' : 'View on Zapier'} <ArrowRight className="ml-2 w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Integration Categories */}
      <section className="py-16">
        <div className="container mx-auto px-6 md:px-12">
          <div className="space-y-16">
            {integrationCategories.map((category, catIdx) => {
              const Icon = category.icon;
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
                      <h2 className="text-2xl font-bold text-[#0F0E1A]">{isDE ? category.titleDe : category.title}</h2>
                      <p className="text-sm text-gray-500">{isDE ? category.descriptionDe : category.description}</p>
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
            <h2 className="text-3xl md:text-4xl font-bold text-[#0F0E1A] mb-4">{isDE ? 'Individuelle Integration benötigt?' : 'Need a Custom Integration?'}</h2>
            <p className="text-lg text-gray-600 mb-8">{isDE ? 'Unsere REST API ermöglicht die Integration mit jeder Plattform. Unser Team unterstützt Sie beim Aufbau.' : 'Our REST API allows integration with any platform. Our team will help you build it.'}</p>
            <div className="grid sm:grid-cols-3 gap-6 mb-10">
              {[
                { title: isDE ? 'REST API' : 'REST API', desc: isDE ? 'Vollständige API-Dokumentation für Entwickler' : 'Full API documentation for developers' },
                { title: isDE ? 'Webhooks' : 'Webhooks', desc: isDE ? 'Echtzeit-Benachrichtigungen für Zertifikatsereignisse' : 'Real-time notifications for credential events' },
                { title: isDE ? 'SSO / SAML' : 'SSO / SAML', desc: isDE ? 'Enterprise Single Sign-On Integration' : 'Enterprise single sign-on integration' },
              ].map((item) => (
                <div key={item.title} className="bg-white rounded-2xl p-6 border border-gray-100">
                  <h3 className="font-bold text-[#0F0E1A] mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              ))}
            </div>
            <Link to="/demo" className="inline-flex items-center px-8 py-4 bg-[#5B22D6] text-white rounded-xl font-bold hover:bg-[#2d2461] transition-colors" data-testid="integrations-cta">
              {isDE ? 'Integration besprechen' : 'Discuss Your Integration'} <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
