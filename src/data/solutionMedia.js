/**
 * solutionMedia.js — single source-of-truth for solution-page hero
 * imagery + the anchor customer rendered on each vertical via the system
 * `<CustomerCard>` component.
 *
 * IMPORTANT: Only three real customers exist with full case-study pages —
 * ByteEDGE, Tsaaro Academy and Clini INDIA. Per the customer's directive
 * we anchor every solution page on one of these three. Where a real
 * attributed quote exists in the case-study locale (today: only ByteEDGE
 * with Priya Menon, Head of Product) we render quote+author. For the
 * other two we render a clean meta-only card (industry / HQ / tags +
 * "Read case study" link) — never an invented attribution.
 */

// Local optimised WebP hero assets (transparent backgrounds where useful,
// ≤1100px wide for dashboards / native for phones).
// 2026-05-19: PNG→WebP conversion pass — see featureMedia.js for the full
// audit (saved 1.15 MB across the asset pool). Two PNGs (share-orbit,
// verify-callouts) kept as .png because their detailed UI + alpha mask
// made WebP actually larger; the rest are WebP at q=82.
const IMG = {
  dashboardCollege:   '/img/heroes/dashboard-college.webp',
  phoneHand:          '/img/heroes/phone-hand-new.webp',
  phoneFlat:          '/img/heroes/phone-flat.webp',
  phoneIso:           '/img/heroes/phone-iso.webp',
  shareOrbit:         '/img/heroes/share-orbit.png',         // PNG retained — WebP was larger
  templatesGridA:     '/img/heroes/templates-grid-a.webp',
  dashboardAnalytics: '/img/heroes/dashboard-analytics.webp',
};

// Real customer payloads (single source-of-truth so we never re-invent).
// Quote + author present only where the original case study attributes one.
const CUSTOMERS = {
  byteedge: {
    name: 'ByteEDGE',
    industry: 'Microlearning · EdTech',
    hq: 'Bengaluru, India',
    employees: 'Enterprise',
    tags: ['LMS integration', 'API', 'Analytics'],
    quote: {
      lead: 'CredSure gave us blockchain-grade trust without engineering overhead. We were issuing verifiable credentials',
      bold: 'within a single sprint',
      tail: '.',
    },
    author: { name: 'Priya Menon', role: 'Head of Product, ByteEDGE' },
    caseStudyHref: '/customer-success/byteedge',
  },
  tsaaro: {
    name: 'Tsaaro Academy',
    industry: 'Data-privacy training',
    hq: 'Bengaluru, India',
    employees: 'Enterprise',
    tags: ['100% automated issuance', '80% admin reduction', 'GDPR'],
    // No attributed quote in the source case study — render meta-only.
    caseStudyHref: '/customer-success/tsaaro',
  },
  cliniIndia: {
    name: 'Clini INDIA',
    industry: 'Healthcare training network',
    hq: 'India',
    employees: 'Enterprise',
    tags: ['CME', 'Verification', 'Regulatory compliance'],
    // No attributed quote in the source case study — render meta-only.
    caseStudyHref: '/customer-success/clini-india',
  },
};

// Per-vertical: hero, anchor customer (real), persona tints, popular feature
// links. Tints rotate through the system pastel palette.
//
// Mapping (per customer directive):
//   Higher Ed / Corporate Training → ByteEDGE (microlearning fits both)
//   Healthcare / Manufacturing     → Clini INDIA (real healthcare network)
//   Cert Bodies / Associations     → Tsaaro Academy (privacy training body)
export const solutionMedia = {
  higherEducation: {
    hero: { src: IMG.dashboardCollege, urlBar: 'app.credsure.io · Higher Ed', alt: 'University credentialing dashboard with cohort metrics and credential activity' },
    customer: CUSTOMERS.byteedge,
    personas: [
      { tint: 'lavender', role: 'Registrars',       title: 'Issue 50,000 diplomas in a week — without a single engineer.', workflow: 'Bulk-issue cohort',     workflowHref: '/features/bulk-issuance' },
      { tint: 'peach',    role: 'Deans',            title: 'Make programme outcomes visible — to ranking bodies, recruiters and applicants.', workflow: 'Recipient wall',        workflowHref: '/features/recipient-wall' },
      { tint: 'sage',     role: 'Career Services',  title: 'Turn every alumnus into a recruiter for your next cohort.',     workflow: 'LinkedIn share rail',   workflowHref: '/features/sharing' },
    ],
  },
  healthcare: {
    hero: { src: IMG.phoneHand, urlBar: 'verify.credsure.io · 387ms', alt: 'Healthcare credential verified instantly on a clinician phone' },
    customer: CUSTOMERS.cliniIndia,
    personas: [
      { tint: 'blush',    role: 'Compliance Officers', title: 'Audit prep that takes minutes, not weeks.',                                                workflow: 'Audit log export',   workflowHref: '/features/security' },
      { tint: 'lavender', role: 'CNOs',                title: 'Verify every clinician at every shift change in 387ms — even on a flip phone.',           workflow: 'Mobile verification', workflowHref: '/features/verification' },
      { tint: 'sage',     role: 'L&D Directors',       title: 'Track CME credits in one dashboard — across every facility.',                              workflow: 'Auto-issue triggers', workflowHref: '/features/auto-issue' },
    ],
  },
  certificationBodies: {
    hero: { src: IMG.templatesGridA, urlBar: 'app.credsure.io · Cert', alt: 'Library of certification templates ready to issue at scale' },
    customer: CUSTOMERS.tsaaro,
    personas: [
      { tint: 'lavender', role: 'Programme Directors', title: 'From your exam platform to a verifiable credential — automatically.', workflow: 'Auto-issue triggers',  workflowHref: '/features/auto-issue' },
      { tint: 'butter',   role: 'Exam Authors',         title: 'Map every exam outcome to a credential, in one drag-and-drop builder.', workflow: 'Template designer',  workflowHref: '/features/template-designer' },
      { tint: 'sage',     role: 'Compliance Leads',     title: 'Anchor every issuance on Polygon — auditable in 387ms, anywhere on Earth.', workflow: 'Blockchain anchor', workflowHref: '/features/blockchain' },
    ],
  },
  associations: {
    hero: { src: IMG.shareOrbit, urlBar: 'My credentials · Member portal', alt: 'Association member sharing credentials to LinkedIn, email and X' },
    customer: CUSTOMERS.tsaaro,
    personas: [
      { tint: 'peach',    role: 'Membership Directors', title: 'Renew membership. Reward expertise. Both with one credential platform.', workflow: 'Recipient wall',     workflowHref: '/features/recipient-wall' },
      { tint: 'blush',    role: 'Marketing Leads',       title: 'Every member share = an organic impression for your association brand.', workflow: 'LinkedIn share rail',  workflowHref: '/features/sharing' },
      { tint: 'lavender', role: 'Education Heads',       title: 'Track CEU credits and attendance with zero manual reconciliation.',     workflow: 'Auto-issue triggers',  workflowHref: '/features/auto-issue' },
    ],
  },
  corporateTraining: {
    hero: { src: IMG.dashboardAnalytics, urlBar: 'app.credsure.io · L&D', alt: 'Corporate L&D analytics dashboard with skill matrix and credential activity' },
    customer: CUSTOMERS.byteedge,
    personas: [
      { tint: 'lavender', role: 'CHROs',              title: 'Turn training into provable, portable skills your workforce brags about.', workflow: 'Skills wall',         workflowHref: '/features/recipient-wall' },
      { tint: 'butter',   role: 'L&D Leads',          title: 'Auto-issue credentials the second a course is completed — across every LMS.', workflow: 'Auto-issue triggers', workflowHref: '/features/auto-issue' },
      { tint: 'sage',     role: 'Talent Operations',  title: 'Surface internal candidates whose credentials match an open role.', workflow: 'Workday integration', workflowHref: '/features/api-integration' },
    ],
  },
  manufacturing: {
    hero: { src: IMG.phoneFlat, urlBar: 'verify.credsure.io · Operator', alt: 'Forklift operator credential verified instantly on a phone at shift handover' },
    customer: CUSTOMERS.cliniIndia,
    personas: [
      { tint: 'sage',     role: 'HSE Directors',        title: 'Every operator. Every shift. Verified in 387ms — even on the line.', workflow: 'Mobile verification',  workflowHref: '/features/verification' },
      { tint: 'lavender', role: 'Plant Managers',       title: 'Multi-site credential dashboard. One pane of glass. Zero spreadsheets.', workflow: 'Analytics dashboard', workflowHref: '/features/analytics' },
      { tint: 'butter',   role: 'Compliance Auditors',  title: 'Audit-ready records — exported to OSHA, ISO and DGUV in one click.', workflow: 'Audit log export',     workflowHref: '/features/security' },
    ],
  },
};

export default solutionMedia;
