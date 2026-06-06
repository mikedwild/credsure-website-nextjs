"use client";
import React from 'react';
import { Cookie } from 'lucide-react';
import { useCookieConsent } from './cookie/useCookieConsent';
import { CookieBanner } from './cookie/CookieBanner';
import { CookiePreferencesModal } from './cookie/CookiePreferencesModal';

export const CookieConsent = () => {
  const {
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
  } = useCookieConsent();

  return (
    <>
      {isVisible && !showCustomize && (
        <CookieBanner
          onAcceptAll={handleAcceptAll}
          onRejectAll={handleRejectAll}
          onCustomize={() => setShowCustomize(true)}
        />
      )}
      {isVisible && showCustomize && (
        <CookiePreferencesModal
          preferences={preferences}
          onToggle={togglePreference}
          onAcceptAll={handleAcceptAll}
          onRejectAll={handleRejectAll}
          onSave={handleSavePreferences}
          onClose={() => setShowCustomize(false)}
        />
      )}
      {/* Persistent floating indicator — only shown after the user has made
          a choice. GDPR/ePrivacy: withdrawing consent must be as easy as giving it. */}
      {hasDecided && !isVisible && (
        <button
          type="button"
          onClick={openPreferences}
          aria-label="Cookie preferences"
          title="Cookie preferences"
          data-testid="cookie-consent-indicator"
          className="fixed bottom-4 left-4 z-[60] flex items-center justify-center w-11 h-11 rounded-full bg-white border border-gray-200 shadow-lg text-[#5B22D6] hover:bg-[#5B22D6] hover:text-white hover:scale-110 transition-all duration-200 group"
        >
          <Cookie className="w-5 h-5" />
          <span className="absolute left-full ml-3 px-2.5 py-1 rounded-md bg-gray-900 text-white text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Cookie preferences
          </span>
        </button>
      )}
    </>
  );
};
