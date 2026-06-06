"use client";
/**
 * CustomerCard — Beamery's signature mid-page customer-story tile.
 *
 *   <CustomerCard
 *     logo="/static/logos/cambridge.svg"
 *     name="Cambridge Training"
 *     industry="Higher Education"
 *     hq="United Kingdom"
 *     employees="75,000+"
 *     tags={['Bulk issuance', 'Audit logs']}
 *     quote={{ lead: 'We replaced eighteen years of paper diplomas in', bold: 'six weeks', tail: '.' }}
 *     author={{ name: 'Dr. Eleanor Whitfield', role: 'Director of Digital Credentialing' }}
 *     caseStudyHref="/customer-success/cambridge"
 *   />
 */
import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { LocalizedLink as Link } from '../LocalizedLink';

const Meta = ({ label, value }) => (
  <div>
    <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-[#6A6478] mb-1">{label}</p>
    <p className="text-sm font-bold text-[#0F0E1A]">{value}</p>
  </div>
);

export const CustomerCard = ({
  logo,
  logoAlt,
  name,
  industry,
  hq,
  employees,
  tags = [],
  quote,
  author,
  caseStudyHref,
  testId = 'customer-card',
}) => (
  <article
    className="rounded-2xl p-7 md:p-9 h-full flex flex-col"
    style={{ background: '#FFFFFF', border: '1px solid #ECE7F1', boxShadow: '0 12px 30px -16px rgba(15,14,26,0.12)' }}
    data-testid={`${testId}-${name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`}
  >
    {logo && (
      <img
        src={logo}
        alt={logoAlt || `${name} logo`}
        className="h-7 object-contain self-start mb-6 opacity-80"
        loading="lazy"
        decoding="async"
      />
    )}

    <div className="grid grid-cols-3 gap-4 pb-5 mb-5 border-b" style={{ borderColor: '#ECE7F1' }}>
      <Meta label="Industry" value={industry} />
      <Meta label="Headquarters" value={hq} />
      <Meta label="Employees" value={employees} />
    </div>

    {tags.length > 0 && (
      <div className="flex flex-wrap gap-2 mb-6">
        {tags.map(tag => (
          <span key={tag} className="cs-pill" data-testid={`${testId}-tag-${tag}`}>{tag}</span>
        ))}
      </div>
    )}

    {quote && (
      <p className="text-xl md:text-2xl font-bold tracking-tight text-[#0F0E1A] leading-[1.25] flex-1">
        “{quote.lead} <span className="cs-grad-text">{quote.bold}</span>{quote.tail}”
      </p>
    )}

    {(author || caseStudyHref) && (
      <div className="mt-7 pt-5 border-t flex items-center gap-4" style={{ borderColor: '#ECE7F1' }}>
        {author && (
          <>
            <div className="w-10 h-10 rounded-full shrink-0" style={{ background: 'linear-gradient(135deg, #5B22D6, #E22B8A)' }} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[#0F0E1A] truncate">{author.name}</p>
              <p className="text-xs text-[#6A6478] truncate">{author.role}</p>
            </div>
          </>
        )}
        {caseStudyHref && (
          <Link
            to={caseStudyHref}
            className="cs-btn cs-btn-ghost !text-sm !py-2 !px-4 shrink-0"
            data-testid={`${testId}-link`}
          >
            Read case study <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    )}
  </article>
);

export default CustomerCard;
