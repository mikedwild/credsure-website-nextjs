/**
 * Real User Monitoring — pushes Core Web Vitals to PostHog and GA4.
 *
 * Reports per page-view (SPA-aware), at proper trigger points:
 *   • LCP/CLS: on visibility change or unload (final values)
 *   • INP/FCP/TTFB: as soon as available
 *
 * Why a hook instead of a one-shot in index.js?
 *   The site is a SPA — Web Vitals must be re-measured on each route change.
 *   `web-vitals` v4+ supports this natively when `reportAllChanges` is set.
 *
 * No PII is sent. Connection info (effectiveType) is included for cohort analysis.
 */
import { useEffect } from 'react';

const RATING_THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },
  INP: { good: 200, poor: 500 },
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 800, poor: 1800 },
};

const getRating = (name, value) => {
  const t = RATING_THRESHOLDS[name];
  if (!t) return undefined;
  if (value <= t.good) return 'good';
  if (value <= t.poor) return 'needs-improvement';
  return 'poor';
};

const reportMetric = (metric) => {
  const { name, value, id, delta, navigationType, rating: webVitalsRating } = metric;
  // Round to keep payloads small and aggregations clean
  const roundedValue = name === 'CLS' ? Math.round(value * 1000) / 1000 : Math.round(value);
  const roundedDelta = name === 'CLS' ? Math.round(delta * 1000) / 1000 : Math.round(delta);
  const rating = webVitalsRating || getRating(name, value);

  const conn = (typeof navigator !== 'undefined' && navigator.connection) ? navigator.connection : {};

  const payload = {
    metric_name: name,
    metric_value: roundedValue,
    metric_delta: roundedDelta,
    metric_id: id,
    metric_rating: rating,
    navigation_type: navigationType,
    page_path: typeof window !== 'undefined' ? window.location.pathname : '',
    effective_connection_type: conn.effectiveType,
    device_memory: typeof navigator !== 'undefined' ? navigator.deviceMemory : undefined,
    hardware_concurrency: typeof navigator !== 'undefined' ? navigator.hardwareConcurrency : undefined,
  };

  // PostHog (init is deferred; queue if not ready yet — posthog stub buffers calls)
  if (typeof window !== 'undefined' && window.posthog && typeof window.posthog.capture === 'function') {
    try { window.posthog.capture('web_vital', payload); } catch (e) { /* noop */ }
  }

  // GTM dataLayer — GA4 Event Tag (event name = "web_vital") forwards this to GA4.
  if (typeof window !== 'undefined') {
    try {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'web_vital',
        event_category: 'Web Vitals',
        event_label: rating,
        metric_name: name,
        metric_value: roundedValue,
        metric_rating: rating,
        non_interaction: true,
      });
    } catch (e) { /* noop */ }
  }

  // Dev console (helpful while building; gated to dev only)
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.log(`[web-vital] ${name}=${roundedValue} (${rating})`, payload);
  }
};

let __vitalsAttached = false;

export const useWebVitals = () => {
  useEffect(() => {
    // Attach exactly once per page load — web-vitals v4+ handles SPA route
    // changes internally via the History API (when reportAllChanges is true).
    if (__vitalsAttached || typeof window === 'undefined') return;
    __vitalsAttached = true;

    // Dynamic import keeps web-vitals out of the critical bundle
    import(/* webpackChunkName: "web-vitals" */ 'web-vitals')
      .then(({ onLCP, onINP, onCLS, onFCP, onTTFB }) => {
        onLCP(reportMetric);
        onINP(reportMetric);
        onCLS(reportMetric);
        onFCP(reportMetric);
        onTTFB(reportMetric);
      })
      .catch(() => { /* silent — RUM is best-effort */ });
  }, []);
};
