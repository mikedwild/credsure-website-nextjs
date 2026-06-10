import React, { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext({ symbol: '€', code: 'EUR' });

const COUNTRY_CURRENCY_MAP = {
  US: { symbol: '$', code: 'USD' },
  CA: { symbol: '$', code: 'CAD' },
  AU: { symbol: '$', code: 'AUD' },
  NZ: { symbol: '$', code: 'NZD' },
  GB: { symbol: '£', code: 'GBP' },
  // All EU countries default to €
};

const EU_COUNTRIES = new Set([
  'AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IE',
  'IT','LV','LT','LU','MT','NL','PL','PT','RO','SK','SI','ES','SE','CH'
]);

const STORAGE_KEY = 'user-currency';
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState({ symbol: '€', code: 'EUR' });

  useEffect(() => {
    // 1. Check long-lived cache (7 days) — avoids hitting ipapi for repeat visitors.
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.ts && Date.now() - parsed.ts < CACHE_TTL_MS) {
          setCurrency(parsed.currency);
          return;
        }
      }
    } catch { /* corrupt cache, fall through */ }

    // 2. Defer detection past TTI to avoid blocking + reduce visible 429 console noise
    //    on Lighthouse runs. Wrap in idle-callback so it never delays critical render.
    const detect = () => {
      // Use Cloudflare's /cdn-cgi/trace endpoint when site is Cloudflare-proxied
      // (credsure.io is). It's CORS-friendly, free, no rate limit, no API key.
      // Falls back to ipapi.co as a backup.
      // Returns text in the form: "loc=DE\nip=1.2.3.4\n..."
      const ipapiFallback = () =>
        fetch('https://ipapi.co/json/')
          .then(r => (r.ok ? r.json() : null))
          .then(d => (d && d.country_code) ? d.country_code : null);

      fetch('/cdn-cgi/trace')
        .then(r => (r.ok ? r.text() : null))
        .then(text => {
          // Only Cloudflare-proxied (orange-cloud) domains return a real trace
          // with `loc=`. On DNS-only / non-CF hosts the path 200s with app HTML
          // (no loc), so fall back to ipapi whenever loc is absent — this keeps
          // currency detection working regardless of the Cloudflare proxy mode.
          const match = text && text.match(/loc=([A-Z]{2})/);
          return match ? match[1] : ipapiFallback();
        })
        .then(cc => {
          if (!cc) return;
          let curr;
          if (COUNTRY_CURRENCY_MAP[cc]) {
            curr = COUNTRY_CURRENCY_MAP[cc];
          } else if (EU_COUNTRIES.has(cc)) {
            curr = { symbol: '€', code: 'EUR' };
          } else {
            curr = { symbol: '$', code: 'USD' };
          }
          setCurrency(curr);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ currency: curr, ts: Date.now() }));
          } catch { /* quota — ignore */ }
        })
        .catch(() => { /* network/CORS — silently keep default */ });
    };

    if ('requestIdleCallback' in window) {
      const handle = window.requestIdleCallback(detect, { timeout: 5000 });
      return () => window.cancelIdleCallback?.(handle);
    }
    const timer = setTimeout(detect, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <CurrencyContext.Provider value={currency}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
