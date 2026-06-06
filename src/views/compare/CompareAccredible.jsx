"use client";
import React from 'react';
import ComparisonPage from './ComparisonPage';

const reasons = [
  { title: 'Transparent Pricing', desc: 'CredSure starts at €45/month with no hidden fees. Accredible charges $45/month for just 50 recipients with limited trial access.' },
  { title: 'Faster Time to Launch', desc: 'Issue your first credential in under 10 minutes with CredSure. Accredible typically requires 2-4 weeks of onboarding and setup.' },
  { title: '100% Email Deliverability', desc: 'CredSure uses optimized DNS, DMARC, and custom sender domains to guarantee every credential reaches inboxes. No more spam folder issues.' },
  { title: 'White-Label on All Plans', desc: 'Full white-labeling included on all paid plans. No extra charges for custom branding, sender domains, or branded verification pages.' },
  { title: 'Standards Compliant', desc: 'Every badge and certificate issued through CredSure is standards-compliant and interoperable across platforms.' },
  { title: 'Bilingual Platform', desc: 'Full English and German language support built-in. Issue, verify, and manage credentials in your recipients\' preferred language.' },
];

const features = [
  { feature: 'Starting Price', credsure: '€45/month', competitor: '$45/month' },
  { feature: 'Free Trial', credsure: 'Full platform access', competitor: 'Limited — upon request' },
  { feature: 'Setup Time', credsure: '10 minutes', competitor: '2-4 weeks' },
  { feature: 'White-Label', credsure: 'All paid plans', competitor: 'Available (limited)' },
  { feature: 'Custom Email Sender', credsure: true, competitor: 'Deliverability issues' },
  { feature: 'Blockchain Verification', credsure: true, competitor: true },
  { feature: 'Standards Compliant', credsure: true, competitor: true },
  { feature: 'Custom Fonts', credsure: true, competitor: '$500 setup fee' },
  { feature: 'QR Code Credentials', credsure: true, competitor: true },
  { feature: 'SSO / SAML', credsure: true, competitor: 'SAML only' },
  { feature: 'Zapier Integration', credsure: true, competitor: true },
  { feature: 'REST API', credsure: true, competitor: true },
  { feature: 'Analytics Dashboard', credsure: true, competitor: true },
  { feature: 'LinkedIn Sharing', credsure: 'One-click', competitor: true },
  { feature: 'CSV Bulk Import', credsure: true, competitor: true },
  { feature: 'Multilingual Support', credsure: 'EN, DE', competitor: 'EN only' },
  { feature: 'ISO 27001 Certified', credsure: true, competitor: true },
];

const faqs = [
  { q: 'How much does Accredible cost?', a: 'Accredible starts at $45/month for 50 recipients. Higher tiers are custom priced and require annual contracts. CredSure offers transparent pricing starting at €45/month with monthly billing, billed annually.' },
  { q: 'Does Accredible offer a free trial?', a: 'Accredible offers a limited free trial upon request with restricted features. CredSure provides full platform access during the trial period.' },
  { q: 'Can I migrate from Accredible to CredSure?', a: 'Yes. CredSure offers free migration assistance. Our team will help you transfer your templates, recipient data, and credentials with zero downtime.' },
  { q: 'Is CredSure suitable for enterprise organizations?', a: 'Absolutely. CredSure serves organizations from startups to enterprises with SSO/SAML, custom domains, white-labeling, and dedicated account management.' },
  { q: 'What integrations does CredSure support?', a: 'CredSure integrates with Zapier (8,000+ apps), Moodle, Salesforce, HubSpot, Google Sheets, and many more. Our REST API allows custom integrations with any platform.' },
];

export const CompareAccredible = () => (
  <ComparisonPage
    competitor="Accredible"
    compSlug="accredible"
    tagline="CredSure offers transparent pricing, faster setup, guaranteed email delivery, and full white-labeling — everything you need to scale your digital credentialing program."
    reasons={reasons}
    features={features}
    faqs={faqs}
  />
);
