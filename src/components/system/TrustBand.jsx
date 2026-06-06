"use client";
/**
 * TrustBand — single-line strip of compliance badges, used at the bottom
 * of feature & solutions pages to seal the page with credibility.
 *
 *   <TrustBand /> // uses defaults
 *   <TrustBand badges={['ISO 27001', 'eIDAS', 'GDPR']} />
 */
import React from 'react';
import { ShieldCheck } from 'lucide-react';

const DEFAULT_BADGES = ['ISO 27001', 'eIDAS', 'GDPR', 'WCAG 2.1 AA aligned', 'Vanta'];

export const TrustBand = ({
  badges = DEFAULT_BADGES,
  caption = 'Auditors love us. Recipients trust us.',
  testId = 'trust-band',
}) => (
  <div
    className="rounded-2xl px-6 py-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-3"
    style={{ background: '#F8F5FB', border: '1px solid #ECE7F1' }}
    data-testid={testId}
  >
    <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] font-bold text-[#6A6478]">
      <ShieldCheck className="w-4 h-4" style={{ color: '#5B22D6' }} />
      {caption}
    </span>
    <span className="hidden md:inline-block w-px h-4 bg-[#DCD3E4]" aria-hidden="true" />
    {badges.map(b => (
      <span
        key={b}
        className="text-[11px] font-bold tracking-wide text-[#0F0E1A]"
        data-testid={`${testId}-badge-${b.toLowerCase().replace(/\s+/g, '-')}`}
      >
        {b}
      </span>
    ))}
  </div>
);

export default TrustBand;
