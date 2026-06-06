"use client";
/**
 * StatCallout — Beamery-style oversized gradient stat with trailing arrow.
 *
 *   <StatCallout
 *     stat="50,000"
 *     label="Diplomas migrated in 6 days · zero engineers"
 *     href="/customer-success/cambridge"
 *   />
 */
import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { LocalizedLink as Link } from '../LocalizedLink';

export const StatCallout = ({ stat, label, href, testId = 'stat-callout' }) => {
  const Inner = (
    <>
      <span className="cs-grad-text text-5xl md:text-7xl font-bold leading-none tracking-tight">
        {stat}
      </span>
      <span className="block text-base md:text-lg text-[#2E2A3D] mt-3 max-w-md leading-snug">
        {label}
        {href && (
          <ArrowUpRight
            className="inline-block ml-1.5 w-4 h-4 align-baseline"
            style={{ color: '#5B22D6' }}
          />
        )}
      </span>
    </>
  );

  return href ? (
    <Link
      to={href}
      className="block group hover:opacity-90 transition-opacity"
      data-testid={testId}
    >
      {Inner}
    </Link>
  ) : (
    <div data-testid={testId}>{Inner}</div>
  );
};

export default StatCallout;
