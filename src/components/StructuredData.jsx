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
import { Helmet } from 'react-helmet-async';

export const StructuredData = ({ data }) => {
  if (!data) return null;
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    </Helmet>
  );
};

export default StructuredData;
