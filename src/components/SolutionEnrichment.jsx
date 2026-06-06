"use client";
import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { ArrowRight, Check, X, Minus } from 'lucide-react';
import { Button } from './ui/button';

/**
 * Stats bar — key metrics for each solution page
 */
const solutionStats = {
  higherEducation: [
    { value: '90%', label: 'Reduction in certificate fraud', suffix: '' },
    { value: '85%', label: 'Faster credential verification', suffix: '' },
    { value: '60%', label: 'Cost savings vs paper certificates', suffix: '' },
    { value: '2M+', label: 'Credentials issued globally', suffix: '' },
  ],
  corporateTraining: [
    { value: '90%', label: 'Less admin time on certifications', suffix: '' },
    { value: '20%', label: 'Higher training completion rate', suffix: '' },
    { value: '80%', label: 'Cost reduction vs manual processes', suffix: '' },
    { value: '3x', label: 'More credential sharing on LinkedIn', suffix: '' },
  ],
  associations: [
    { value: '40%', label: 'Increase in membership renewals', suffix: '' },
    { value: '5x', label: 'More brand impressions per credential', suffix: '' },
    { value: '95%', label: 'Member satisfaction with digital badges', suffix: '' },
    { value: '70%', label: 'Reduction in verification requests', suffix: '' },
  ],
  certificationBodies: [
    { value: '100%', label: 'Tamper-proof blockchain verification', suffix: '' },
    { value: '10K+', label: 'Credentials issued per batch', suffix: '' },
    { value: '<3s', label: 'Average verification time', suffix: '' },
    { value: '99.9%', label: 'Platform uptime SLA', suffix: '' },
  ],
  healthcare: [
    { value: '100%', label: 'Audit-ready compliance records', suffix: '' },
    { value: '75%', label: 'Faster onboarding with instant verification', suffix: '' },
    { value: '0', label: 'Manual verification steps needed', suffix: '' },
    { value: '24/7', label: 'Real-time credential status monitoring', suffix: '' },
  ],
  manufacturing: [
    { value: '99%', label: 'Audit pass rate with digital records', suffix: '' },
    { value: '50%', label: 'Reduction in compliance gaps', suffix: '' },
    { value: '80%', label: 'Less time on certification tracking', suffix: '' },
    { value: '100%', label: 'Traceability of safety certifications', suffix: '' },
  ],
};

export const SolutionStats = ({ solutionKey }) => {
  const stats = solutionStats[solutionKey] || [];
  if (stats.length === 0) return null;

  return (
    <section className="py-16 bg-gradient-to-r from-[#5B22D6] to-[#3F2BD9]" data-testid={`${solutionKey}-stats`}>
      <div className="container mx-auto px-6 md:px-12 max-w-6xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-3xl md:text-4xl font-extrabold text-white mb-2">{stat.value}</div>
              <div className="text-sm text-white/80">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

/**
 * Comparison table — Traditional vs CredSure
 */
const solutionComparisons = {
  higherEducation: {
    title: 'Traditional Certificates vs CredSure Digital Credentials',
    rows: [
      { feature: 'Issuance time', traditional: 'Days to weeks', credsure: 'Seconds' },
      { feature: 'Verification', traditional: 'Manual calls/emails', credsure: 'Instant via QR/link' },
      { feature: 'Fraud protection', traditional: 'Easily forged', credsure: 'Blockchain-secured' },
      { feature: 'Sharing', traditional: 'Physical mail/scan', credsure: 'One-click to LinkedIn' },
      { feature: 'Cost per credential', traditional: '$5-15 (print + mail)', credsure: '$0.50-2.00' },
      { feature: 'Analytics', traditional: 'None', credsure: 'Real-time dashboard' },
      { feature: 'Environmental impact', traditional: 'Paper waste', credsure: 'Zero paper' },
    ],
  },
  corporateTraining: {
    title: 'Manual Certification Management vs CredSure Automation',
    rows: [
      { feature: 'Certificate creation', traditional: 'Manual design per employee', credsure: 'Templated bulk generation' },
      { feature: 'Distribution', traditional: 'Email attachments', credsure: 'Automated delivery + wallet' },
      { feature: 'Expiry tracking', traditional: 'Spreadsheets', credsure: 'Automated alerts' },
      { feature: 'Compliance reporting', traditional: 'Manual audits', credsure: 'Real-time dashboards' },
      { feature: 'Employee engagement', traditional: 'Low visibility', credsure: 'LinkedIn sharing + badges' },
      { feature: 'LMS integration', traditional: 'None', credsure: 'API + Zapier' },
    ],
  },
  associations: {
    title: 'Traditional Membership vs Digital Credentials',
    rows: [
      { feature: 'Member recognition', traditional: 'Paper certificates', credsure: 'Digital badges + certificates' },
      { feature: 'Brand visibility', traditional: 'Limited to events', credsure: 'Social media amplification' },
      { feature: 'CEU tracking', traditional: 'Manual spreadsheets', credsure: 'Automated progress tracking' },
      { feature: 'Credential verification', traditional: 'Phone/email requests', credsure: 'Instant QR verification' },
      { feature: 'Renewal reminders', traditional: 'Manual follow-ups', credsure: 'Automated notifications' },
    ],
  },
  certificationBodies: {
    title: 'Legacy Certification Systems vs CredSure Platform',
    rows: [
      { feature: 'Fraud prevention', traditional: 'Holograms/watermarks', credsure: 'Blockchain immutability' },
      { feature: 'Batch issuance', traditional: '100s per day', credsure: '10,000+ per batch' },
      { feature: 'Global verification', traditional: 'Regional databases', credsure: 'Instant worldwide access' },
      { feature: 'Standards compliance', traditional: 'Varies by region', credsure: 'W3C Verifiable Credentials' },
      { feature: 'API access', traditional: 'Limited/none', credsure: 'Full REST API + webhooks' },
      { feature: 'White-labeling', traditional: 'Not available', credsure: 'Full brand customization' },
    ],
  },
  healthcare: {
    title: 'Paper-based Records vs Digital Credential Management',
    rows: [
      { feature: 'License verification', traditional: '24-72 hours', credsure: 'Under 3 seconds' },
      { feature: 'Audit preparation', traditional: 'Weeks of gathering docs', credsure: 'Always audit-ready' },
      { feature: 'Expiry management', traditional: 'Calendar reminders', credsure: 'Automated 90/60/30 day alerts' },
      { feature: 'Cross-facility portability', traditional: 'Re-verification needed', credsure: 'Universal digital wallet' },
      { feature: 'Data security', traditional: 'Filing cabinets + scans', credsure: 'Encrypted + blockchain' },
    ],
  },
  manufacturing: {
    title: 'Manual Safety Tracking vs CredSure Digital Compliance',
    rows: [
      { feature: 'Safety cert tracking', traditional: 'Binder systems', credsure: 'Real-time dashboard' },
      { feature: 'Audit evidence', traditional: 'Paper trail', credsure: 'Blockchain-verified records' },
      { feature: 'Multi-site management', traditional: 'Per-site systems', credsure: 'Centralized platform' },
      { feature: 'ISO compliance proof', traditional: 'Manual documentation', credsure: 'Instant digital verification' },
      { feature: 'Training gap detection', traditional: 'Quarterly reviews', credsure: 'Real-time gap analysis' },
    ],
  },
};

export const SolutionComparison = ({ solutionKey }) => {
  const data = solutionComparisons[solutionKey];
  if (!data) return null;

  return (
    <section className="py-20 bg-white " data-testid={`${solutionKey}-comparison`}>
      <div className="container mx-auto px-6 md:px-12 max-w-5xl">
        <h2 className="text-3xl font-bold text-[#0F0E1A]  mb-4 text-center">
          {data.title.split(' vs ')[0]} vs{' '}
          <span className="text-transparent bg-gradient-to-r from-[#5B22D6] to-[#E22B8A] bg-clip-text">
            {data.title.split(' vs ')[1]}
          </span>
        </h2>
        <p className="text-center text-gray-500  mb-10 text-sm">See how digital credentials transform your workflow</p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-[#5B22D6]/20">
                <th className="text-left py-4 px-4 text-sm font-bold text-slate-500  uppercase tracking-wider w-1/3">Feature</th>
                <th className="text-center py-4 px-4 text-sm font-bold text-red-400 uppercase tracking-wider w-1/3">Traditional</th>
                <th className="text-center py-4 px-4 text-sm font-bold text-[#5B22D6]  uppercase tracking-wider w-1/3">CredSure</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row, i) => (
                <motion.tr
                  key={row.feature}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-slate-100  hover:bg-slate-50 :bg-slate-900/50 transition-colors"
                >
                  <td className="py-4 px-4 font-semibold text-slate-800  text-sm">{row.feature}</td>
                  <td className="py-4 px-4 text-center text-slate-500  text-sm">{row.traditional}</td>
                  <td className="py-4 px-4 text-center font-semibold text-[#5B22D6]  text-sm">{row.credsure}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

/**
 * How It Works — 3-4 step process for each solution
 */
const solutionSteps = {
  higherEducation: [
    { step: '1', title: 'Design Your Credential', desc: 'Use our template designer to create branded digital certificates and badges that match your university identity.' },
    { step: '2', title: 'Bulk Issue to Graduates', desc: 'Upload a CSV or connect your LMS to automatically issue thousands of credentials in minutes.' },
    { step: '3', title: 'Recipients Share & Verify', desc: 'Graduates receive their credentials via email, share them on LinkedIn, and employers verify instantly via QR code.' },
    { step: '4', title: 'Track & Analyze', desc: 'Monitor sharing analytics, verification rates, and the marketing reach generated by your digital credentials.' },
  ],
  corporateTraining: [
    { step: '1', title: 'Connect Your LMS', desc: 'Integrate CredSure with your training platform via API, Zapier, or direct LMS plugin.' },
    { step: '2', title: 'Set Issuance Rules', desc: 'Define which training completions trigger automatic credential issuance and set expiry periods.' },
    { step: '3', title: 'Auto-Issue Certificates', desc: 'Employees automatically receive branded digital certificates when they complete training programs.' },
    { step: '4', title: 'Monitor Compliance', desc: 'Track certification status, upcoming expiries, and compliance gaps across your organization.' },
  ],
  associations: [
    { step: '1', title: 'Create Badge Programs', desc: 'Design digital badge programs for certifications, continuing education, and event participation.' },
    { step: '2', title: 'Issue to Members', desc: 'Award credentials upon milestone completion — manually or automated through your membership system.' },
    { step: '3', title: 'Members Share Achievements', desc: 'Members proudly display badges on LinkedIn, websites, and email signatures, amplifying your brand.' },
    { step: '4', title: 'Grow Membership Value', desc: 'Use analytics to demonstrate credential value and drive membership renewals.' },
  ],
  certificationBodies: [
    { step: '1', title: 'Configure Standards', desc: 'Set up credential types aligned with W3C Verifiable Credentials or your custom standards.' },
    { step: '2', title: 'Secure Issuance', desc: 'Issue blockchain-anchored credentials individually or in batches of 10,000+ via CSV or API.' },
    { step: '3', title: 'Instant Verification', desc: 'Third parties verify any credential in seconds via QR code or verification link — no account needed.' },
    { step: '4', title: 'Manage Lifecycle', desc: 'Handle renewals, revocations, and version updates with full audit trail.' },
  ],
  healthcare: [
    { step: '1', title: 'Onboard Your Organization', desc: 'Set up credential templates for medical licenses, certifications, and continuing education requirements.' },
    { step: '2', title: 'Issue & Track Credentials', desc: 'Issue digital credentials to staff and set automated expiry tracking with multi-stage reminders.' },
    { step: '3', title: 'Enable Instant Verification', desc: 'Patients, facilities, and regulators verify staff credentials in seconds via QR code.' },
    { step: '4', title: 'Maintain Compliance', desc: 'Real-time dashboards show credential status across all staff, ensuring continuous compliance.' },
  ],
  manufacturing: [
    { step: '1', title: 'Map Safety Requirements', desc: 'Define credential types for ISO, OSHA, Six Sigma, and other industry-specific certifications.' },
    { step: '2', title: 'Issue Digital Certifications', desc: 'Automatically issue credentials when employees complete training in your ERP or LMS.' },
    { step: '3', title: 'Track Across Facilities', desc: 'Centralized dashboard shows real-time certification status across all manufacturing sites.' },
    { step: '4', title: 'Ace Every Audit', desc: 'Provide auditors with instant, blockchain-verified proof of staff qualifications.' },
  ],
};

export const SolutionHowItWorks = ({ solutionKey }) => {
  const steps = solutionSteps[solutionKey] || [];
  if (steps.length === 0) return null;

  return (
    <section className="py-20 bg-slate-50 " data-testid={`${solutionKey}-how-it-works`}>
      <div className="container mx-auto px-6 md:px-12 max-w-5xl">
        <h2 className="text-3xl font-bold text-[#0F0E1A]  mb-4 text-center">
          How It{' '}
          <span className="text-transparent bg-gradient-to-r from-[#5B22D6] to-[#E22B8A] bg-clip-text">Works</span>
        </h2>
        <p className="text-center text-gray-500  mb-12 text-sm">Get started in minutes, see results in days</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative"
            >
              <div className="bg-white  border border-gray-200  rounded-2xl p-6 h-full hover:shadow-lg transition-shadow">
                <div className="w-10 h-10 bg-gradient-to-br from-[#5B22D6] to-[#E22B8A] rounded-xl flex items-center justify-center mb-4">
                  <span className="text-white font-bold text-lg">{step.step}</span>
                </div>
                <h3 className="text-lg font-bold text-[#0F0E1A]  mb-2">{step.title}</h3>
                <p className="text-gray-600  text-sm leading-relaxed">{step.desc}</p>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden lg:flex absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                  <ArrowRight className="w-6 h-6 text-[#5B22D6]/30" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

/**
 * Platform capability matrix table
 */
export const PlatformCapabilityTable = () => {
  const categories = [
    {
      name: 'Credential Management',
      features: [
        { name: 'Digital certificates', starter: true, professional: true, enterprise: true },
        { name: 'Digital badges', starter: true, professional: true, enterprise: true },
        { name: 'Blockchain verification', starter: true, professional: true, enterprise: true },
        { name: 'QR code verification', starter: true, professional: true, enterprise: true },
        { name: 'Bulk issuance (CSV)', starter: false, professional: true, enterprise: true },
        { name: 'Credential revocation', starter: false, professional: true, enterprise: true },
      ],
    },
    {
      name: 'Automation & Integration',
      features: [
        { name: 'REST API access', starter: false, professional: true, enterprise: true },
        { name: 'Webhook notifications', starter: false, professional: true, enterprise: true },
        { name: 'LMS integration (Moodle, Canvas)', starter: false, professional: false, enterprise: true },
        { name: 'Zapier / Make automation', starter: false, professional: true, enterprise: true },
        { name: 'SSO / SAML', starter: false, professional: false, enterprise: true },
        { name: 'Custom ERP integration', starter: false, professional: false, enterprise: true },
      ],
    },
    {
      name: 'Customization & Branding',
      features: [
        { name: 'Template designer', starter: true, professional: true, enterprise: true },
        { name: 'Custom branding', starter: false, professional: true, enterprise: true },
        { name: 'White-label portal', starter: false, professional: false, enterprise: true },
        { name: 'Custom domain', starter: false, professional: false, enterprise: true },
        { name: 'Custom email templates', starter: false, professional: true, enterprise: true },
      ],
    },
    {
      name: 'Analytics & Reporting',
      features: [
        { name: 'Basic sharing analytics', starter: true, professional: true, enterprise: true },
        { name: 'Advanced engagement metrics', starter: false, professional: true, enterprise: true },
        { name: 'Export reports (CSV/PDF)', starter: false, professional: true, enterprise: true },
        { name: 'Custom dashboards', starter: false, professional: false, enterprise: true },
        { name: 'Compliance reporting', starter: false, professional: false, enterprise: true },
      ],
    },
  ];

  const renderIcon = (val) => {
    if (val === true) return <Check className="w-5 h-5 text-green-500 mx-auto" />;
    if (val === false) return <Minus className="w-5 h-5 text-slate-300  mx-auto" />;
    return <span className="text-sm text-slate-500">{val}</span>;
  };

  return (
    <section className="py-20 bg-white " data-testid="platform-capabilities">
      <div className="container mx-auto px-6 md:px-12 max-w-5xl">
        <h2 className="text-3xl font-bold text-[#0F0E1A]  mb-4 text-center">
          Platform{' '}
          <span className="text-transparent bg-gradient-to-r from-[#5B22D6] to-[#E22B8A] bg-clip-text">Capabilities</span>
        </h2>
        <p className="text-center text-gray-500  mb-10 text-sm">Compare features across plans</p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-[#5B22D6]/20">
                <th className="text-left py-4 px-4 text-sm font-bold text-slate-500  uppercase tracking-wider w-2/5">Feature</th>
                <th className="text-center py-4 px-4 text-sm font-bold text-slate-600  uppercase tracking-wider">Starter</th>
                <th className="text-center py-4 px-4 text-sm font-bold text-[#5B22D6]  uppercase tracking-wider">Professional</th>
                <th className="text-center py-4 px-4 text-sm font-bold text-[#E22B8A] uppercase tracking-wider">Enterprise</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <React.Fragment key={cat.name}>
                  <tr className="bg-slate-50 ">
                    <td colSpan={4} className="py-3 px-4 font-bold text-sm text-[#5B22D6]  uppercase tracking-wider">{cat.name}</td>
                  </tr>
                  {cat.features.map((feat) => (
                    <motion.tr
                      key={feat.name}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.03 }}
                      className="border-b border-slate-100  hover:bg-slate-50 :bg-slate-900/50 transition-colors"
                    >
                      <td className="py-3 px-4 text-sm text-slate-700 ">{feat.name}</td>
                      <td className="py-3 px-4">{renderIcon(feat.starter)}</td>
                      <td className="py-3 px-4">{renderIcon(feat.professional)}</td>
                      <td className="py-3 px-4">{renderIcon(feat.enterprise)}</td>
                    </motion.tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

SolutionStats.propTypes = {
  solutionKey: PropTypes.string.isRequired,
};

SolutionComparison.propTypes = {
  solutionKey: PropTypes.string.isRequired,
};

SolutionHowItWorks.propTypes = {
  solutionKey: PropTypes.string.isRequired,
};
