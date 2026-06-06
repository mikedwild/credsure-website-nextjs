"use client";
import React from 'react';
import { SEO, createBreadcrumbSchema, getBaseUrl } from '@/components/SEO';
import { useTranslations as useTranslation } from 'next-intl';
import { motion } from 'framer-motion';
import { LocalizedLink as Link } from '@/components/LocalizedLink';
import { Award, Shield, Share2, BarChart3, CheckCircle2, Users, ArrowRight, Zap, Globe, ExternalLink } from 'lucide-react';
import { composedTiles } from '../data/featureMedia';

const badgeFeatures = [
  {
    icon: Award,
    title: 'Standards Compliant',
    desc: 'Every badge issued on CredSure meets industry standards, ensuring global interoperability and machine-readability.',
  },
  {
    icon: Shield,
    title: 'Blockchain-Verified',
    desc: 'Each badge is anchored on the blockchain, making it tamper-proof and instantly verifiable by any employer or institution.',
  },
  {
    icon: Share2,
    title: 'One-Click Social Sharing',
    desc: 'Recipients can share badges directly to LinkedIn, Twitter, and other platforms with a single click — boosting your brand visibility.',
  },
  {
    icon: BarChart3,
    title: 'Real-Time Analytics',
    desc: 'Track badge views, shares, verifications, and engagement in real-time from your analytics dashboard.',
  },
  {
    icon: ExternalLink,
    title: 'LinkedIn Integration',
    desc: 'Badges can be directly added to LinkedIn profiles, increasing professional credibility and your program\'s reach.',
  },
  {
    icon: Globe,
    title: 'Multi-Language Support',
    desc: 'Issue and verify badges in English and German, with metadata that adapts to the recipient\'s preferred language.',
  },
];

const useCases = [
  { title: 'Skills & Competency Badges', desc: 'Validate specific skills like data analysis, project management, or coding proficiency with micro-credential badges.' },
  { title: 'Course Completion Badges', desc: 'Automatically issue badges when learners complete courses on your LMS (Moodle, LearnDash, Thinkific, etc.).' },
  { title: 'Event & Conference Badges', desc: 'Reward attendance and participation at conferences, webinars, and workshops with shareable digital badges.' },
  { title: 'Professional Development', desc: 'Issue CPD and CPE badges that stack into larger credentials, helping professionals track continuing education.' },
  { title: 'Membership & Affiliation', desc: 'Provide organization membership badges that verify active status and professional affiliation.' },
  { title: 'Achievement & Milestone Badges', desc: 'Celebrate milestones like employee anniversaries, certifications earned, or project completions.' },
];

export const DigitalBadges = () => {
  const { t } = useTranslation();
  const baseUrl = getBaseUrl();
  const breadcrumbs = [{ name: 'Home', path: '/' }, { name: 'Digital Badges', path: '/digital-badges' }];

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
                <span className="text-sm font-semibold text-[#5B22D6]">Digital Badges</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#0F0E1A] mb-6 leading-[1.05]">
                Issue Verifiable{' '}
                <span className="text-transparent bg-gradient-to-r from-[#5B22D6] to-[#E22B8A] bg-clip-text">Digital Badges</span>
              </h1>
              <p className="text-base md:text-lg text-gray-600 max-w-xl mb-8">
                Create and issue standards-compliant digital badges that recipients can share on LinkedIn, verify instantly, and stack into larger credentials.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/demo" className="inline-flex items-center justify-center px-8 py-4 bg-[#5B22D6] text-white rounded-xl font-bold hover:bg-[#2d2461] transition-colors" data-testid="badges-demo-btn">
                  Start Issuing Badges <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <Link to="/features/template-designer" className="inline-flex items-center justify-center px-8 py-4 border-2 border-[#5B22D6] text-[#5B22D6] rounded-xl font-bold hover:bg-[#5B22D6]/5 transition-colors">
                  Browse Templates
                </Link>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-8 mt-12 flex-wrap">
                <div>
                  <p className="text-3xl font-bold text-[#0F0E1A]">150+</p>
                  <p className="text-sm text-gray-500">Organisations</p>
                </div>
                <div className="w-px h-10 bg-slate-200 hidden sm:block"></div>
                <div>
                  <p className="text-3xl font-bold text-[#0F0E1A]">500K+</p>
                  <p className="text-sm text-gray-500">Badges Shared</p>
                </div>
                <div className="w-px h-10 bg-slate-200 hidden sm:block"></div>
                <div>
                  <p className="text-3xl font-bold text-[#0F0E1A]">50+</p>
                  <p className="text-sm text-gray-500">Countries</p>
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
            <h2 className="text-3xl md:text-4xl font-bold text-[#0F0E1A] mb-4">Everything You Need for Digital Badges</h2>
            <p className="text-lg text-gray-600">Enterprise-grade badge issuance with consumer-grade simplicity.</p>
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
          <h2 className="text-3xl md:text-4xl font-bold text-[#0F0E1A] text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[
              { step: '1', title: 'Design Your Badge', desc: 'Use our template editor to create professional badge designs in minutes.' },
              { step: '2', title: 'Upload Recipients', desc: 'Add recipients individually or bulk import via CSV or API.' },
              { step: '3', title: 'Issue & Deliver', desc: 'Send badges via email with verified delivery and custom branding.' },
              { step: '4', title: 'Track & Analyze', desc: 'Monitor shares, verifications, and engagement in real-time.' },
            ].map((item, idx) => (
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
          <h2 className="text-3xl md:text-4xl font-bold text-[#0F0E1A] text-center mb-12">Badge Use Cases</h2>
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
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Start Issuing Digital Badges Today</h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">Join 150+ organizations using CredSure to issue, verify, and track digital badges at scale.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/demo" className="inline-flex items-center justify-center px-8 py-4 bg-white text-[#5B22D6] rounded-xl font-bold hover:bg-white/90 transition-colors" data-testid="badges-cta-btn">
              Book a Demo <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link to="/compare/accredible" className="inline-flex items-center justify-center px-8 py-4 border-2 border-white/30 text-white rounded-xl font-bold hover:bg-white/10 transition-colors">
              Compare Alternatives
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
