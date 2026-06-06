"use client";
import { useEffect } from 'react';
import { useLocation } from '@/lib/router-shim';

export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    // SPA virtual page view → GTM dataLayer. Inside GTM, a Custom Event trigger
    // (`spa_page_view`) fires the GA4 Event Tag (event_name = "page_view") plus
    // any other vendor tags (LinkedIn Insight, Meta Pixel, etc.).
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'spa_page_view',
      page_path: pathname,
      page_title: document.title,
      page_location: window.location.href,
    });
  }, [pathname]);

  return null;
}
