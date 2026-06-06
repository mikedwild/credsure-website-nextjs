"use client";
import React from 'react';
import { SEO, createBreadcrumbSchema, createPersonSchema, getBaseUrl } from '@/components/SEO';
import { useTranslations as useTranslation } from 'next-intl';
import { Mail, MapPin, Shield, Database, Eye, Zap, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { LocalizedLink as Link } from '@/components/LocalizedLink';

export const AboutUs = () => {
  const { t } = useTranslation();
  const baseUrl = getBaseUrl();

  const team = [
    { name: 'Tim Miller', role: 'Co-Founder & CEO', image: '/images/team/tim-miller.webp', bioKey: 'pages.about.teamTimBio', linkedin: 'https://www.linkedin.com/in/tim-miller-1005822/' },
    { name: 'Markus Dohm', role: 'Co-Founder', image: '/images/team/markus-dohm.webp', bioKey: 'pages.about.teamMarkusBio', linkedin: 'https://www.linkedin.com/in/markus-dohm-a0124315a/' },
    { name: 'Mike D Wild', role: 'Chief Operating Officer', image: '/images/team/mike-wild.webp', bioKey: 'pages.about.teamMikeBio', linkedin: 'https://www.linkedin.com/in/michaelwild1/' },
  ];

  const values = [
    { icon: Shield, titleKey: 'pages.about.valueTrusted', descKey: 'pages.about.valueTrustedDesc' },
    { icon: Database, titleKey: 'pages.about.valueDataControl', descKey: 'pages.about.valueDataControlDesc' },
    { icon: Eye, titleKey: 'pages.about.valueTransparent', descKey: 'pages.about.valueTransparentDesc' },
    { icon: Zap, titleKey: 'pages.about.valueQuickVerification', descKey: 'pages.about.valueQuickVerificationDesc' },
  ];

  const offices = [
    { city: 'Cologne', country: 'Germany (HQ)', address: 'Am Grauen Stein, 51105 Cologne, Germany' },
    { city: 'Bangalore', country: 'India', address: '2nd Cross Road, 8th Main, Vasanthnagar, 560052 Bangalore' },
    { city: 'Manila', country: 'Philippines', address: '2241 Chino Roces Ave, La Fuerza Building, Makati, 1231 Metro Manila' },
  ];

  const breadcrumbs = [
    { name: 'Home', path: '/' },
    { name: t('pages.about.badge'), path: '/about-us' },
  ];

  const teamSchemas = team.map((member) =>
    createPersonSchema({ name: member.name, jobTitle: member.role, bio: t(member.bioKey), image: member.image }, baseUrl)
  );

  const combinedSchema = {
    '@context': 'https://schema.org',
    '@graph': [createBreadcrumbSchema(breadcrumbs, baseUrl), ...teamSchemas],
  };

  return (
    <div className="min-h-screen bg-white " data-testid="about-us-page">
      <SEO titleKey="seo.aboutUs.title" descriptionKey="seo.aboutUs.description" keywordsKey="seo.aboutUs.keywords" canonical="/about-us" structuredData={combinedSchema} />

      {/* Hero */}
      <section className="pt-32 pb-20 brand-gradient text-white">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 font-heading">
              {t('pages.about.heroTitle')}{' '}
              <span className="text-transparent bg-gradient-to-r from-white to-blue-200 bg-clip-text">{t('pages.about.heroTitleHighlight')}</span>
            </h1>
            <p className="text-lg md:text-xl text-white/90 font-body leading-relaxed max-w-3xl mx-auto">{t('pages.about.heroDesc')}</p>
          </motion.div>
        </div>
      </section>

      {/* The Beginning */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white  ">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#3F2BD9]  mb-2 block">{t('pages.about.storyBadge')}</span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900  mb-6 font-heading">{t('pages.about.storyTitle')}</h2>
              <p className="text-slate-600  leading-relaxed mb-4">{t('pages.about.storyP1')}</p>
              <p className="text-slate-600  leading-relaxed">{t('pages.about.storyP2')}</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-[#5B22D6]/10 to-[#E22B8A]/10   flex items-center justify-center p-12">
                <img src="/credsure-logo-main.webp" alt="CredSure" className="w-full max-w-xs opacity-80  " loading="lazy" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-white ">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#3F2BD9]  mb-2 block">{t('pages.about.valuesBadge')}</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900  font-heading">{t('pages.about.valuesTitle')}</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {values.map((val) => {
              const Icon = val.icon;
              return (
                <motion.div key={val.titleKey} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
                  className="p-6 bg-slate-50  border border-slate-200  rounded-2xl hover:border-[#5B22D6]/40 hover:shadow-lg transition-all" data-testid={`value-card-${val.titleKey}`}>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#5B22D6] to-[#3F2BD9] flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900  mb-2">{t(val.titleKey)}</h3>
                  <p className="text-sm text-slate-600  leading-relaxed">{t(val.descKey)}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Blockchain */}
      <section className="py-20 bg-gradient-to-br from-[#5B22D6] to-[#3F2BD9] text-white">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 font-heading">{t('pages.about.blockchainTitle')}</h2>
            <p className="text-lg text-white/90 leading-relaxed mb-6">{t('pages.about.blockchainP1')}</p>
            <p className="text-white/80 leading-relaxed">{t('pages.about.blockchainP2')}</p>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-white ">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#3F2BD9]  mb-2 block">{t('pages.about.teamBadge')}</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900  mb-4 font-heading">{t('pages.about.teamTitle')}</h2>
            <p className="text-base md:text-lg text-slate-600  max-w-2xl mx-auto">{t('pages.about.teamDesc')}</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {team.map((member) => (
              <motion.div key={member.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 }}
                className="group text-center" data-testid={`team-member-${member.name}`}>
                <div className="relative mb-5 overflow-hidden rounded-2xl aspect-square bg-gradient-to-br from-slate-100 to-slate-200   mx-auto max-w-[280px]">
                  <img src={member.image} alt={member.name} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                </div>
                <h3 className="text-xl font-bold text-slate-900  mb-1 font-heading">{member.name}</h3>
                <p className="text-[#5B22D6]  font-semibold text-sm mb-2">{member.role}</p>
                <p className="text-sm text-slate-500  leading-relaxed px-2 mb-3">{t(member.bioKey)}</p>
                {member.linkedin && (
                  <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-[#0077b5] hover:text-[#005e94] transition-colors" data-testid={`linkedin-${member.name}`}>
                    <ExternalLink className="w-4 h-4" /> LinkedIn
                  </a>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Locations */}
      <section className="py-20 bg-slate-50 ">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#3F2BD9]  mb-2 block">{t('pages.about.locationsBadge')}</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900  font-heading">{t('pages.about.locationsTitle')}</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {offices.map((office, i) => (
              <motion.div key={office.city} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
                className="p-6 bg-white  border border-slate-200  rounded-2xl text-center" data-testid={`office-location-${office.city}`}>
                <div className="w-12 h-12 rounded-full bg-[#5B22D6]/10  flex items-center justify-center mx-auto mb-4">
                  {i === 0 ? <Globe className="w-6 h-6 text-[#5B22D6] " /> : <MapPin className="w-6 h-6 text-[#5B22D6] " />}
                </div>
                <h3 className="text-lg font-bold text-slate-900  mb-1">{office.city}</h3>
                <p className="text-sm font-semibold text-[#5B22D6]  mb-2">{office.country}</p>
                <p className="text-sm text-slate-500 ">{office.address}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-purple-50  ">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900  mb-6 font-heading">{t('pages.about.ctaTitle')}</h2>
            <p className="text-base md:text-lg text-slate-600  mb-8">{t('pages.about.ctaDesc')}</p>
            <Link to="/demo">
              <Button className="brand-gradient text-white px-8 py-6 text-lg rounded-2xl font-semibold hover:opacity-90 transition-opacity" data-testid="about-cta-button">
                <Mail className="mr-2 w-5 h-5" />{t('pages.about.ctaButton')}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
