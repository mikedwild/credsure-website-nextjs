"use client";
import React from 'react';
import { useTranslations as useTranslation } from 'next-intl';
import { useLocation } from '@/lib/router-shim';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';
import { createFAQSchema, getBaseUrl } from './SEO';
import { StructuredData } from './StructuredData';

export const FAQ = () => {
  const t = useTranslation();
  const location = useLocation();
  const DEFAULT_FAQS = [
    { question: 'How quickly can I start issuing credentials?', answer: 'You can issue your first credential within minutes of signing up. Our onboarding wizard guides you through template creation, branding, and your first batch issue.' },
    { question: 'Is Credsure GDPR compliant?', answer: 'Yes. All data is stored in EU data centres (Frankfurt), we are fully GDPR compliant, and we offer a Data Processing Agreement (DPA) for enterprise customers.' },
    { question: 'Can recipients share their credentials on LinkedIn?', answer: 'Yes. Recipients get a shareable link and a one-click LinkedIn integration that adds the credential directly to their profile.' },
    { question: 'What file formats are supported for bulk import?', answer: 'We support CSV and Excel uploads. You can map any column to credential fields, and our validation layer catches errors before issuance.' },
    { question: 'Do you offer an API?', answer: 'Yes. Our REST API lets you integrate credential issuance into your LMS, HRIS, or custom systems. Full documentation and Postman collection available.' },
  ];
  const rawFaqItems = t('faqSection.items', { returnObjects: true });
  const faqItems = Array.isArray(rawFaqItems) ? rawFaqItems : DEFAULT_FAQS;

  // Format FAQs for schema
  const faqSchemaData = Array.isArray(faqItems)
    ? faqItems.map(faq => ({
        question: faq?.question,
        answer: faq?.answer,
      }))
    : [];

  // Defer to createFAQSchema's hardened path: returns null for empty/malformed
  // input, which the SEO component then skips. Avoids "Missing mainEntity".
  const schema = createFAQSchema(faqSchemaData, getBaseUrl(), location.pathname);
  
  return (
    <section className="py-24 bg-slate-50  transition-colors duration-300">
      <StructuredData data={schema} />
      
      <div className="container mx-auto px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900  mb-4">
            {t('faqSection.title')}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-[#5B22D6] to-[#3F2BD9]">
              {t('faqSection.titleHighlight')}
            </span>
          </h2>
          <p className="text-xl text-slate-600 ">
            {t('faqSection.subtitle')}
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqItems.map((faq, index) => (
              <AccordionItem
                key={`faq-${faq.question?.slice(0, 30) || index}`}
                value={`item-${index}`}
                className="bg-white  border border-slate-200  rounded-xl px-6 hover:border-brand-purple/30 transition-colors"
              >
                <AccordionTrigger className="text-left text-lg font-semibold text-slate-900  hover:text-brand-purple py-6">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-slate-600  leading-relaxed pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Contact support */}
        <div className="text-center mt-12">
          <p className="text-slate-600  mb-4">{t('faqSection.stillHaveQuestions')}</p>
          <a
            href="#contact"
            className="inline-flex items-center text-brand-purple hover:text-brand-purple-light font-semibold"
          >
            {t('faqSection.contactSupport')}
          </a>
        </div>
      </div>
    </section>
  );
};
