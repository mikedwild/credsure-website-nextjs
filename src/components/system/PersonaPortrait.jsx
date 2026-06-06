"use client";
/**
 * PersonaPortrait — pastel-tinted card for solutions-page personas.
 *
 *   <PersonaPortrait
 *     tint="lavender"
 *     role="Registrars"
 *     title="Issue 50,000 diplomas in a week"
 *     workflow="Bulk-issue cohort"
 *     workflowHref="/features/bulk-issuance"
 *   />
 */
import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { LocalizedLink as Link } from '../LocalizedLink';

const TINTS = {
  peach:    '#F0DAD2',
  lavender: '#E2D4F2',
  sage:     '#D8E5DA',
  butter:   '#FCE7B5',
  blush:    '#F8D9E1',
};

export const PersonaPortrait = ({
  tint = 'lavender',
  role,
  title,
  workflow,
  workflowHref,
  testId = 'persona-portrait',
}) => (
  <div
    className="rounded-2xl p-7 h-full flex flex-col"
    style={{ background: TINTS[tint] || TINTS.lavender }}
    data-testid={`${testId}-${role?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`}
  >
    <p className="text-xs uppercase tracking-[0.18em] font-bold text-[#0F0E1A]/70 mb-3">{role}</p>
    <p className="text-xl md:text-2xl font-bold text-[#0F0E1A] leading-tight tracking-tight flex-1">
      {title}
    </p>
    {workflow && workflowHref && (
      <Link
        to={workflowHref}
        className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[#0F0E1A] hover:opacity-70 transition-opacity relative z-20"
      >
        <span className="cs-grad-text font-bold">Popular workflow</span> · {workflow}
        <ArrowUpRight className="w-3.5 h-3.5" />
      </Link>
    )}
  </div>
);

export default PersonaPortrait;
