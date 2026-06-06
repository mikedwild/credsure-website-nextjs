"use client";
import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Cookie } from 'lucide-react';
import { useTranslation } from '@/lib/useTranslation';
import { Button } from '../ui/button';

export const CookieBanner = ({ onAcceptAll, onRejectAll, onCustomize }) => {
  const t = useTranslation();
  const bannerRef = useRef(null);

  // Reserve scroll-space at the bottom of the page so the banner never
  // floats *over* footer links. Without this, fixed-position sticky banners
  // intercept clicks on the bottom 100-200px of every page.
  useEffect(() => {
    const apply = () => {
      const h = bannerRef.current?.offsetHeight || 140;
      document.body.style.paddingBottom = `${h + 8}px`;
    };
    apply();
    window.addEventListener('resize', apply);
    return () => {
      window.removeEventListener('resize', apply);
      document.body.style.paddingBottom = '';
    };
  }, []);

  return (
    <div ref={bannerRef} className="fixed bottom-0 left-0 right-0 z-50 bg-white  border-t-2 border-slate-200  shadow-2xl animate-in slide-in-from-bottom duration-500">
      <div className="container mx-auto px-6 py-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            <div className="w-12 h-12 brand-gradient rounded-xl flex items-center justify-center flex-shrink-0">
              <Cookie className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-900  mb-2 font-heading">{t('cookies.title')}</h3>
              <p className="text-slate-600  text-sm leading-relaxed font-body">{t('cookies.description')}</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <Button onClick={onCustomize} variant="outline" className="flex-1 sm:flex-none border-2 border-slate-300  hover:border-brand-purple text-slate-700  px-6">
              {t('cookies.customize')}
            </Button>
            <Button onClick={onRejectAll} variant="outline" className="flex-1 sm:flex-none border-2 border-slate-300  hover:border-slate-400 text-slate-700  px-6">
              {t('cookies.rejectAll')}
            </Button>
            <Button onClick={onAcceptAll} className="flex-1 sm:flex-none brand-gradient hover:opacity-90 text-white px-8" data-testid="cookie-accept-all">
              {t('cookies.acceptAll')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

CookieBanner.propTypes = {
  onAcceptAll: PropTypes.func.isRequired,
  onRejectAll: PropTypes.func.isRequired,
  onCustomize: PropTypes.func.isRequired,
};
