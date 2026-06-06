"use client";
import React, { useState } from 'react';
import { SEO, createBreadcrumbSchema, getBaseUrl } from '@/components/SEO';
import { useTranslations as useTranslation } from 'next-intl';
import { motion } from 'framer-motion';
import { LocalizedLink as Link } from '@/components/LocalizedLink';
import { ArrowRight, BookOpen, Download, Clock, Lock } from 'lucide-react';
import { GatedContentModal } from '@/components/GatedContentModal';

const guides = [
  {
    id: 'complete-guide-digital-credentials',
    title: 'The Complete Guide to Digital Credentials in 2026',
    description: 'Everything you need to know about implementing, managing, and scaling a digital credentialing program. From strategy to execution.',
    category: 'Getting Started',
    readTime: '25 min read',
    image: 'https://images.unsplash.com/photo-1641580550451-3a452effc5b7?w=800&h=450&fit=crop',
    featured: true,
    content: [
      { heading: 'What Are Digital Credentials?', body: 'Digital credentials are verified, tamper-proof records of achievements, skills, or qualifications issued electronically. Unlike paper certificates, they can be instantly verified by employers, shared on social platforms like LinkedIn, and stored securely using blockchain technology. In 2026, organizations worldwide are adopting digital credentials to reduce fraud, increase efficiency, and empower their learners.' },
      { heading: 'Why Digital Credentials Matter in 2026', body: 'The credentialing landscape has shifted dramatically. With remote work, global hiring, and skills-based recruitment on the rise, employers need instant, trustworthy verification. Digital credentials solve this by providing cryptographically secure, one-click verification that eliminates manual background checks and reduces time-to-hire by up to 60%.' },
      { heading: 'Building Your Credential Strategy', body: 'A successful credentialing program starts with clear goals: Are you issuing completion certificates, professional badges, or micro-credentials? Define your audience, choose your verification method (blockchain vs. digital signature), and design credentials that recipients will actually want to share. The best programs see 3x higher engagement when credentials are visually appealing and easily shareable.' },
      { heading: 'Implementation Roadmap', body: 'Phase 1: Audit your current certification process and identify pain points. Phase 2: Select a credentialing platform that supports your scale (CredSure handles 10M+ credentials). Phase 3: Design your credential templates with your brand guidelines. Phase 4: Integrate with your LMS or HR system via API. Phase 5: Launch with a pilot group, gather feedback, and iterate. Most organizations complete this in 4-8 weeks.' },
      { heading: 'Measuring Success', body: 'Track these KPIs: credential issuance rate, recipient share rate (aim for 40%+), employer verification clicks, time saved vs. manual processes, and learner satisfaction scores. Organizations using CredSure report an average 35% reduction in administrative costs and 4x increase in credential sharing compared to PDF certificates.' },
    ],
  },
  {
    id: 'blockchain-verification-whitepaper',
    title: 'Blockchain Verification: A Technical Deep Dive',
    description: 'Understand how blockchain technology secures digital credentials and why it matters for your organization.',
    category: 'Technology',
    readTime: '15 min read',
    image: 'https://images.unsplash.com/photo-1635840418908-772c54d7931f?w=800&h=450&fit=crop',
    content: [
      { heading: 'How Blockchain Secures Credentials', body: 'Each credential is hashed and anchored to a public blockchain, creating an immutable record that cannot be altered or forged. When a verifier checks a credential, they compare the document hash against the blockchain record — if they match, the credential is authentic. This process takes under 2 seconds and requires no contact with the issuing organization.' },
      { heading: 'Public vs. Private Blockchains', body: 'CredSure uses a hybrid approach: credential hashes are stored on public blockchains (Ethereum, Polygon) for maximum transparency, while personal data remains off-chain in encrypted databases compliant with GDPR. This gives you the security of blockchain without exposing sensitive information.' },
      { heading: 'Integration Architecture', body: 'The verification flow is simple: Issue credential → Generate hash → Anchor to blockchain → Provide verification URL. Recipients share their credential link, and anyone can verify it instantly without creating an account or installing software. The entire system is API-first, making integration with existing platforms straightforward.' },
    ],
  },
  {
    id: 'roi-credentialing-program',
    title: 'Measuring ROI of Your Credentialing Program',
    description: 'A practical framework for calculating and communicating the return on investment of digital credentials.',
    category: 'Strategy',
    readTime: '12 min read',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop',
    content: [
      { heading: 'The ROI Framework', body: 'Calculate your credentialing ROI using this formula: (Time saved + Cost reduction + Revenue from increased engagement) - Platform cost = Net ROI. Most organizations see positive ROI within the first quarter. Factor in: printing/shipping elimination ($3-8 per certificate), administrative hours saved (avg. 15 hrs/month), and increased program enrollment from shareable credentials.' },
      { heading: 'Hidden Value Drivers', body: 'Beyond direct cost savings, digital credentials drive brand visibility (each shared credential reaches an average of 200 LinkedIn connections), reduce fraud liability, improve audit readiness, and increase learner retention by 25%. These indirect benefits often exceed the direct cost savings.' },
      { heading: 'Making the Business Case', body: 'Present your ROI case to leadership using three lenses: operational efficiency (cost/time savings), strategic value (brand reach, competitive advantage), and risk mitigation (fraud prevention, compliance). Use CredSure\'s ROI Calculator to generate a customized projection for your organization.' },
    ],
  },
  {
    id: 'gdpr-compliance-credentials',
    title: 'GDPR Compliance for Credential Programs',
    description: 'Navigate European data protection regulations when issuing and managing digital credentials.',
    category: 'Compliance',
    readTime: '18 min read',
    image: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=800&h=450&fit=crop',
    content: [
      { heading: 'GDPR and Digital Credentials', body: 'Digital credentials contain personal data (names, achievements, dates), making them subject to GDPR. Key requirements: obtain explicit consent before issuing, provide data portability (recipients must be able to download/transfer), implement right to erasure, and maintain records of processing activities. CredSure is fully GDPR-compliant with EU data centers.' },
      { heading: 'Data Minimization Best Practices', body: 'Only include necessary information on credentials. A blockchain hash of the credential provides verification without storing personal data on-chain. Use pseudonymization where possible, and implement automatic data retention policies. CredSure\'s architecture ensures personal data never touches the blockchain.' },
      { heading: 'Cross-Border Considerations', body: 'When issuing credentials to recipients in multiple countries, ensure your data processing agreements cover international transfers. Use Standard Contractual Clauses (SCCs) for non-EU transfers, and maintain a Record of Processing Activities (ROPA) that documents your credential lifecycle.' },
    ],
  },
  {
    id: 'micro-credentials-higher-education',
    title: 'Micro-Credentials in Higher Education: A Complete Playbook',
    description: 'How universities are using stackable micro-credentials to drive enrollment, retention, and career outcomes.',
    category: 'Higher Education',
    readTime: '20 min read',
    image: 'https://images.unsplash.com/photo-1763673404757-e6dfe627941b?w=800&h=450&fit=crop',
    content: [
      { heading: 'The Micro-Credential Revolution', body: 'Universities are supplementing traditional degrees with stackable micro-credentials that validate specific skills. These shorter, focused certifications attract working professionals, boost enrollment in continuing education, and provide students with shareable proof of in-demand competencies. Institutions using micro-credentials report 40% higher enrollment in professional development programs.' },
      { heading: 'Designing Stackable Pathways', body: 'Create credential pathways where individual micro-credentials combine into larger qualifications. For example: 4 data science micro-credentials → Data Analytics Certificate → combined with electives for a Master\'s pathway. This modular approach increases flexibility and student retention.' },
      { heading: 'Implementation for Universities', body: 'Start with your most popular continuing education courses. Partner with industry advisors to ensure credentials align with employer needs. Use CredSure\'s LMS integration to auto-issue credentials upon course completion, and track which credentials drive the most enrollment and career outcomes.' },
    ],
  },
  {
    id: 'digital-badges-employee-training',
    title: 'Digital Badges for Employee Training Programs',
    description: 'Design and implement a badge-based recognition system that motivates learners and tracks competencies.',
    category: 'Corporate Training',
    readTime: '14 min read',
    image: 'https://images.pexels.com/photos/7647951/pexels-photo-7647951.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop',
    content: [
      { heading: 'Why Badges Work', body: 'Digital badges tap into intrinsic motivation by providing visible recognition of achievement. Employees who earn badges are 3x more likely to complete additional training modules. Badges also create a skills map across your organization, helping HR identify expertise gaps and plan targeted upskilling programs.' },
      { heading: 'Badge Design Principles', body: 'Effective badges are: visually distinct (use unique colors/icons per skill area), clearly named (avoid jargon), criteria-transparent (recipients and viewers know exactly what was demonstrated), and shareable (one-click LinkedIn sharing). Include metadata like issuer, date, criteria, and evidence links.' },
      { heading: 'Measuring Training Impact', body: 'Track badge earn rates, time-to-completion, share rates, and correlation with performance metrics. Organizations using CredSure badges report 45% higher training completion rates and can demonstrate clear ROI on their L&D investment to leadership.' },
    ],
  },
];

export const Guides = () => {
  const t = useTranslation();
  const baseUrl = getBaseUrl();
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
              Back to All Guides
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
              <h3 className="text-2xl font-extrabold mb-3">Ready to Get Started?</h3>
              <p className="text-white/80 mb-6 max-w-md mx-auto">See how CredSure can transform your credentialing program.</p>
              <Link to="/demo" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#5B22D6] font-bold rounded-xl hover:bg-white/90 transition-all">
                Book a Demo <ArrowRight className="w-4 h-4" />
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
                    <span className="px-3 py-1 bg-[#5B22D6]/90 backdrop-blur-sm rounded-full text-xs font-bold text-white">Featured</span>
                  </div>
                </div>
                <div className="p-8 md:p-12 flex flex-col justify-center">
                  <span className="text-sm text-[#E22B8A] font-semibold mb-3">{featured.category}</span>
                  <h2 className="text-2xl md:text-3xl font-bold text-[#0F0E1A]  mb-4 group-hover:text-[#5B22D6] transition-colors">{featured.title}</h2>
                  <p className="text-gray-600  mb-6 leading-relaxed">{featured.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500  mb-6">
                    <div className="flex items-center gap-1"><Clock className="w-4 h-4" />{featured.readTime}</div>
                    <div className="flex items-center gap-1"><Download className="w-4 h-4" />PDF Available</div>
                  </div>
                  <button onClick={() => handleGuideClick(featured)} className="inline-flex items-center text-[#5B22D6] hover:text-[#3F2BD9] font-bold" data-testid="guide-featured-cta">
                    {isUnlocked(featured.title) ? 'Read Guide' : (
                      <><Lock className="w-4 h-4 mr-1.5" />Unlock Guide</>
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
                      {isUnlocked(guide.title) ? 'Read' : <><Lock className="w-3.5 h-3.5 mr-1" />Unlock</>}
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
            Talk to an Expert <ArrowRight className="ml-2 w-5 h-5" />
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
