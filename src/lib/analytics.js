/**
 * Thin GTM dataLayer wrapper.
 *
 * After migrating GA4 from direct gtag.js into Google Tag Manager, ALL custom
 * events flow through `window.dataLayer.push({ event, ... })`. Inside GTM you
 * map each `event` name to a GA4 Event Tag (or any other vendor's tag).
 *
 * Why a helper instead of calling dataLayer.push everywhere?
 *   • SSR safety — guards against `window` being undefined.
 *   • One place to add debug logging or schema validation later.
 *   • Forces a consistent payload shape, which keeps GTM Variables clean.
 *
 * Naming convention (lower_snake_case, matches GA4 reserved/recommended events
 * where possible — see ROADMAP.md / docs/gtm-migration-guide.md for the full
 * list and required Tag setup).
 */

export const trackEvent = (event, params = {}) => {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...params });
};

// Conversion event helpers — keep names in sync with the GTM workspace.
export const trackLeadSubmit = (params) => trackEvent('lead_submit', params);
export const trackDemoRequest = (params) => trackEvent('demo_request', params);
export const trackRoiUnlock = (params) => trackEvent('roi_unlock', params);
export const trackRoiCalculate = (params) => trackEvent('roi_calculate', params);
export const trackExitIntentLead = (params) => trackEvent('exit_intent_lead', params);
export const trackNewsletterSignup = (params) => trackEvent('newsletter_signup', params);
export const trackGatedUnlock = (params) => trackEvent('gated_content_unlock', params);
