"use client";
import React from 'react';
import { SEO, createBreadcrumbSchema, getBaseUrl } from '@/components/SEO';
import { useTranslations as useTranslation } from 'next-intl';
import { motion } from 'framer-motion';
import { Award, TrendingUp, Users, CheckCircle2 } from 'lucide-react';
import { LocalizedLink as Link } from '@/components/LocalizedLink';
import { Button } from '@/components/ui/button';

export const CustomerSuccess = () => {
  const t = useTranslation();
  const baseUrl = getBaseUrl();
  const breadcrumbs = [{ name: 'Home', path: '/' }, { name: 'Customer Stories', path: '/customer-success' }];

  const successStories = [
    {
      id: 1,
      company: 'ByteEDGE Learning',
      logo: '/images/success-stories/byteedge-hero.webp',
      title: t('pages.customerSuccess.byteedgeTitle'),
      date: 'February 14, 2022',
      impact: [
        t('pages.customerSuccess.byteedgeImpact1'),
        t('pages.customerSuccess.byteedgeImpact2'),
        t('pages.customerSuccess.byteedgeImpact3')
      ],
      category: 'Education',
      gradient: 'from-purple-600 to-pink-600',
      link: '/customer-success/byteedge'
    },
    {
      id: 2,
      company: 'Tsaaro',
      logo: '/images/success-stories/tsaaro-hero.webp',
      title: t('pages.customerSuccess.tsaaroTitle'),
      date: 'August 18, 2022',
      impact: [
        t('pages.customerSuccess.tsaaroImpact1'),
        t('pages.customerSuccess.tsaaroImpact2'),
        t('pages.customerSuccess.tsaaroImpact3')
      ],
      category: 'Privacy & Compliance',
      gradient: 'from-blue-600 to-cyan-600',
      link: '/customer-success/tsaaro'
    },
    {
      id: 3,
      company: 'Clini INDIA',
      logo: '/images/success-stories/clini-india-hero.webp',
      title: t('pages.customerSuccess.cliniTitle'),
      date: 'January 25, 2022',
      impact: [
        t('pages.customerSuccess.cliniImpact1'),
        t('pages.customerSuccess.cliniImpact2'),
        t('pages.customerSuccess.cliniImpact3')
      ],
      category: 'Healthcare',
      gradient: 'from-teal-600 to-green-600',
      link: '/customer-success/clini-india'
    },
    {
      id: 4,
      company: 'EADSM',
      logo: null,
      title: 'From Paper to Digital: EADSM Automates Certification with CredSure',
      date: 'April 17, 2025',
      impact: [
        'Improved visibility and credibility',
        'Streamlined membership certifications',
        'Enhanced social sharing capabilities'
      ],
      category: 'Associations',
      gradient: 'from-indigo-600 to-purple-600',
      link: '/demo'
    },
    {
      id: 5,
      company: 'ASDC',
      logo: null,
      title: 'ASDC Issues 200K+ Digital Credentials via CredSure',
      date: 'September 3, 2021',
      impact: [
        '200,000+ credentials issued',
        'Automated certification process',
        'Improved operational efficiency'
      ],
      category: 'Skills Development',
      gradient: 'from-orange-600 to-red-600',
      link: '/demo'
    },
    {
      id: 6,
      company: 'ASTS Global Education',
      logo: null,
      title: 'ASTS Global Education Makes Students Industry-Ready with CredSure',
      date: 'May 19, 2021',
      impact: [
        'Industry-ready digital credentials',
        'Enhanced employability',
        'Global recognition'
      ],
      category: 'Education',
      gradient: 'from-pink-600 to-rose-600',
      link: '/demo'
    }
  ];

  const stats = [
    { icon: Users, value: '500K+', label: 'Credentials Issued' },
    { icon: Award, value: '200+', label: 'Organizations' },
    { icon: TrendingUp, value: '95%', label: 'Efficiency Gain' }
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#FAFAFA] to-white   ">
      <SEO
        titleKey="seo.customerSuccess.title"
        descriptionKey="seo.customerSuccess.description"
        keywordsKey="seo.customerSuccess.keywords"
        canonical="/customer-success"
        structuredData={createBreadcrumbSchema(breadcrumbs, baseUrl)}
      />

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-[#FAFAFA] via-white to-purple-50/30    relative overflow-hidden">
        <div className="container mx-auto px-6 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#0F0E1A]  mb-6 leading-tight">
              {t('pages.customerSuccess.title')}
            </h1>
            <p className="text-base md:text-lg text-gray-600  leading-relaxed mb-12">
              {t('pages.customerSuccess.subtitle')}
            </p>
          </motion.div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-16">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white border border-gray-200 rounded-2xl p-6 text-center"
                >
                  <Icon className="w-10 h-10 text-[#5B22D6] mx-auto mb-4" />
                  <div className="text-4xl font-bold bg-gradient-to-r from-[#5B22D6] via-[#B82BC4] to-[#E22B8A] bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600 uppercase tracking-wide">
                    {stat.label}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Success Stories - Bento Layout */}
      <section className="py-20">
        <div className="container mx-auto px-6 md:px-12">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            {successStories.map((story, idx) => {
              const isFeatured = idx < 2;
              return (
                <motion.article
                  key={story.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08 }}
                >
                  <Link
                    to={story.link}
                    className="block group bg-white border border-gray-200 rounded-3xl overflow-hidden hover:border-[#5B22D6] hover:shadow-2xl transition-all duration-500 cursor-pointer flex flex-col"
                  >
                    <div className={`relative ${isFeatured ? 'h-56' : 'h-48'} bg-gradient-to-br ${story.gradient} overflow-hidden`}>
                      {story.logo ? (
                        <img
                          src={story.logo}
                          alt={story.company}
                          className="w-full h-full object-cover opacity-90"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-white/90 font-bold text-2xl text-center px-4">{story.company}</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                      {isFeatured && (
                        <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold text-[#5B22D6]">
                          Featured
                        </div>
                      )}
                    </div>

                    <div className={`${isFeatured ? 'p-7' : 'p-6'}`}>
                      <span className="inline-block px-3 py-1 bg-purple-100 text-[#5B22D6] text-xs font-bold rounded-full mb-3 w-fit">
                        {story.category}
                      </span>
                      <h3 className={`${isFeatured ? 'text-xl' : 'text-lg'} font-bold text-[#0F0E1A] mb-2 line-clamp-2 group-hover:text-[#5B22D6] transition-colors leading-snug`}>
                        {story.title}
                      </h3>
                      <p className="text-xs text-gray-500 mb-4">{story.date}</p>

                      <div className="space-y-2">
                        {story.impact.map((point, index) => (
                          <div key={`impact-${index}`} className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-700">{point}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Link>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[#5B22D6] to-[#3F2BD9]">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">{t('pages.customerSuccess.ctaTitle')}</h2>
            <p className="text-xl text-white/90 mb-8">
              {t('pages.customerSuccess.ctaSubtitle')}
            </p>
            <Link to="/demo">
              <Button className="bg-white text-[#5B22D6] hover:bg-white/90 px-10 py-6 text-lg rounded-2xl font-semibold">
                {t('pages.customerSuccess.ctaButton')}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
