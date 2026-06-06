"use client";
/**
 * BeameryPlatform — alternative to BentoShowcase.
 *
 * Why we ditched the bento: a 6-tile asymmetric grid forces the
 * visitor's eye to bounce. Beamery + TalentSure both show that a
 * **focused, single-story tabbed module** is more effective for
 * enterprise SaaS: pick one pillar at a time, see a tailored product
 * UI mock + bullet list + CTA, then move on.
 *
 * Structure (matches beamery.com 1:1):
 *   - Section heading with gradient accent
 *   - 4 horizontal tab buttons (Issue / Verify / Govern / Insights)
 *   - Active tab → split panel: left = eyebrow + title + body + bullets
 *     + ghost CTA · right = product UI window with a tab-specific mock
 *
 * Reuses i18n keys that already exist; falls back to sensible defaults
 * so we don't have to touch translation files.
 */
import React, { useState } from 'react';
import { useTranslations as useTranslation } from 'next-intl';
import { Link, useParams } from '@/lib/router-shim';
import { Award, ShieldCheck, FileLock2, BarChart3, ArrowUpRight, Check } from 'lucide-react';
import { PillarTabs, ProductUIWindow } from './system';

// Per-pillar CTA destinations. Each maps to an existing /features/* page
// that already exists in the route table — verified against featureRoutes.js
// before wiring. We deliberately link to the most-specific feature page
// rather than a generic Solutions overview so the visitor reading the
// matching tab lands directly on the matching marketing page.
//
// `href` is appended to `/${lang}` at render time (LanguageLayout pattern).
const PILLARS = [
  {
    key: 'issue',
    icon: Award,
    href: '/features/bulk-issuance',
    fallback: {
      tab: 'Issue',
      eyebrow: 'For Issuers',
      title: 'Bulk-issue 50,000 credentials. In one click.',
      body: 'CSV in. Beautiful, brand-customised credentials out. No engineers required, most teams go live in under a week.',
      bullets: [
        'Drag-and-drop CSV — 50,000 recipients in one upload',
        '80+ templates, full brand-kit customisation',
        'Trigger-based auto-issue from Moodle, Canvas, Workday',
        'One-click LinkedIn share for every recipient',
      ],
      cta: 'Explore CredSure Issue',
    },
  },
  {
    key: 'verify',
    icon: ShieldCheck,
    href: '/features/verification',
    fallback: {
      tab: 'Verify',
      eyebrow: 'For Verifiers',
      title: 'Tamper-proof verification. In 387ms. Even offline.',
      body: 'Border-grade cryptography anchored on-chain. Works on any device, on any signal — even a flip phone.',
      bullets: [
        'p99 verification in 387ms across 14 EU countries',
        'Polygon-anchored, eIDAS-trusted, GDPR-compliant',
        'No app downloads — recipients share a single URL',
        '98.4% verified on first scan',
      ],
      cta: 'Explore CredSure Verify',
    },
  },
  {
    key: 'govern',
    icon: FileLock2,
    // No dedicated Trust Centre page exists yet — `/features/security`
    // (SecurityCompliance) is the closest match: ISO 27001, eIDAS, GDPR,
    // and audit-log content all live there.
    href: '/features/security',
    fallback: {
      tab: 'Govern',
      eyebrow: 'For Compliance',
      title: 'Audit logs every regulator already loves.',
      body: 'ISO 27001 · eIDAS · GDPR — all certified, all included, all ready for your next audit.',
      bullets: [
        'Immutable audit log of every issue, revoke, and share',
        'Role-based access for issuers, registrars, and verifiers',
        'One-click export to your regulator\'s preferred format',
        'WCAG 2.1 AA aligned on every credential',
      ],
      cta: 'Explore Security & Compliance',
    },
  },
  {
    key: 'insights',
    icon: BarChart3,
    href: '/features/analytics',
    fallback: {
      tab: 'Insights',
      eyebrow: 'For Leaders',
      title: 'Stop reporting in spreadsheets. Start telling stories.',
      body: 'Real-time dashboards on issuance, share velocity, verification rates and recipient engagement — by cohort, programme, or year.',
      bullets: [
        'Live share-velocity tracker per cohort',
        'Verification heatmap by region and channel',
        'Cohort comparisons across years and programmes',
        'CSV export for ops, dashboards for executives',
      ],
      cta: 'Explore Insights',
    },
  },
];

// ─── Tab-specific product UI mocks (single source of truth) ──────────
// Issuer mock: replaced the hand-coded 3-column kanban with a designed
// mockup illustrating the actual bulk-issue workflow:
//   3-step header (Upload recipients → Choose template → Issue credentials)
//   Recipients.csv table (left) → Issuing Credentials 50,000 panel
//   (center) → Certificate stack (right).
// Updated 2026-05-19 to the polished v2 mockup with explicit step
// labels and the 'Issue 50,000 Credentials' CTA cursor. 1350×594 WebP,
// 54 KB. Sits inside the ProductUIWindow panel (white bg) so no
// keying/mask needed.
const IssuerMock = () => (
  <div className="h-full w-full flex items-center justify-center p-4">
    <img
      src="/img/heroes/bulk-issue-2026.webp"
      alt="CredSure bulk-issuance workflow in three steps: (1) Upload recipients — import 50,000 rows from Recipients.csv, (2) Choose template — select your credential design, (3) Issue credentials — automatic generation and delivery. Central panel shows the 'Issuing Credentials 50,000' confirmation with a 100% complete progress bar and 50,000 recipients matched. Certificate stack on the right shows generated certificates for Alex Johnson, Priya Sharma, James Wilson, and David Lee for the Data Privacy Fundamentals course."
      width="1350"
      height="594"
      className="w-full h-auto max-h-full object-contain"
      data-testid="issuer-mock-image"
    />
  </div>
);

// Verify mock: replaced the hand-coded gradient card with the production
// phone-verify-2026 mockup (the same WebP used by the homepage Features2026
// "Border-Grade Verification" row). One file, two surfaces — guaranteed
// visual consistency. 900×1200 WebP, ~54 KB.
// Height cap: the other three tabs render landscape images at ~425 px,
// so we cap the phone at 540 px tall — slightly larger to give it
// presence (it's portrait) without dwarfing the bullet list opposite it.
const VerifierMock = () => (
  <div className="h-full w-full flex items-center justify-center p-4">
    <img
      src="/img/heroes/phone-verify-2026.webp"
      alt="Phone showing 'Verification successful — Master Educator — Learnify Academy' credential on CredSure with Polygon-PoS blockchain ID 0xb3a4…e91c, verified in 0.387s, first-scan verified, and a green confirmation that the credential is authentic and tamper-proof"
      width="900"
      height="1200"
      style={{ maxHeight: '540px' }}
      className="w-auto h-auto object-contain"
      data-testid="verify-mock-image"
    />
  </div>
);

// Govern mock: replaced the hand-coded audit-log rows with a designed
// dashboard mockup (CS badge avoids the brand-text-typo risk that
// ChatGPT image-gen has with our name). Shows tamper-proof Audit Log
// header + 5 KPI tiles + 5 events table + ISO27001/eIDAS/GDPR/WCAG
// footer badges. 1100×733 WebP, 58 KB. Source: ChatGPT, 19 May 2026.
const GovernMock = () => (
  <div className="h-full w-full flex items-center justify-center p-4">
    <img
      src="/img/heroes/audit-log-2026.webp"
      alt="CredSure Audit Log dashboard: 24,318 total events, 23,842 successful (98%), 476 failed, 156 active actors, 1,842 events in the last 7 days. Five tamper-proof events visible: bulk issue of 240 diplomas, template approval, Polygon blockchain anchoring, eIDAS audit-log export, and a single credential revocation. Footer shows ISO 27001 Certified, eIDAS Compliant, GDPR Ready, WCAG 2.1 AA Aligned"
      width="1100"
      height="733"
      className="w-full h-auto max-h-full object-contain"
      data-testid="govern-mock-image"
    />
  </div>
);

// Insights mock: replaced the hand-coded bar-chart + 3-stat grid with a
// designed dashboard mockup matching the Audit Log mockup's visual style
// (CS-badge logo avoids brand-text typo risk). Shows: Insights header
// with date range + export, share-velocity bar chart (12 weeks, +24% MoM),
// 3 KPI tiles (7× share rate, 98.4% first-scan verified, 24,192 Q4
// issued), top-performing credentials list, and share-channel donut
// breakdown (LinkedIn 45%, Email 29%, WhatsApp 12%, Other 14%).
// 1100×733 WebP, 47 KB. Source: ChatGPT, 19 May 2026.
const InsightsMock = () => (
  <div className="h-full w-full flex items-center justify-center p-4">
    <img
      src="/img/heroes/insights-2026.webp"
      alt="CredSure Insights dashboard: 12-week share-velocity bar chart trending up to 24,200 weekly shares (+24% month-on-month), KPI tiles showing 7× share rate vs legacy, 98.4% first-scan verified, and 24,192 credentials issued in Q4 (+18.6% vs Q3). Top performing credentials: Master Educator 8,742, Advanced Data Science 6,521, Leadership Essentials 5,183, Cybersecurity Fundamentals 3,746. Share channel breakdown: LinkedIn 45.2%, Email 28.6%, WhatsApp 12.3%, Other 13.9%"
      width="1100"
      height="733"
      className="w-full h-auto max-h-full object-contain"
      data-testid="insights-mock-image"
    />
  </div>
);

const MOCKS = { issue: IssuerMock, verify: VerifierMock, govern: GovernMock, insights: InsightsMock };

export const BeameryPlatform = () => {
  const t = useTranslation();
  // Current language for prefixing internal links — matches LanguageLayout's
  // /:lang/* URL shape. Falls back to 'en' on the off chance this component
  // ever renders outside a /:lang route (it shouldn't).
  const { locale: lang = 'en' } = useParams();
  const [active, setActive] = useState(0);
  const pillar = PILLARS[active];
  const data = {
    tab: t(`platformPillars.${pillar.key}.tab`, pillar.fallback.tab),
    eyebrow: t(`platformPillars.${pillar.key}.eyebrow`, pillar.fallback.eyebrow),
    title: t(`platformPillars.${pillar.key}.title`, pillar.fallback.title),
    body: t(`platformPillars.${pillar.key}.body`, pillar.fallback.body),
    bullets: t(`platformPillars.${pillar.key}.bullets`, { returnObjects: true, defaultValue: pillar.fallback.bullets }),
    cta: t(`platformPillars.${pillar.key}.cta`, pillar.fallback.cta),
  };
  const Mock = MOCKS[pillar.key];

  return (
    <section className="py-24 md:py-32 relative overflow-hidden" style={{ background: '#FAFAFC' }}>
      {/* Subtle ambient orb */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(187,158,255,0.20) 0%, transparent 70%)' }} aria-hidden="true" />

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        {/* Section heading */}
        <div className="max-w-3xl mb-12">
          <p className="text-xs uppercase tracking-[0.18em] font-bold mb-3 cs-grad-text" data-testid="platform-section-eyebrow">
            {t('platformPillars.sectionEyebrow', 'The Platform')}
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight text-[#0F0E1A]">
            {t('platformPillars.sectionTitle', 'One platform. Every credential workflow.')}{' '}
            <span className="cs-grad-text">{t('platformPillars.sectionTitleAccent', 'No glue code.')}</span>
          </h2>
          <p className="mt-5 text-lg text-[#2E2A3D] max-w-2xl">
            {t('platformPillars.sectionSubtitle', 'From bulk issuance to offline verification to regulator-ready audit logs — every team and every workflow, in one place.')}
          </p>
        </div>

        {/* Tab strip */}
        <PillarTabs
          tabs={PILLARS.map(p => ({
            key: p.key,
            label: t(`platformPillars.${p.key}.tab`, p.fallback.tab),
            icon: p.icon,
          }))}
          activeKey={pillar.key}
          onChange={(k) => setActive(PILLARS.findIndex(p => p.key === k))}
          testIdPrefix="platform-tab"
          className="mb-10"
        />

        {/* Active panel — split layout */}
        <div className="grid lg:grid-cols-12 gap-12 items-center" data-testid={`platform-panel-${pillar.key}`}>
          {/* Left — text */}
          <div className="lg:col-span-5">
            <p className="text-xs uppercase tracking-[0.18em] font-bold text-[#6A6478] mb-3">{data.eyebrow}</p>
            <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-[1.1] tracking-tight text-[#0F0E1A]">
              {data.title}
            </h3>
            <p className="mt-5 text-base md:text-lg text-[#2E2A3D] leading-relaxed">{data.body}</p>
            <ul className="mt-7 space-y-2.5">
              {(Array.isArray(data.bullets) ? data.bullets : pillar.fallback.bullets).map((b) => (
                <li key={b} className="flex items-start gap-3 text-base text-[#0F0E1A]">
                  <Check className="w-4 h-4 mt-1 shrink-0" style={{ color: '#5B22D6' }} strokeWidth={3} />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <Link
              href={`/${lang}${pillar.href}`}
              className="mt-8 cs-btn cs-btn-ghost inline-flex"
              data-testid={`platform-cta-${pillar.key}`}
            >
              {data.cta} <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Right — product UI window */}
          <div className="lg:col-span-7">
            <ProductUIWindow url={`app.credsure.io · ${data.tab}`}>
              {Mock && <Mock />}
            </ProductUIWindow>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BeameryPlatform;
