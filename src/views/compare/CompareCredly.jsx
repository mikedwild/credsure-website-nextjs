"use client";
import React from 'react';
import { useTranslation } from '@/lib/useTranslation';
import ComparisonPage from './ComparisonPage';

export const CompareCredly = () => {
  const t = useTranslation();
  return (
    <ComparisonPage
      competitor="Credly"
      compSlug="credly"
      tagline={t('pgx.compareCredly.tagline')}
      reasons={t('pgx.compareCredly.reasons', { returnObjects: true })}
      features={t('pgx.compareCredly.features', { returnObjects: true })}
      faqs={t('pgx.compareCredly.faqs', { returnObjects: true })}
    />
  );
};
