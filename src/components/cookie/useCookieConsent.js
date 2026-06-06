import { useState, useEffect, useCallback } from 'react';

const DEFAULT_PREFS = { necessary: true, analytics: false, marketing: false, personalization: false };
const ALL_PREFS = { necessary: true, analytics: true, marketing: true, personalization: true };

const updateGtagConsent = (prefs) => {
  if (window.gtag) {
    window.gtag('consent', 'update', {
      'analytics_storage': prefs.analytics ? 'granted' : 'denied',
      'ad_storage': prefs.marketing ? 'granted' : 'denied',
      'personalization_storage': prefs.personalization ? 'granted' : 'denied',
    });
  }
};

/**
 * PostHog session recording is gated behind analytics consent.
 * It loads ~150KB of rrweb code, so we keep it disabled until the user
 * explicitly opts in — improves PageSpeed AND respects ePrivacy / GDPR.
 */
const updatePostHogConsent = (prefs) => {
  if (typeof window === 'undefined' || !window.posthog) return;
  try {
    if (prefs.analytics) {
      // Ensure the user is opted in to capture
      if (typeof window.posthog.opt_in_capturing === 'function') {
        window.posthog.opt_in_capturing();
      }
      // Start session replay (was disabled at init)
      if (typeof window.posthog.startSessionRecording === 'function') {
        window.posthog.startSessionRecording();
      }
    } else {
      if (typeof window.posthog.stopSessionRecording === 'function') {
        window.posthog.stopSessionRecording();
      }
      if (typeof window.posthog.opt_out_capturing === 'function') {
        window.posthog.opt_out_capturing();
      }
    }
  } catch (e) { /* PostHog not yet initialised — will be picked up on next visit */ }
};

export const useCookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [preferences, setPreferences] = useState(DEFAULT_PREFS);
  const [hasDecided, setHasDecided] = useState(false);

  useEffect(() => {
    // Don't show the banner during react-snap prerendering — we don't want
    // the snapshot to bake in a cookie modal that would then race with the
    // real banner on hydration. The runtime UA check is sufficient because
    // react-snap sets `navigator.userAgent === 'ReactSnap'` while crawling.
    if (typeof navigator !== 'undefined' && navigator.userAgent === 'ReactSnap') {
      return;
    }
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setTimeout(() => setIsVisible(true), 1000);
      return;
    }
    setHasDecided(true);
    // Returning visitor — restore saved analytics preference and re-arm PostHog
    // session recording if previously accepted. PostHog init is deferred via
    // requestIdleCallback in index.html, so we wait briefly before calling.
    try {
      const saved = JSON.parse(localStorage.getItem('cookiePreferences') || '{}');
      const restored = { ...DEFAULT_PREFS, ...saved };
      setPreferences(restored);
      updateGtagConsent(restored);
      // Defer to give the deferred posthog.init() time to run
      setTimeout(() => updatePostHogConsent(restored), 4000);
    } catch { /* corrupted prefs — leave defaults */ }
  }, []);

  const saveAndClose = useCallback((prefs, status) => {
    localStorage.setItem('cookieConsent', status);
    localStorage.setItem('cookiePreferences', JSON.stringify(prefs));
    setIsVisible(false);
    setShowCustomize(false);
    setHasDecided(true);
    updateGtagConsent(prefs);
    updatePostHogConsent(prefs);
  }, []);

  const handleAcceptAll = useCallback(() => saveAndClose(ALL_PREFS, 'accepted'), [saveAndClose]);
  const handleRejectAll = useCallback(() => saveAndClose(DEFAULT_PREFS, 'rejected'), [saveAndClose]);
  const handleSavePreferences = useCallback(() => saveAndClose(preferences, 'customized'), [saveAndClose, preferences]);

  const togglePreference = useCallback((key) => {
    if (key === 'necessary') return;
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  /** Re-open the preferences modal — used by the floating ConsentIndicator. */
  const openPreferences = useCallback(() => {
    setIsVisible(true);
    setShowCustomize(true);
  }, []);

  return {
    isVisible,
    showCustomize,
    preferences,
    hasDecided,
    setShowCustomize,
    handleAcceptAll,
    handleRejectAll,
    handleSavePreferences,
    togglePreference,
    openPreferences,
  };
};
