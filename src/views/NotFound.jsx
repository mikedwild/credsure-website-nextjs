"use client";
import React from 'react';
import { LocalizedLink as Link } from '@/components/LocalizedLink';
import { useTranslations as useTranslation } from 'next-intl';
import { motion } from 'framer-motion';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SEO } from '@/components/SEO';

export default function NotFound() {
  const t = useTranslation();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-purple-50/30  ">
      <SEO
        titleKey="seo.notFound.title"
        descriptionKey="seo.notFound.description"
        noIndex
      />
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center px-6">
        <div className="text-8xl font-black text-transparent bg-gradient-to-r from-[#5B22D6] to-[#E22B8A] bg-clip-text mb-6">404</div>
        <h1 className="text-3xl font-bold text-[#0F0E1A]  mb-4">{t('pages.notFound.title')}</h1>
        <p className="text-gray-600  mb-8 max-w-md mx-auto">{t('pages.notFound.desc')}</p>
        <Link to="/">
          <Button className="brand-gradient hover:opacity-90 text-white px-8 py-4 rounded-2xl">
            <Home className="w-5 h-5 mr-2" />
            {t('pages.notFound.goHome')}
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
