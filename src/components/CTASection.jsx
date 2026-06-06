"use client";
import React from 'react';
import PropTypes from 'prop-types';
import { useTranslations as useTranslation } from 'next-intl';
import { ArrowRight, ShieldCheck, CheckCircle, Zap, HeadphonesIcon } from 'lucide-react';
import { Button } from './ui/button';

export const CTASection = ({ onCtaClick }) => {
  const t = useTranslation();

  const trustIndicators = [
    { icon: ShieldCheck, key: 'security' },
    { icon: CheckCircle, key: 'gdpr' },
    { icon: Zap, key: 'uptime' },
    { icon: HeadphonesIcon, key: 'support' }
  ];

  return (
    <section className="py-28 md:py-32 relative overflow-hidden" style={{ background: '#FFFFFF' }}>
      {/* Subtle peach + lavender wash — Beamery restraint */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[520px] h-[520px] rounded-full blur-3xl" style={{ background: 'radial-gradient(circle, rgba(255,184,158,0.40) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 left-0 w-[480px] h-[480px] rounded-full blur-3xl" style={{ background: 'radial-gradient(circle, rgba(187,158,255,0.35) 0%, transparent 70%)' }} />
      </div>

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Headline — dark ink with purple→pink gradient */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 leading-[1.1] tracking-tight font-heading" style={{ color: '#0F0E1A' }}>
            <span className="cs-grad-text">{t('ctaHomepage.headline')}</span>
          </h2>

          {/* Subheadline */}
          <p className="text-lg md:text-xl mb-12 leading-relaxed font-body max-w-3xl mx-auto" style={{ color: '#2E2A3D' }}>
            {t('ctaHomepage.subheadline')}
          </p>

          {/* CTA Button — TalentSure gradient pill */}
          <div className="flex flex-col items-center gap-6">
            <Button
              size="lg"
              onClick={onCtaClick}
              data-testid="cta-section-button"
              className="group cs-btn cs-btn-gradient !rounded-full !px-12 !py-8 !text-xl !text-white hover:!scale-105 transition-all duration-300 font-heading !font-semibold"
            >
              {t('ctaHomepage.ctaText')}
              <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </Button>

            {/* Secondary text */}
            <p className="text-base" style={{ color: '#6A6478' }}>
              {t('ctaHomepage.secondaryText')}
            </p>
          </div>

          {/* Trust indicators */}
          <div className="mt-16 flex flex-wrap justify-center items-center gap-8">
            {trustIndicators.map((item) => {
              const IconComponent = item.icon;
              return (
                <div key={item.key} className="flex items-center gap-2" style={{ color: '#2E2A3D' }}>
                  <IconComponent className="w-5 h-5" style={{ color: '#5B22D6' }} />
                  <span className="text-sm font-medium">{t(`ctaHomepage.${item.key}`)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

CTASection.propTypes = {
  onCtaClick: PropTypes.func,
};
