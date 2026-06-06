"use client";
import React from 'react';
import ComparisonPage from './ComparisonPage';

const reasons = [
  { title: 'No Enterprise-Only Pricing', desc: 'Credly starts at $2,500/year with enterprise-focused pricing. CredSure starts at €45/month making it accessible for organizations of all sizes.' },
  { title: 'Self-Serve Setup', desc: 'CredSure lets you set up and issue credentials in minutes. Credly requires a sales-led onboarding process that can take 3-4 weeks.' },
  { title: 'Full White-Labeling', desc: 'CredSure includes white-labeling on all paid plans. Credly displays its own branding on credential pages, reducing your brand visibility.' },
  { title: 'Transparent Feature Access', desc: 'All CredSure features are available without gated tiers. Credly locks advanced features behind enterprise contracts.' },
  { title: 'Credential Certificates + Badges', desc: 'CredSure supports both digital certificates and badges from a single platform. Credly is primarily focused on digital badges only.' },
  { title: 'Bilingual by Default', desc: 'Full English and German support. Issue and verify credentials in multiple languages. Credly offers English-only interface.' },
];

const features = [
  { feature: 'Starting Price', credsure: '€45/month', competitor: '$2,500/year' },
  { feature: 'Pricing Model', credsure: 'Monthly (billed annually)', competitor: 'Annual contracts only' },
  { feature: 'Self-Serve Signup', credsure: true, competitor: false },
  { feature: 'Setup Time', credsure: '10 minutes', competitor: '3-4 weeks' },
  { feature: 'Digital Certificates', credsure: true, competitor: false },
  { feature: 'Digital Badges', credsure: true, competitor: true },
  { feature: 'White-Label', credsure: 'All paid plans', competitor: 'Enterprise only' },
  { feature: 'Blockchain Verification', credsure: true, competitor: false },
  { feature: 'Standards Compliant', credsure: true, competitor: true },
  { feature: 'Template Library', credsure: '500+ templates', competitor: 'Limited' },
  { feature: 'Custom Branding', credsure: true, competitor: 'Enterprise only' },
  { feature: 'Zapier Integration', credsure: true, competitor: true },
  { feature: 'REST API', credsure: true, competitor: true },
  { feature: 'Analytics Dashboard', credsure: true, competitor: true },
  { feature: 'LinkedIn Sharing', credsure: 'One-click', competitor: 'One-click' },
  { feature: 'CSV Bulk Import', credsure: true, competitor: true },
  { feature: 'Multilingual Support', credsure: 'EN, DE', competitor: 'EN only' },
  { feature: 'ISO 27001 Certified', credsure: true, competitor: true },
];

const faqs = [
  { q: 'How much does Credly cost?', a: 'Credly starts at approximately $2,500/year for basic access and scales to $11,000+/year for enterprise plans. CredSure starts at €45/month (billed annually) with no enterprise-only gating.' },
  { q: 'Does Credly support digital certificates?', a: 'Credly focuses primarily on digital badges. If you need both certificates and badges, CredSure offers both from a single platform.' },
  { q: 'Can I try Credly for free?', a: 'Credly does not offer a free self-serve trial. You must contact sales. CredSure provides immediate access with a full-featured trial.' },
  { q: 'Can I migrate from Credly to CredSure?', a: 'Yes. CredSure offers free migration support. Our team will help transfer your badge programs, templates, and recipient data.' },
  { q: 'Is CredSure suitable for large organizations?', a: 'Yes. CredSure serves organizations from startups to enterprises with SSO/SAML, custom domains, white-labeling, and dedicated account management — without requiring enterprise-only contracts.' },
];

export const CompareCredly = () => (
  <ComparisonPage
    competitor="Credly"
    compSlug="credly"
    tagline="CredSure gives you enterprise-grade credentialing without the enterprise-only pricing. Self-serve setup, transparent plans, and full white-labeling from day one."
    reasons={reasons}
    features={features}
    faqs={faqs}
  />
);
