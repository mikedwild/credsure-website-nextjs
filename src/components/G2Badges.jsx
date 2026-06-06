"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { useTranslations as useTranslation } from 'next-intl';

const G2_BADGES = [
  { label: 'Easiest To Do Business With', season: 'Winter 2025' },
  { label: 'Easiest To Use', season: 'Winter 2025' },
  { label: 'High Performer', season: 'Winter 2025' },
  { label: 'Highest User Adoption', season: 'Winter 2025' },
  { label: 'Best Meets Requirements', season: 'Winter 2025' },
  { label: 'Easiest Setup', season: 'Winter 2025' },
];

const Badge = ({ label, season, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.08 }}
    viewport={{ once: true }}
    className="flex flex-col items-center gap-2 group"
  >
    <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-[#ff492c] to-[#ff6b4a] flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
      <svg viewBox="0 0 40 40" className="w-10 h-10 md:w-12 md:h-12 text-white" fill="currentColor">
        <path d="M20 2L25.5 13.5L38 15.5L29 24L31.5 36.5L20 30.5L8.5 36.5L11 24L2 15.5L14.5 13.5L20 2Z" />
      </svg>
    </div>
    <div className="text-center">
      <p className="text-xs md:text-sm font-bold text-[#0F0E1A]  leading-tight max-w-[110px]">{label}</p>
      <p className="text-[10px] text-gray-600 mt-0.5">{season}</p>
    </div>
  </motion.div>
);

export const G2Badges = () => {
  const t = useTranslation();

  return (
    <section className="py-16 md:py-20 bg-white " data-testid="g2-badges-section">
      <div className="container mx-auto px-6 md:px-12">
        <div className="text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-600 mb-3">
            {t('g2.subtitle', 'Rated by Real Users on G2')}
          </p>
          <h2 className="text-base md:text-lg font-bold text-[#0F0E1A] ">
            {t('g2.title', 'CredSure Ranks at the Top for Digital Credential Management')}
          </h2>
        </div>
        <div className="flex flex-wrap items-start justify-center gap-6 md:gap-10">
          {G2_BADGES.map((badge, i) => (
            <Badge key={badge.label} label={badge.label} season={badge.season} index={i} />
          ))}
        </div>
        <div className="text-center mt-8">
          <a
            href="https://www.g2.com/products/credsure/reviews"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#5B22D6]  hover:underline"
            data-testid="g2-reviews-link"
          >
            {t('g2.readReviews', 'Read our G2 Reviews')}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
          </a>
        </div>
      </div>
    </section>
  );
};
