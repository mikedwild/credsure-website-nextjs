"use client";
/**
 * StructuredData — schema.org JSON-LD only, no meta tag overrides.
 *
 * Use this when a sub-component (e.g. SolutionFAQ, FAQ) only needs to
 * inject FAQPage / SpeakableSpecification etc. into the document head,
 * WITHOUT clobbering the page-level <title> / <meta description> set by
 * the page-level <SEO> component.
 */
import React from 'react';

export const StructuredData = ({ data }) => {
  if (!data) return null;
  // Plain <script> (not react-helmet, which is a no-op without a provider) so
  // the JSON-LD lands in the SSR HTML — the FAQ/Solution views that render this
  // are server-rendered.
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
};

export default StructuredData;
