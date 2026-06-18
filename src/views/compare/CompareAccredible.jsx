"use client";
import React from 'react';
import { useTranslation } from '@/lib/useTranslation';
import ComparisonPage from './ComparisonPage';

export const CompareAccredible = () => {
  const t = useTranslation();
  return (
    <ComparisonPage
      competitor="Accredible"
      compSlug="accredible"
      tagline={t('pgx.compareAccredible.tagline')}
      reasons={t('pgx.compareAccredible.reasons', { returnObjects: true })}
      features={t('pgx.compareAccredible.features', { returnObjects: true })}
      faqs={t('pgx.compareAccredible.faqs', { returnObjects: true })}
    />
  );
};
