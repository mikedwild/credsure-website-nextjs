"use client";
import React from 'react';
import { useNavigate, useParams, useLocation } from '@/lib/router-shim';
import { useTranslations as useTranslation } from 'next-intl';
import { Globe } from 'lucide-react';
import { localePath } from '@/utils/localePath';

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const { lang } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const currentLang = lang || i18n.language || 'en';
  const otherLang = currentLang === 'en' ? 'de' : 'en';
  const otherLabel = otherLang === 'en' ? 'English' : 'Deutsch';

  const toggleLanguage = () => {
    // Get current path without the /:lang prefix
    const currentPath = location.pathname;
    const slug = currentPath.replace(/^\/(en|de)\/?/, '/') || '/';
    const newPath = localePath(slug, otherLang);
    i18n.changeLanguage(otherLang);
    localStorage.setItem('credsure-lang', otherLang);
    navigate(newPath);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 :bg-slate-700 transition-colors"
      aria-label={`Switch to ${otherLabel}`}
      title={`Switch to ${otherLabel}`}
      data-testid="language-switcher"
    >
      <Globe className="w-4 h-4 text-gray-600 " />
      <span className="text-sm font-medium text-gray-700 ">
        {currentLang === 'en' ? '🇬🇧' : '🇩🇪'}
      </span>
      <span className="text-xs text-gray-500 ">{currentLang.toUpperCase()}</span>
    </button>
  );
};
