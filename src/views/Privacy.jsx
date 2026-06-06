"use client";
import React from 'react';
import { SEO } from '@/components/SEO';
import { useTranslations as useTranslation } from 'next-intl';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

/**
 * Render a small subset of markdown that appears in our PDF-sourced
 * privacy/terms bodies:
 *   - paragraphs separated by blank lines
 *   - bullets starting with "* " or "- "
 *   - bare URLs → clickable links
 * Pure JSX; no external markdown lib so it stays out of the eager bundle.
 */
const URL_RE = /(https?:\/\/[^\s)]+)/g;

const linkify = (text) => {
  const parts = text.split(URL_RE);
  return parts.map((part, i) =>
    URL_RE.test(part) ? (
      <a
        key={i}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#5B22D6] hover:underline break-words"
      >
        {part}
      </a>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    )
  );
};

const renderBody = (body) => {
  if (!body) return null;
  const blocks = body.split(/\n\s*\n/);

  return blocks.map((block, idx) => {
    const lines = block.split('\n').filter((l) => l.trim() !== '');
    if (lines.length === 0) return null;

    const allBullets = lines.every((l) => /^\s*[*-]\s+/.test(l));
    if (allBullets) {
      return (
        <ul key={idx} className="list-disc pl-6 my-3 space-y-2 text-gray-700">
          {lines.map((l, j) => (
            <li key={j}>{linkify(l.replace(/^\s*[*-]\s+/, ''))}</li>
          ))}
        </ul>
      );
    }

    return (
      <p key={idx} className="my-3 text-gray-700 leading-relaxed">
        {linkify(block)}
      </p>
    );
  });
};

export const Privacy = () => {
  const t = useTranslation();

  // Resolve section + controller arrays. Sometimes a user lands here with
  // a stale cached locale JSON (older service-worker cache, in-flight
  // namespace load, slow connection) that DOESN'T yet have the
  // sections[] / controllerLines[] arrays we now ship. If we just
  // rendered an empty array the page would look blank below the hero
  // — which is what users reported on the 2026-05-27 deploy.
  //
  // Two-step recovery:
  //   1. If the current language's bundle is missing the data, try the
  //      English bundle (always present, always shipped).
  //   2. If that fails too, render a minimal "loading" placeholder so
  //      the page still feels alive while i18n catches up.
  // next-intl has no getResource; messages are already flattened and the
  // active locale always resolves. Degrade to an empty array if missing.
  const tFallback = () => [];
  const asArray = (v) => (Array.isArray(v) ? v : []);

  const sections =
    asArray(t('privacy.sections', { returnObjects: true })).length > 0
      ? t('privacy.sections', { returnObjects: true })
      : tFallback('privacy.sections');
  const controllerLines =
    asArray(t('privacy.controllerLines', { returnObjects: true })).length > 0
      ? t('privacy.controllerLines', { returnObjects: true })
      : tFallback('privacy.controllerLines');

  const sectionList = asArray(sections);
  const controllerArr = asArray(controllerLines);
  const isLoading = sectionList.length === 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#FAFAFA] to-white">
      <SEO
        titleKey="legal:privacy.title"
        descriptionKey="legal:privacy.subtitle"
      />
      <section className="pt-32 pb-20">
        <div className="container mx-auto px-6 md:px-12 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
            data-testid="privacy-hero"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#5B22D6] to-[#3F2BD9] mb-6">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1
              data-testid="privacy-title"
              className="text-4xl md:text-5xl font-extrabold text-[#0F0E1A] mb-4"
            >
              {t('privacy.title')}
            </h1>
            <p className="text-gray-600 text-lg" data-testid="privacy-subtitle">
              {t('privacy.subtitle')}
            </p>
            <p className="text-gray-400 text-sm mt-2">{t('privacy.lastUpdated')}</p>
          </motion.div>

          {controllerArr.length > 0 && (
            <div
              className="bg-white border border-gray-200 rounded-3xl p-8 mb-6"
              data-testid="privacy-controller"
            >
              <p className="font-semibold text-[#0F0E1A] mb-3">
                {t('privacy.controllerLabel')}
              </p>
              <div className="bg-gray-50 rounded-xl p-6 text-sm text-gray-700 space-y-1">
                {controllerArr.map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4" data-testid="privacy-sections">
            {isLoading && (
              <div
                className="bg-white border border-gray-200 rounded-3xl p-8 text-center text-gray-500"
                data-testid="privacy-loading"
              >
                Loading privacy policy…
              </div>
            )}
            {sectionList.map((section, i) => (
              <div
                key={i}
                className="bg-white border border-gray-200 rounded-3xl p-8"
                data-testid={`privacy-section-${i}`}
              >
                <h2 className="text-xl font-bold text-[#0F0E1A] mb-4">
                  {section.title}
                </h2>
                {renderBody(section.body)}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Privacy;
