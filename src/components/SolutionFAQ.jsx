"use client";
import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from '@/lib/useTranslation';
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
 * Copy now lives in i18n (solx.faqs.<solutionKey>) for EN + DE.
 */
export const SolutionFAQ = ({ solutionKey }) => {
  const t = useTranslation();
  const location = useLocation();
  const rawFaqs = t(`solx.faqs.${solutionKey}`, { returnObjects: true });
  const faqs = Array.isArray(rawFaqs) ? rawFaqs : [];

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
            {t('solx.headings.faqTitle')}{' '}
            <span className="text-transparent bg-gradient-to-r from-[#5B22D6] to-[#E22B8A] bg-clip-text">{t('solx.headings.faqHighlight')}</span>
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
