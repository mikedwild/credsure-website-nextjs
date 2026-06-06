"use client";
/**
 * StatsSection (v2 — Beamery enterprise style)
 *
 * Refreshed look: clean white band, gradient digits, simple icon tiles
 * in pastel-tinted squares (no rainbow gradients), and a subtle
 * background image of a credential moment.
 */
import React from 'react';
import { motion } from 'framer-motion';
import { useTranslations as useTranslation } from 'next-intl';
import { NumberCounter } from './NumberCounter';
import { TrendingUp, Users, Award, Globe } from 'lucide-react';

export const StatsSection = () => {
  const t = useTranslation();

  const stats = [
    { icon: Users, value: 150, suffix: '+', labelKey: 'statsSection.orgsLabel', tile: '#F0DAD2' },
    { icon: Award, value: 2.5, suffix: 'M+', labelKey: 'statsSection.credentialsLabel', tile: '#E2D4F2' },
    { icon: Globe, value: 45, suffix: '+', labelKey: 'statsSection.countriesLabel', tile: '#D8E5DA' },
    { icon: TrendingUp, value: 99.9, suffix: '%', labelKey: 'statsSection.uptimeLabel', tile: '#FCE7B5' },
  ];

  return (
    <section className="py-24 md:py-28 relative overflow-hidden" style={{ background: '#FFFFFF' }} aria-labelledby="stats-heading">
      {/* Subtle peach + lavender wash */}
      <div className="absolute top-0 right-0 w-[460px] h-[460px] rounded-full blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,184,158,0.20) 0%, transparent 70%)' }} aria-hidden="true" />
      <div className="absolute bottom-0 left-0 w-[420px] h-[420px] rounded-full blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(187,158,255,0.18) 0%, transparent 70%)' }} aria-hidden="true" />

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <h2 id="stats-heading" className="text-center text-3xl md:text-5xl font-bold text-[#0F0E1A] mb-3 max-w-3xl mx-auto leading-tight tracking-tight">
          {t('statsSection.heading', 'The most trusted digital credentialing platform')}
        </h2>
        <p className="text-center text-base md:text-lg text-[#2E2A3D] mb-14 max-w-2xl mx-auto">
          {t('statsSection.subtitle', 'Numbers that prove what we promise — across 45 countries and growing.')}
        </p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={`stat-${stat.labelKey}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="rounded-2xl p-6 text-left group transition-shadow hover:shadow-lg"
              style={{ background: '#FFFFFF', border: '1px solid #ECE7F1' }}
              data-testid={`stat-card-${stat.labelKey}`}
            >
              <div className="w-12 h-12 mb-5 rounded-xl flex items-center justify-center" style={{ background: stat.tile }}>
                <stat.icon className="w-5 h-5" style={{ color: '#0F0E1A' }} strokeWidth={1.8} />
              </div>
              <div className="text-4xl md:text-5xl font-bold text-[#0F0E1A] tracking-tight leading-none mb-2">
                <span className="cs-grad-text">
                  <NumberCounter end={stat.value} suffix={stat.suffix} duration={2.5} />
                </span>
              </div>
              <p className="text-xs uppercase tracking-[0.16em] font-semibold text-[#6A6478]">
                {t(stat.labelKey)}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
