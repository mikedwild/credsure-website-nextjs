"use client";
import React from 'react';
import { SEO } from '@/components/SEO';
import { useTranslation } from '@/lib/useTranslation';
import { motion } from 'framer-motion';
import { Sparkles, BookOpen, FileText, Users, HelpCircle, Mail, Play } from 'lucide-react';
import { LocalizedLink as Link } from '@/components/LocalizedLink';

export const Resources = () => {
  const t = useTranslation();

  const sections = [
    { icon: BookOpen, titleKey: 'megaMenu.resources.blogLabel', descKey: 'megaMenu.resources.blogDesc', link: '/blog' },
    { icon: FileText, titleKey: 'megaMenu.resources.customerStories', descKey: 'megaMenu.resources.customerStoriesDesc', link: '/customer-success' },
    { icon: Users, titleKey: 'megaMenu.resources.aboutUs', descKey: 'megaMenu.resources.aboutUsDesc', link: '/about' },
    { icon: HelpCircle, titleKey: 'megaMenu.resources.helpCenter', descKey: 'megaMenu.resources.helpCenterDesc', link: '/help-center' },
    { icon: Mail, titleKey: 'megaMenu.resources.contactSupport', descKey: 'megaMenu.resources.contactSupportDesc', link: '/contact' },
    { icon: Play, titleKey: 'megaMenu.resources.videoTutorials', descKey: 'megaMenu.resources.videoTutorialsDesc', link: '/tutorials' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#FAFAFA] to-white   ">
      <SEO titleKey="resources.seo.title" descriptionKey="resources.seo.description" canonical="/resources" />
      <section className="pt-32 pb-20">
        <div className="container mx-auto px-6 md:px-12 max-w-6xl">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-4xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white  border border-purple-200  rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-[#B82BC4]" />
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#3F2BD9] ">{t('pages.resources.badge')}</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#0F0E1A]  mb-6">{t('pages.resources.title')} <span className="text-transparent bg-gradient-to-r from-[#5B22D6] to-[#E22B8A] bg-clip-text">{t('pages.resources.titleHighlight')}</span></h1>
            <p className="text-base md:text-lg text-gray-600 ">{t('pages.resources.subtitle')}</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sections.map((item, i) => {
              const Icon = item.icon;
              return (
                <Link key={item.link} to={item.link}>
                  <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} whileHover={{ y: -4 }} className="bg-white  border border-gray-200  rounded-2xl p-6 hover:shadow-xl transition-all h-full">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#5B22D6] to-[#3F2BD9] rounded-xl flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-[#0F0E1A]  mb-2">{t(item.titleKey)}</h3>
                    <p className="text-gray-600  text-sm">{t(item.descKey)}</p>
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
