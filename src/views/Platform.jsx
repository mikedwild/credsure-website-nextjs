"use client";
import React, { lazy, Suspense } from 'react';
import { SEO, createSpeakableSchema, createFAQSchema, combineSchemas, getBaseUrl } from '@/components/SEO';
import { useTranslations as useTranslation } from 'next-intl';
import { useLocation } from '@/lib/router-shim';
import { motion } from 'framer-motion';
import { LayoutDashboard, Shield, Share2, BarChart3, Zap, Plug, CheckCircle2, Award, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LocalizedLink as Link } from '@/components/LocalizedLink';
import LazyMount from '@/components/LazyMount';
import { platformStats, platformHowItWorks, platformIntegrations } from '../data/featureContent';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

// Lazy-loaded: PlatformCapabilityTable lives in the heavier
// `SolutionEnrichment` chunk (used by multiple solution pages). Pulling
// it out of the initial Platform-page chunk + deferring hydration until
// scroll trims ~400-700 ms of TBT on slow CPUs.
const PlatformCapabilityTable = lazy(() =>
  import('../components/SolutionEnrichment').then(m => ({ default: m.PlatformCapabilityTable }))
);

const platformFAQ = [
  { question: 'How long does it take to get started with CredSure?', answer: 'Most organizations are up and running within a day. Create your account, design your first credential template, and issue your first batch — no technical setup required. Enterprise integrations (LMS, API) typically take 1-2 weeks.' },
  { question: 'Can I migrate from another credentialing platform?', answer: 'Yes. CredSure supports migration from Accredible, Credly, Certifier, and custom systems. Our migration team handles data import, template recreation, and recipient notification at no extra cost on Professional and Enterprise plans.' },
  { question: 'What makes CredSure different from Credly or Accredible?', answer: 'CredSure offers blockchain verification (not just digital storage), transparent pricing (no hidden fees), full white-label capability, and bilingual support (English & German). Our platform is built for both certificates and badges, with a unified dashboard.' },
  { question: 'Is there a free trial?', answer: 'Yes. Every account starts with 20 free credits to issue and test credentials. No credit card required. Upgrade to a paid plan when you are ready to scale.' },
  { question: 'Do credentials work offline?', answer: 'Yes. Recipients can download their credentials as PDF or add them to digital wallets for offline access. Verification requires an internet connection, but the credential itself is always accessible.' },
];

export const Platform = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const baseUrl = getBaseUrl();

  const featureKeys = ['credentialManagement', 'blockchainVerification', 'socialSharing', 'analytics'];
  const featureIcons = { credentialManagement: LayoutDashboard, blockchainVerification: Shield, socialSharing: Share2, analytics: BarChart3 };

  const automationKeys = ['bulkIssuance', 'apiIntegration', 'autoIssue'];
  const automationIcons = { bulkIssuance: Zap, apiIntegration: Plug, autoIssue: CheckCircle2 };

  const customizationKeys = ['templateDesigner', 'whiteLabel', 'customDomains'];
  const customizationIcons = { templateDesigner: Award, whiteLabel: LayoutDashboard, customDomains: Share2 };

  const schemas = combineSchemas(
    createSpeakableSchema(
      { title: 'CredSure Digital Credentialing Platform', description: 'Everything you need to issue, manage, and verify digital credentials at scale. Blockchain-verified certificates and badges trusted by 150+ organizations.' },
      ['h1', 'h2', '.platform-description']
    ),
    createFAQSchema(platformFAQ, baseUrl, location.pathname)
  );

  const featureLinks = {
    credentialManagement: '/features/digital-certificates',
    blockchainVerification: '/features/blockchain',
    socialSharing: '/features/sharing',
    analytics: '/features/analytics',
    bulkIssuance: '/features/bulk-issuance',
    apiIntegration: '/features/api-integration',
    autoIssue: '/features/auto-issue',
    templateDesigner: '/features/template-designer',
    whiteLabel: '/features/white-label',
    customDomains: '/features/custom-domains',
  };

  const renderFeatureCard = (key, icons, showItems = false, isHero = false) => {
    const Icon = icons[key];
    const items = t(`pages.platform.features.${key}.items`, { returnObjects: true });
    const href = featureLinks[key];
    const card = (
      <motion.div key={key} whileHover={{ y: -4 }} className={`bg-white  border border-gray-200  rounded-2xl ${isHero ? 'p-8' : 'p-6'} hover:shadow-xl hover:border-[#5B22D6]/30 transition-all h-full group`}>
        <div className={`${isHero ? 'w-14 h-14' : 'w-12 h-12'} bg-gradient-to-br from-[#5B22D6] to-[#3F2BD9] rounded-xl flex items-center justify-center mb-4`}>
          <Icon className={`${isHero ? 'w-7 h-7' : 'w-6 h-6'} text-white`} />
        </div>
        <h3 className={`${isHero ? 'text-2xl' : 'text-lg'} font-bold text-[#0F0E1A]  mb-2`}>{t(`pages.platform.features.${key}.title`)}</h3>
        <p className={`text-gray-600  ${isHero ? 'text-base' : 'text-sm'} mb-4`}>{t(`pages.platform.features.${key}.desc`)}</p>
        {showItems && Array.isArray(items) && (
          <ul className={`space-y-2 ${isHero ? 'grid grid-cols-2 gap-x-4 gap-y-2 space-y-0' : ''}`}>
            {items.map((item, i) => (
              <li key={`platform-item-${i}`} className="flex items-center gap-2 text-sm text-gray-700 ">
                <CheckCircle2 className="w-4 h-4 text-[#E22B8A] flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        )}
        {href && (
          <div className="mt-4 flex items-center text-[#5B22D6] font-medium text-sm group-hover:translate-x-1 transition-transform">
            Learn more <ArrowRight className="w-4 h-4 ml-1" />
          </div>
        )}
      </motion.div>
    );
    return href ? <Link key={key} to={href} className="block h-full">{card}</Link> : card;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#FAFAFA] to-white   ">
      <SEO titleKey="platform.seo.title" descriptionKey="platform.seo.description" canonical="/platform" structuredData={schemas} />

      {/* Hero */}
      <section className="pt-32 pb-16">
        <div className="container mx-auto px-6 md:px-12 max-w-6xl">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-4xl mx-auto mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white  border border-purple-200  rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-[#B82BC4]" />
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#3F2BD9] ">{t('pages.platform.badge')}</span>
            </div>
            <h1 data-testid="platform-title" className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#0F0E1A]  mb-6">
              {t('pages.platform.title')} <span className="text-transparent bg-gradient-to-r from-[#5B22D6] to-[#E22B8A] bg-clip-text">{t('pages.platform.titleHighlight')}</span>
            </h1>
            <p className="platform-description text-base md:text-lg text-gray-600  leading-relaxed max-w-3xl mx-auto">
              {t('pages.platform.subtitle')}. Blockchain-verified digital certificates and badges trusted by 150+ organizations worldwide. Issue, manage, verify, and track credentials at any scale — from 10 to 10 million.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-14 bg-gradient-to-r from-[#5B22D6] to-[#3F2BD9]" data-testid="platform-stats">
        <div className="container mx-auto px-6 md:px-12 max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {platformStats.map((stat) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="text-center">
                <div className="text-3xl md:text-4xl font-extrabold text-white mb-2">{stat.value}</div>
                <div className="text-sm text-white/80">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-slate-50 " data-testid="platform-how-it-works">
        <div className="container mx-auto px-6 md:px-12 max-w-5xl">
          <h2 className="text-3xl font-bold text-[#0F0E1A]  mb-4 text-center">
            How CredSure <span className="text-transparent bg-gradient-to-r from-[#5B22D6] to-[#E22B8A] bg-clip-text">Works</span>
          </h2>
          <p className="text-center text-gray-500  mb-12 text-sm">From design to verification in four simple steps</p>
          <div className="grid md:grid-cols-4 gap-6">
            {platformHowItWorks.map((step, i) => (
              <motion.div key={step.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="relative">
                <div className="bg-white  border border-gray-200  rounded-2xl p-6 h-full hover:shadow-lg transition-shadow">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#5B22D6] to-[#E22B8A] rounded-xl flex items-center justify-center mb-4">
                    <span className="text-white font-bold text-lg">{step.step}</span>
                  </div>
                  <h3 className="text-lg font-bold text-[#0F0E1A]  mb-2">{step.title}</h3>
                  <p className="text-gray-600  text-sm leading-relaxed">{step.desc}</p>
                </div>
                {i < platformHowItWorks.length - 1 && (
                  <div className="hidden md:flex absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-6 h-6 text-[#5B22D6]/30" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features - Bento */}
      <section className="py-20 bg-white ">
        <div className="container mx-auto px-6 md:px-12 max-w-6xl">
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-[#0F0E1A]  mb-4 text-center">
              Core <span className="text-transparent bg-gradient-to-r from-[#5B22D6] to-[#E22B8A] bg-clip-text">Features</span>
            </h2>
            <p className="text-center text-gray-500  mb-8 text-sm">The foundation of your credentialing program</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featureKeys.map((key) => (
                <div key={key}>
                  {renderFeatureCard(key, featureIcons, true, false)}
                </div>
              ))}
            </div>
          </div>

          {/* Automation */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-[#0F0E1A]  mb-4 text-center">
              <span className="text-transparent bg-gradient-to-r from-[#5B22D6] to-[#E22B8A] bg-clip-text">Automation</span>
            </h2>
            <p className="text-center text-gray-500  mb-8 text-sm">Eliminate manual work with intelligent automation</p>
            <div className="grid md:grid-cols-3 gap-6">
              {automationKeys.map(key => renderFeatureCard(key, automationIcons))}
            </div>
          </div>

          {/* Customization */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-[#0F0E1A]  mb-4 text-center">
              <span className="text-transparent bg-gradient-to-r from-[#5B22D6] to-[#E22B8A] bg-clip-text">Customization</span>
            </h2>
            <p className="text-center text-gray-500  mb-8 text-sm">Make it yours with full brand control</p>
            <div className="grid md:grid-cols-3 gap-6">
              {customizationKeys.map(key => renderFeatureCard(key, customizationIcons))}
            </div>
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-16 bg-slate-50 " data-testid="platform-integrations">
        <div className="container mx-auto px-6 md:px-12 max-w-5xl">
          <h2 className="text-3xl font-bold text-[#0F0E1A]  mb-4 text-center">
            Integrates With Your <span className="text-transparent bg-gradient-to-r from-[#5B22D6] to-[#E22B8A] bg-clip-text">Tech Stack</span>
          </h2>
          <p className="text-center text-gray-500  mb-10 text-sm">Connect CredSure to 3,000+ tools via API and Zapier</p>
          <div className="flex flex-wrap justify-center gap-4">
            {platformIntegrations.map((name, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="px-6 py-3 bg-white  border border-gray-200  rounded-full text-sm font-medium text-slate-700  hover:border-[#5B22D6]/50 transition-colors"
              >
                {name}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Capability Table — lazy-mounted on scroll to keep first-paint snappy */}
      <Suspense fallback={null}>
        <LazyMount minHeight={600} testId="lazy-platform-capability-table"><PlatformCapabilityTable /></LazyMount>
      </Suspense>

      {/* FAQ — deferred so the Accordion runtime doesn't load at first paint */}
      <LazyMount minHeight={500} testId="lazy-platform-faq">
      <section className="py-20 bg-slate-50 " data-testid="platform-faq">
        <div className="container mx-auto px-6 md:px-12 max-w-4xl">
          <h2 className="text-3xl font-bold text-[#0F0E1A]  mb-8 text-center">
            Frequently Asked <span className="text-transparent bg-gradient-to-r from-[#5B22D6] to-[#E22B8A] bg-clip-text">Questions</span>
          </h2>
          <Accordion type="single" collapsible className="space-y-4">
            {platformFAQ.map((faq, index) => (
              <AccordionItem
                key={`platform-faq-${faq.question?.slice(0, 30) || index}`}
                value={`faq-${index}`}
                className="bg-white  border border-slate-200  rounded-xl px-6 hover:border-[#5B22D6]/30 transition-colors"
              >
                <AccordionTrigger className="text-left text-base font-semibold text-slate-900  hover:text-[#5B22D6] py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-slate-600  leading-relaxed pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
      </LazyMount>

      {/* CTA */}
      <section className="py-16 bg-white ">
        <div className="container mx-auto px-6 md:px-12 max-w-3xl text-center">
          <h2 className="text-2xl font-bold text-[#0F0E1A]  mb-4">
            Ready to transform your credentialing?
          </h2>
          <p className="text-sm text-gray-500  mb-8">{t('pages.platform.ctaDesc')}</p>
          <Link to="/demo">
            <Button className="brand-gradient hover:opacity-90 text-white px-12 py-6 text-lg rounded-2xl">
              {t('pages.platform.cta')}
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};
