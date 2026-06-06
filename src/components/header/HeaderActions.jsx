"use client";
import React from 'react';
import PropTypes from 'prop-types';
import { useTranslations as useTranslation } from 'next-intl';
import { Button } from '../ui/button';
import { LanguageSwitcher } from '../LanguageSwitcher';

export const HeaderActions = ({ currentLang, onDemoClick }) => {
  const t = useTranslation();

  return (
    <div className="hidden xl:flex items-center gap-3">
      <LanguageSwitcher />
      <a href="https://app.certif-id.com/" className="font-medium text-[#2E2A3D] hover:text-[#5B22D6] transition-colors" data-testid="nav-signin" rel="noopener noreferrer">
        {t('common.signIn')}
      </a>
      <a href="https://app.certif-id.com/sign-up" className="font-medium text-[#2E2A3D] hover:text-[#5B22D6] transition-colors" data-testid="nav-signup" rel="noopener noreferrer">
        {t('common.signUp', 'Sign Up')}
      </a>
      <Button onClick={onDemoClick} className="cs-btn cs-btn-gradient !rounded-full !px-6 !text-white !font-semibold transition-all duration-300" data-testid="nav-demo-btn">
        {t('hero.cta.secondary')}
      </Button>
    </div>
  );
};

HeaderActions.propTypes = {
  currentLang: PropTypes.string.isRequired,
  onDemoClick: PropTypes.func.isRequired,
};
