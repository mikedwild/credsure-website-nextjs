"use client";
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useLocation } from '@/lib/router-shim';
import { X } from 'lucide-react';
import { getOfferVariant } from './exitIntent/getOfferVariant';
import { RoiCalculatorVariant } from './exitIntent/RoiCalculatorVariant';
import { PdfGuideVariant } from './exitIntent/PdfGuideVariant';
import { DemoIncentiveVariant } from './exitIntent/DemoIncentiveVariant';

export const ExitIntentPopup = ({ onSubmit }) => {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [hasFired, setHasFired] = useState(false);

  // Resolve which variant to render based on current path. Recomputed only on path change.
  const variant = useMemo(() => getOfferVariant(location.pathname), [location.pathname]);

  const shouldSuppress = useCallback(() => {
    const dismissed = sessionStorage.getItem('exit-intent-dismissed');
    const submitted = localStorage.getItem('exit-intent-submitted');
    const doNotShow = localStorage.getItem('exit-intent-do-not-show');
    const lastVisit = localStorage.getItem('exit-intent-last-visit');

    if (dismissed || submitted || doNotShow) return true;

    // 24-hour suppression after a dismissal
    if (lastVisit) {
      const hoursSince = (Date.now() - parseInt(lastVisit, 10)) / (1000 * 60 * 60);
      if (hoursSince < 24) return true;
    }
    return false;
  }, []);

  const triggerPopup = useCallback(() => {
    if (hasFired || shouldSuppress()) return;
    setIsVisible(true);
    setHasFired(true);
  }, [hasFired, shouldSuppress]);

  // Trigger 1: Mouse leave (desktop) — bound after 5s grace
  const handleMouseLeave = useCallback((e) => {
    if (e.clientY <= 0) triggerPopup();
  }, [triggerPopup]);

  useEffect(() => {
    const timer = setTimeout(() => {
      document.addEventListener('mouseleave', handleMouseLeave);
    }, 5000);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseLeave]);

  // Trigger 2: Scroll depth (>=70%) + minimum 30s on page
  useEffect(() => {
    const startTime = Date.now();
    let scrollTriggered = false;

    const handleScroll = () => {
      if (scrollTriggered || hasFired) return;
      const scrollPercent = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight;
      const timeOnPage = (Date.now() - startTime) / 1000;
      if (scrollPercent >= 0.7 && timeOnPage >= 30) {
        scrollTriggered = true;
        triggerPopup();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasFired, triggerPopup]);

  // Trigger 3: Idle timeout (60s no interaction)
  useEffect(() => {
    let idleTimer;
    const resetIdle = () => {
      clearTimeout(idleTimer);
      if (!hasFired) idleTimer = setTimeout(triggerPopup, 60000);
    };

    const events = ['mousemove', 'keydown', 'scroll', 'touchstart'];
    events.forEach(e => window.addEventListener(e, resetIdle, { passive: true }));
    resetIdle();

    return () => {
      clearTimeout(idleTimer);
      events.forEach(e => window.removeEventListener(e, resetIdle));
    };
  }, [hasFired, triggerPopup]);

  // Trigger 4: Back button intercept (mobile/touch only, 5s delay)
  useEffect(() => {
    if (hasFired) return;
    const isTouchDevice = typeof window !== 'undefined' &&
      ('ontouchstart' in window || navigator.maxTouchPoints > 0);
    if (!isTouchDevice) return;

    let pushed = false;
    const handlePopState = () => {
      if (!shouldSuppress() && !hasFired) {
        window.history.pushState(null, '', window.location.href);
        triggerPopup();
      }
    };

    const setupTimer = setTimeout(() => {
      window.history.pushState(null, '', window.location.href);
      pushed = true;
      window.addEventListener('popstate', handlePopState);
    }, 5000);

    return () => {
      clearTimeout(setupTimer);
      if (pushed) window.removeEventListener('popstate', handlePopState);
    };
  }, [hasFired, triggerPopup, shouldSuppress]);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('exit-intent-dismissed', 'true');
    localStorage.setItem('exit-intent-last-visit', Date.now().toString());
  };

  const handleDoNotShowAgain = () => {
    setIsVisible(false);
    localStorage.setItem('exit-intent-do-not-show', 'true');
  };

  const handleSubmitted = (email) => {
    localStorage.setItem('exit-intent-submitted', 'true');
    onSubmit?.(email);
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      data-testid="exit-intent-popup"
      data-variant={variant}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={handleDismiss} />

      <div className="relative w-full max-w-lg bg-white  rounded-3xl shadow-2xl overflow-hidden animate-scaleIn max-h-[92vh] overflow-y-auto">
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-gray-100 :bg-slate-800 transition-colors"
          data-testid="exit-intent-close"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <div className="h-2 bg-gradient-to-r from-[#5B22D6] via-[#E22B8A] to-[#7c3aed]" />

        <div className="p-8">
          {variant === 'roi-calculator' && <RoiCalculatorVariant onSubmitted={handleSubmitted} />}
          {variant === 'pdf-guide' && <PdfGuideVariant onSubmitted={handleSubmitted} />}
          {variant === 'demo-incentive' && <DemoIncentiveVariant onSubmitted={handleSubmitted} />}

          {/* Don't show again — bottom of every variant */}
          <div className="mt-6 pt-4 border-t border-gray-100  text-center">
            <button
              onClick={handleDoNotShowAgain}
              className="text-sm text-gray-500  hover:text-gray-800 :text-white underline underline-offset-2 transition-colors"
              data-testid="exit-intent-do-not-show"
            >
              Don&apos;t show this again
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.9) } to { opacity: 1; transform: scale(1) } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards }
        .animate-scaleIn { animation: scaleIn 0.3s ease-out forwards }
      `}</style>
    </div>
  );
};

ExitIntentPopup.propTypes = {
  onSubmit: PropTypes.func,
};
