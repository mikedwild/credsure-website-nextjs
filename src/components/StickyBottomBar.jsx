"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslations as useTranslation } from 'next-intl';
import { useLocalizedNavigate } from '@/utils/useLocalizedNavigate';
import { ArrowRight, X } from 'lucide-react';

export const StickyBottomBar = () => {
  const { t } = useTranslation();
  const navigate = useLocalizedNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [cookieHandled, setCookieHandled] = useState(false);

  const checkCookieConsent = useCallback(() => {
    const consent = localStorage.getItem('cookieConsent');
    setCookieHandled(!!consent);
  }, []);

  useEffect(() => {
    const dismissed = sessionStorage.getItem('sticky-bar-dismissed');
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    checkCookieConsent();

    // Poll for cookie consent changes (fires when user accepts/rejects)
    const interval = setInterval(checkCookieConsent, 500);

    const handleScroll = () => {
      const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      setIsVisible(scrollPercent > 15);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(interval);
    };
  }, [checkCookieConsent]);

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('sticky-bar-dismissed', 'true');
  };

  const handleBookDemo = () => {
    navigate('/demo');
  };

  if (isDismissed || !isVisible || !cookieHandled) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[100] transition-transform duration-500 ease-out"
      data-testid="sticky-bottom-bar"
    >
      <div className="bg-gradient-to-r from-[#5B22D6] via-[#5B22D6] to-[#E22B8A] shadow-[0_-4px_20px_rgba(59,49,129,0.3)]">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between py-3 md:py-3.5 gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm md:text-base truncate">
                {t('stickyBar.text', 'Ready to modernize your credentials?')}
              </p>
              <p className="text-white/70 text-xs md:text-sm hidden sm:block">
                {t('stickyBar.subtext', 'Join 150+ organizations already using CredSure')}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleBookDemo}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-[#5B22D6] font-bold text-sm rounded-lg hover:bg-white/90 transition-all hover:shadow-lg cursor-pointer"
                data-testid="sticky-bar-cta"
              >
                {t('stickyBar.cta', 'Book a Demo')}
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={handleDismiss}
                className="p-2 text-white/60 hover:text-white transition-colors rounded-lg hover:bg-white/10"
                aria-label="Dismiss"
                data-testid="sticky-bar-dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
