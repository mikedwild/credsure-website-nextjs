"use client";
/**
 * HomepageTrustBand — slim wrapper that renders the system `<TrustBand>`
 * inside a centered container so it slots into the homepage section flow
 * just like every other homepage module.
 */
import React from 'react';
import { TrustBand } from './system';

export const HomepageTrustBand = () => (
  <section className="py-12" style={{ background: '#FFFFFF' }} data-testid="homepage-trust-band">
    <div className="container mx-auto px-6 md:px-12 max-w-5xl">
      <TrustBand testId="homepage-trust-band" />
    </div>
  </section>
);

export default HomepageTrustBand;
