/**
 * featureMedia.js — single source-of-truth for hero imagery + caption used
 * by FeaturePageTemplate and UseCasePageTemplate. Adding/changing an image
 * for any feature/use-case is now a one-line edit here.
 *
 * Each entry returns: { hero, alt, urlBar?, signature? }
 *   - hero        → the image URL to render in the right-side hero pane.
 *   - alt         → a11y alt text.
 *   - urlBar      → optional Mac-window URL caption (e.g. "app.credsure.io · Verify").
 *   - signature   → optional pull-quote caption shown beneath the image.
 */

// ── Asset pool ─────────────────────────────────────────────────────────
// Hero PNGs were re-exported with proper alpha channels so they float on
// the page gradient cleanly (no rectangular white background).
// 2026-05-19 perf pass: 11 of 13 PNGs converted to WebP (saved 1.15 MB
// across the asset pool). 2 PNGs kept because their detailed dashboard
// content + alpha mask made WebP actually larger (share-orbit, verify-
// callouts). Cap on resize: 1100 px wide for dashboard mocks (matches
// the in-panel display at 2x retina); phones kept at native res.
// All paths below reflect the post-conversion canonical extension.
const IMG = {
  verifyCallouts:    '/img/heroes/verify-callouts.png',   // PNG retained — WebP was larger
  dashboardAnalytics:'/img/heroes/dashboard-analytics.webp',
  dashboardCollege:  '/img/heroes/dashboard-college.webp',
  shareOrbit:        '/img/heroes/share-orbit.png',       // PNG retained — WebP was larger
  templatesGridA:    '/img/heroes/templates-grid-a.webp',
  phoneHand:         '/img/heroes/phone-hand-new.webp',
  // 2026 mockup — phone showing "Verification successful · Master Educator
  // · Learnify Academy" card + ID/blockchain/first-scan rows. Used by the
  // homepage Features2026 "Border-grade verification" row + the
  // /features/verification + /use-cases/professional-licenses pages.
  // 900×1200 WebP, 54 KB. Source: ChatGPT-generated mockup, 19 May 2026.
  phoneVerify2026:   '/img/heroes/phone-verify-2026.webp',
  phoneIso:          '/img/heroes/phone-iso.webp',
  phoneFlat:         '/img/heroes/phone-flat.webp',
  certificateGrid:   '/img/heroes/certificate-grid.webp',
  // Composed marketing tiles — also transparent now.
  composedAnalytics: '/img/heroes/composed-analytics.webp',
  composedBadges:    '/img/heroes/composed-badges.webp',
  composedBulk:      '/img/heroes/composed-bulk.webp',
};

// ── Composed marketing tiles for non-FeaturePageTemplate pages ─────────
// Pages like /digital-badges have their own custom hero layout; export the
// composed image directly so they can render it without the chrome wrapper.
export const composedTiles = {
  digitalBadges: {
    src: IMG.composedBadges,
    alt: 'CredSure Digital Badges showcase with AI Fundamentals, Data Analyst Professional, Cybersecurity Essentials, Leadership Excellence, Cloud Architect and Product Design Specialist badge variants and a "My Badges" dashboard for Jane Smith with 12 total badges, 95% profile strength and View Public Profile button',
  },
  bulkIssuance: {
    src: IMG.composedBulk,
    alt: 'CredSure bulk issuance dashboard with 50,000 certificates ready to be issued, 3-step Upload → Customize → Review & Confirm progress and CERTIFICATE OF COMPLETION previews for Alicia Johnson, Michael Smith and Priya Sharma',
  },
  analytics: {
    src: IMG.composedAnalytics,
    alt: 'CredSure Powerful Analytics dashboard for BMS College of Engineering with Total Overview KPIs (Credentials Issued 1,248, Viewed 4,732, Engaged 982, Shared 612, Verified 876), Credential Activity Over Time chart with Certificate/Badge/Total lines, per-organisation statistics table and Credential Verified · Blockchain Verified trust badge',
  },
};

export const featureMedia = {
  // Composed marketing tile: image already has its own headline + cards
  // baked in (BC bulk-issuance flow with 50,000 certificates and three
  // CERTIFICATE OF COMPLETION previews). `composed: true` skips the
  // ProductUIWindow wrap so we don't double up the visual treatment.
  bulkIssuance:         { hero: IMG.composedBulk,        composed: true,                            alt: 'CredSure bulk issuance dashboard with 50,000 certificates ready to be issued, 3-step Upload → Customize → Review & Confirm progress and CERTIFICATE OF COMPLETION previews for Alicia Johnson, Michael Smith and Priya Sharma' },
  blockchain:           { hero: IMG.verifyCallouts,      urlBar: 'verify.credsure.io',             alt: 'Verifiable credential card with QR scan, blockchain hash and issuer public key' },
  instantVerification:  { hero: IMG.phoneVerify2026,    urlBar: '387ms · first-scan verified',    alt: 'Phone showing "Verification successful — Master Educator" credential on CredSure with Polygon-PoS blockchain ID 0xb3a4…e91c, verified in 0.387s, first-scan verified, and a green confirmation that the credential is authentic and tamper-proof' },
  sharing:              { hero: IMG.shareOrbit,          urlBar: 'Share to LinkedIn · Email · X',  alt: 'CredSure share panel with LinkedIn, email, Twitter, Facebook and digital wallet' },
  credentialManagement: { hero: IMG.certificateGrid,    composed: true,                            alt: 'Grid of eight verifiable digital certificate designs — completion, achievement, blockchain-verified — issued via CredSure for Data Analytics, Web Development, PMP, Strategic Leadership, UI/UX, Data Science, Digital Marketing and Financial Management programmes' },
  analytics:            { hero: IMG.composedAnalytics,   composed: true,                            alt: 'CredSure Powerful Analytics dashboard for BMS College of Engineering with Total Overview KPIs (Credentials Issued 1,248, Viewed 4,732, Engaged 982, Shared 612, Verified 876), Credential Activity Over Time chart with Certificate/Badge/Total lines, per-organisation statistics table and Credential Verified · Blockchain Verified trust badge' },
  apiIntegration:       { hero: IMG.dashboardCollege,    urlBar: 'app.credsure.io · API',          alt: 'CredSure dashboard backed by API integration into Workday, Moodle and Canvas' },
  autoIssue:            { hero: IMG.dashboardCollege,    urlBar: 'app.credsure.io · Auto-issue',   alt: 'Automated trigger flow inside the CredSure issuer dashboard' },
  security:             { hero: IMG.verifyCallouts,      urlBar: 'trust.credsure.io',              alt: 'Verifiable credential anchored on chain with issuer public key callouts' },
  templateDesigner:     { hero: IMG.templatesGridA,      urlBar: '80+ templates',                  alt: 'Library of branded certificate templates including diplomas, badges and licences' },
  customDomains:        { hero: IMG.phoneFlat,           urlBar: 'credentials.your-school.edu',    alt: 'Custom-domain credential rendered on a recipient phone' },
  whiteLabel:           { hero: IMG.dashboardAnalytics,  urlBar: 'partner.credsure.io',            alt: 'White-label CredSure dashboard ready to power partner credential portfolios' },
  recipientWall:        { hero: IMG.phoneIso,             urlBar: 'wall.credsure.io · Jane Smith',  alt: 'Recipient credential wall on phone showing every badge a holder has earned' },
};

// ── Use-case / Solution page → image map ───────────────────────────────
export const useCaseMedia = {
  saveTime:              { hero: IMG.dashboardAnalytics,  urlBar: 'app.credsure.io · Operations', alt: 'Operations dashboard demonstrating time saved with automated credential issuance' },
  scaleProgram:          { hero: IMG.dashboardCollege,    urlBar: 'app.credsure.io · Programmes', alt: 'Per-organisation programme statistics on the CredSure dashboard' },
  increaseEngagement:    { hero: IMG.shareOrbit,          urlBar: 'Share · Engagement',           alt: 'Share-credential illustration showing recipients posting to social channels' },
  professionalLicenses:  { hero: IMG.phoneHand,           urlBar: 'verify.credsure.io',           alt: 'Professional licence verified instantly on a recipient mobile phone' },
  courseCompletion:      { hero: IMG.templatesGridB,      urlBar: 'Templates · Completion',       alt: 'Library of course-completion certificate designs available in CredSure' },
  memberCredentials:     { hero: IMG.phoneIso,            urlBar: 'My credentials',               alt: 'Member portal credential rendered on phone with verifiable badge' },
};

export default featureMedia;
