"use client";
import React from 'react';
import PropTypes from 'prop-types';
import { useTranslations as useTranslation } from 'next-intl';
import { useLocation } from '@/lib/router-shim';
import { createFAQSchema, createSpeakableSchema, combineSchemas, getBaseUrl } from './SEO';
import { StructuredData } from './StructuredData';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';

/**
 * Solution-specific FAQ data keyed by solution slug.
 * Each solution gets industry-specific questions for AI search visibility.
 */
const solutionFAQs = {
  higherEducation: [
    { question: 'How do universities issue digital credentials with CredSure?', answer: 'Universities can issue blockchain-verified digital certificates and badges through CredSure\'s platform. Bulk issuance via CSV upload allows thousands of credentials to be issued in minutes, with automatic delivery to graduates via email.' },
    { question: 'Can students share digital credentials on LinkedIn?', answer: 'Yes. Recipients can share their CredSure digital credentials directly to LinkedIn, Twitter, Facebook, and other platforms with a single click. The credential includes a verification link that employers can use to instantly confirm authenticity.' },
    { question: 'How does blockchain verification prevent fake degrees?', answer: 'CredSure anchors every credential to the blockchain, creating an immutable record. This means credentials cannot be altered or forged after issuance. Employers can verify any credential in seconds by scanning the QR code or clicking the verification link.' },
    { question: 'Does CredSure integrate with university LMS platforms?', answer: 'Yes. CredSure integrates with popular LMS platforms like Moodle, Canvas, Blackboard, and custom systems via REST API. Credentials can be auto-issued upon course completion.' },
  ],
  corporateTraining: [
    { question: 'How can companies automate employee certification?', answer: 'CredSure integrates with your LMS or HR systems via API to automatically issue digital certificates when employees complete training programs. This eliminates manual certificate creation and distribution.' },
    { question: 'Can CredSure track employee credential expiry?', answer: 'Yes. CredSure supports credential expiry dates and automated renewal reminders. Managers can view dashboards showing which employees need recertification, helping maintain compliance.' },
    { question: 'How does digital credentialing improve employee engagement?', answer: 'Employees can share achievements on LinkedIn and professional profiles, increasing visibility and motivation. Analytics show that shareable credentials increase training completion rates by up to 20%.' },
    { question: 'What ROI can companies expect from digital credentials?', answer: 'Companies typically save 60-80% on credential management costs by eliminating printing, postage, and manual verification. Digital credentials also reduce administrative time by up to 90%.' },
  ],
  associations: [
    { question: 'How do professional associations issue digital badges?', answer: 'CredSure enables associations to create branded digital badges and certificates that members earn through continuing education, event attendance, or professional development milestones.' },
    { question: 'Can members display credentials on their professional profiles?', answer: 'Yes. Members can add CredSure credentials to LinkedIn, personal websites, email signatures, and digital wallets. Each credential links back to a verification page that confirms authenticity.' },
    { question: 'How does CredSure help associations increase membership value?', answer: 'Digital credentials give members tangible, shareable proof of their professional achievements. This increases the perceived value of membership and drives renewals. Analytics show shared credentials generate brand impressions for the association.' },
    { question: 'Does CredSure support continuing education credits (CEUs)?', answer: 'Yes. CredSure can track CEU requirements, issue credentials upon completion, and manage expiry/renewal cycles. Members and administrators can view progress dashboards.' },
  ],
  certificationBodies: [
    { question: 'How do certification bodies prevent credential fraud?', answer: 'CredSure uses blockchain technology to create tamper-proof digital credentials. Every certificate is anchored to an immutable ledger, making forgery impossible. Third parties can verify any credential instantly via QR code or verification link.' },
    { question: 'Can CredSure handle high-volume credential issuance?', answer: 'Yes. CredSure supports bulk issuance of thousands of credentials simultaneously via CSV upload or API integration. The platform is built to handle enterprise-scale volumes with no performance degradation.' },
    { question: 'How does instant verification work?', answer: 'Each CredSure credential contains a unique QR code and verification URL. Anyone can scan or click to see the credential details, issuer information, and blockchain verification status in real-time — no account or login required.' },
    { question: 'Does CredSure comply with international credential standards?', answer: 'Yes. CredSure supports W3C Verifiable Credentials and European Digital Credentials standards. This ensures interoperability with global credential ecosystems.' },
  ],
  healthcare: [
    { question: 'How can healthcare organizations manage staff certifications digitally?', answer: 'CredSure provides a centralized platform for issuing, tracking, and verifying healthcare staff credentials. Automated expiry alerts ensure compliance with medical licensing requirements.' },
    { question: 'Is CredSure GDPR and HIPAA compatible?', answer: 'Yes. CredSure is fully GDPR compliant and can be configured to meet HIPAA requirements. Credential data is encrypted, and recipients control who can access their information.' },
    { question: 'Can patients verify healthcare provider credentials?', answer: 'Yes. Healthcare providers can share a verification link or QR code that patients or institutions can use to instantly confirm their qualifications, certifications, and licensing status.' },
    { question: 'How does CredSure handle credential renewal for medical licenses?', answer: 'CredSure tracks expiry dates for all issued credentials. Automated notifications are sent to both the credential holder and the issuing organization before expiry, streamlining the renewal process.' },
  ],
  manufacturing: [
    { question: 'How can manufacturers track employee safety certifications?', answer: 'CredSure provides real-time dashboards showing which employees hold current safety certifications, which are approaching expiry, and which need renewal. Automated alerts prevent compliance gaps.' },
    { question: 'Does CredSure support ISO and industry compliance certifications?', answer: 'Yes. CredSure can issue and manage credentials for ISO 9001, ISO 14001, Six Sigma, OSHA, and other industry-specific certifications. Each credential is blockchain-verified for audit readiness.' },
    { question: 'Can CredSure integrate with manufacturing ERP systems?', answer: 'Yes. CredSure\'s REST API enables integration with SAP, Oracle, and other ERP systems. Credentials can be automatically issued when training modules are completed within your existing systems.' },
    { question: 'How does digital credentialing improve manufacturing audit readiness?', answer: 'Blockchain-verified credentials provide instant, tamper-proof evidence of staff qualifications during audits. No more searching through filing cabinets — auditors can verify any credential in seconds.' },
  ],
};

export const SolutionFAQ = ({ solutionKey }) => {
  const t = useTranslation();
  const location = useLocation();
  const faqs = solutionFAQs[solutionKey] || [];

  if (faqs.length === 0) return null;

  return (
    <>
      <StructuredData data={combineSchemas(
        createFAQSchema(faqs, getBaseUrl(), location.pathname),
        createSpeakableSchema(
          { title: t(`pages.solutions.${solutionKey}.title`, ''), description: t(`pages.solutions.${solutionKey}.subtitle`, '') },
          ['h1', 'h2', '.faq-answer']
        )
      )} />
      <section className="py-20 bg-slate-50 " data-testid={`${solutionKey}-faq`}>
        <div className="container mx-auto px-6 md:px-12 max-w-4xl">
          <h2 className="text-3xl font-bold text-[#0F0E1A]  mb-8 text-center">
            Frequently Asked{' '}
            <span className="text-transparent bg-gradient-to-r from-[#5B22D6] to-[#E22B8A] bg-clip-text">Questions</span>
          </h2>
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={`faq-${faq.question?.slice(0, 30) || index}`}
                value={`faq-${index}`}
                className="bg-white  border border-slate-200  rounded-xl px-6 hover:border-[#5B22D6]/30 transition-colors"
              >
                <AccordionTrigger className="text-left text-base font-semibold text-slate-900  hover:text-[#5B22D6] py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="faq-answer text-slate-600  leading-relaxed pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </>
  );
};

SolutionFAQ.propTypes = {
  solutionKey: PropTypes.string.isRequired,
};
