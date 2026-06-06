"use client";
import React from 'react';
import { SEO, createBreadcrumbSchema, createVideoObjectSchema, getBaseUrl } from '@/components/SEO';
import { useTranslation } from '@/lib/useTranslation';
import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { LocalizedLink as Link } from '@/components/LocalizedLink';
import { ArrowRight, Play, Calendar, Clock, Users } from 'lucide-react';

// Webinar dates are stored as ISO 8601 with UTC offset so Google's VideoObject
// schema validator accepts them (Search Console previously flagged the bare
// YYYY-MM-DD form with "Datetime property 'uploadDate' is missing a time zone").
const webinars = [
  {
    id: 'digital-credentials-101',
    title: 'Digital Credentials 101: Getting Started with CredSure',
    description: 'Learn the fundamentals of digital credentialing — from setting up your first template to issuing blockchain-verified certificates at scale. Perfect for organizations new to digital credentials.',
    date: '2025-03-15T10:00:00+00:00',
    duration: '45 min',
    speakers: ['CredSure Product Team'],
    status: 'recorded',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop',
    featured: true,
  },
  {
    id: 'blockchain-verification-explained',
    title: 'How Blockchain Verification Works in CredSure',
    description: 'A technical overview of how CredSure anchors credentials on the blockchain, ensuring tamper-proof verification that employers and institutions can trust globally.',
    date: '2025-02-20T10:00:00+00:00',
    duration: '35 min',
    speakers: ['CredSure Engineering Team'],
    status: 'recorded',
    image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=450&fit=crop',
  },
  {
    id: 'scaling-credential-programs',
    title: 'Scaling Your Credential Program: From Hundreds to Millions',
    description: 'Best practices for organizations looking to scale their digital credentialing programs, including bulk issuance workflows, API integration, and automated delivery.',
    date: '2025-01-25T10:00:00+00:00',
    duration: '50 min',
    speakers: ['CredSure Customer Success Team'],
    status: 'recorded',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop',
  },
  {
    id: 'gdpr-compliant-credentialing',
    title: 'GDPR-Compliant Digital Credentialing',
    description: 'A practical guide to ensuring your credentialing program meets European data protection regulations. Covers data handling, consent management, and CredSure\'s built-in compliance features.',
    date: '2024-12-10T10:00:00+00:00',
    duration: '40 min',
    speakers: ['CredSure Compliance Team'],
    status: 'recorded',
    image: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=800&h=450&fit=crop',
  },
  {
    id: 'api-integration-masterclass',
    title: 'CredSure API Integration Masterclass',
    description: 'A hands-on workshop walking through the CredSure REST API to automate credential issuance, verification, and management. Includes live coding examples with Moodle, Canvas, and Zapier.',
    date: '2024-11-18T10:00:00+00:00',
    duration: '60 min',
    speakers: ['CredSure Developer Relations'],
    status: 'recorded',
    image: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&h=450&fit=crop',
  },
  {
    id: 'micro-credentials-higher-education',
    title: 'Micro-Credentials in Higher Education: A CredSure Guide',
    description: 'How universities and colleges are implementing stackable micro-credentials using CredSure to meet the demands of modern learners and employers worldwide.',
    date: '2024-10-05T10:00:00+00:00',
    duration: '45 min',
    speakers: ['CredSure Education Team'],
    status: 'recorded',
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c476?w=800&h=450&fit=crop',
  },
];

const formatWebinarDate = (dateStr, lang = 'en') => {
  const d = new Date(dateStr);
  const locale = lang === 'de' ? 'de-DE' : 'en-US';
  return d.toLocaleDateString(locale, { month: 'long', day: 'numeric', year: 'numeric' });
};

export const Webinars = () => {
  const t = useTranslation();
  const i18n = { language: useLocale() };
  const baseUrl = getBaseUrl();

  const featured = webinars.find(w => w.featured);
  const rest = webinars.filter(w => !w.featured);

  const videoSchemas = webinars.map(w =>
    createVideoObjectSchema({
      name: w.title,
      description: w.description,
      uploadDate: w.date,
      duration: `PT${parseInt(w.duration)}M`,
      thumbnailUrl: w.image,
      // Each webinar has its own detail page; satisfies Google's
      // "contentUrl OR embedUrl is required" rule.
      contentUrl: `${baseUrl}/${i18n.language}/webinars/${w.id}`,
    }, baseUrl)
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#FAFAFA] to-white" data-testid="webinars-page">
      <SEO
        titleKey="seo.webinars.title"
        descriptionKey="seo.webinars.description"
        canonical="/webinars"
        structuredData={videoSchemas[0]}
      />

      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-[#FAFAFA] via-white to-purple-50/30">
        <div className="container mx-auto px-6 md:px-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#5B22D6]/10 rounded-full mb-6">
            <Play className="w-4 h-4 text-[#5B22D6]" />
            <span className="text-sm font-semibold text-[#5B22D6]">{t('pages.webinars.badge', 'On-Demand')}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#0F0E1A] mb-6">
            {t('pages.webinars.title', 'Webinars &')}{' '}
            <span className="text-transparent bg-gradient-to-r from-[#5B22D6] to-[#E22B8A] bg-clip-text">
              {t('pages.webinars.titleHighlight', 'Workshops')}
            </span>
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            {t('pages.webinars.subtitle', 'Watch expert-led sessions on digital credentialing, blockchain verification, and program management.')}
          </p>
        </div>
      </section>

      {/* Featured Webinar */}
      {featured && (
        <section className="py-12">
          <div className="container mx-auto px-6 md:px-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white border border-gray-200 rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-500 group"
            >
              <div className="grid md:grid-cols-2 gap-0">
                <div className="relative aspect-video md:aspect-auto overflow-hidden">
                  <img src={featured.image} alt={featured.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors">
                    <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="w-7 h-7 text-[#5B22D6] ml-1" />
                    </div>
                  </div>
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-[#5B22D6]/90 backdrop-blur-sm rounded-full text-xs font-bold text-white">Featured</span>
                  </div>
                </div>
                <div className="p-8 md:p-12 flex flex-col justify-center">
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1"><Calendar className="w-4 h-4" />{formatWebinarDate(featured.date, i18n.language)}</div>
                    <div className="flex items-center gap-1"><Clock className="w-4 h-4" />{featured.duration}</div>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-[#0F0E1A] mb-4 group-hover:text-[#5B22D6] transition-colors">{featured.title}</h2>
                  <p className="text-gray-600 mb-6 leading-relaxed">{featured.description}</p>
                  <div className="flex items-center gap-2 mb-6">
                    <Users className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-500">{featured.speakers.join(', ')}</span>
                  </div>
                  <Link to="/demo" className="inline-flex items-center text-[#5B22D6] hover:text-[#3F2BD9] font-bold" data-testid="webinar-featured-cta">
                    Request Access <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-2 transition-transform" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Webinar Grid */}
      <section className="py-12">
        <div className="container mx-auto px-6 md:px-12">
          <h2 className="text-2xl font-bold text-[#0F0E1A] mb-8">{t('pages.webinars.allWebinars', 'All Webinars')}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rest.map((webinar, idx) => (
              <motion.div
                key={webinar.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-[#5B22D6] hover:shadow-xl transition-all duration-500"
              >
                <div className="relative aspect-video overflow-hidden">
                  <img src={webinar.image} alt={webinar.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                      <Play className="w-5 h-5 text-[#5B22D6] ml-0.5" />
                    </div>
                  </div>
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold text-[#5B22D6]">On-Demand</span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                    <div className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{formatWebinarDate(webinar.date, i18n.language)}</div>
                    <div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{webinar.duration}</div>
                  </div>
                  <h3 className="text-lg font-bold text-[#0F0E1A] mb-2 group-hover:text-[#5B22D6] transition-colors line-clamp-2">{webinar.title}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{webinar.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 flex items-center gap-1"><Users className="w-3.5 h-3.5" />{webinar.speakers.join(', ')}</span>
                    <Link to="/demo" className="inline-flex items-center text-[#5B22D6] hover:text-[#3F2BD9] font-bold text-sm" data-testid={`webinar-${webinar.id}-cta`}>
                      Watch <ArrowRight className="ml-1 w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
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
          <h2 className="text-3xl md:text-4xl font-bold mb-6">{t('pages.webinars.ctaTitle', 'Want a Live Demo?')}</h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">{t('pages.webinars.ctaDesc', 'See CredSure in action with a personalized walkthrough from our team.')}</p>
          <Link to="/demo" className="inline-flex items-center px-8 py-4 bg-white text-[#5B22D6] rounded-xl font-bold hover:bg-white/90 transition-colors" data-testid="webinars-cta-btn">
            Book a Demo <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};
