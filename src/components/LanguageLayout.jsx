"use client";
/**
 * LanguageLayout - Wraps all page content under /:lang prefix.
 * Reads the language from the URL, syncs with i18n, and renders child routes.
 */
import React, { useEffect } from 'react';
import { Outlet, Navigate, useParams, useLocation } from '@/lib/router-shim';
import { useTranslations as useTranslation } from 'next-intl';
import { SUPPORTED_LANGS, DEFAULT_LANG } from '@/utils/localePath';

const LANG_KEY = 'credsure-lang';

// i18next-browser-languagedetector sometimes stores the raw navigator.language
// (e.g. "en-US@posix" in C-locale environments like Googlebot / PSI);
// normalize it down to one of our SUPPORTED_LANGS.
const normalizeLang = (raw) => {
  if (!raw) return DEFAULT_LANG;
  const base = String(raw).toLowerCase().split(/[-_@.]/)[0];
  return SUPPORTED_LANGS.includes(base) ? base : DEFAULT_LANG;
};

// Locale-shaped first URL segment: starts with 2 letters, optionally
// followed by region/script/modifier separated by -, _, @, or .
// Matches: en-US, pt-BR, en_US.UTF-8, en-US@posix, zh-Hant-CN.
// Does NOT match real route slugs: policies, demo, pricing, blog.
const LOCALE_TAG_RE = /^[a-z]{2}([-_.@][a-z0-9_]+)*$/i;

export const LanguageLayout = () => {
  const { lang } = useParams();
  const { i18n } = useTranslation();
  const location = useLocation();
  const isSupported = SUPPORTED_LANGS.includes(lang);

  // useEffect MUST be called unconditionally (rules-of-hooks). When the
  // lang segment is unsupported we no-op here and rely on the synchronous
  // <Navigate> below to redirect before <Outlet/> ever mounts.
  useEffect(() => {
    if (!isSupported) return;
    if (i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) { console.error('localStorage unavailable:', e.message); }
    try { sessionStorage.setItem(LANG_KEY, lang); } catch (e) { console.error('sessionStorage unavailable:', e.message); }
    document.documentElement.lang = lang;
  }, [lang, i18n, isSupported]);

  // Synchronous redirect for unsupported lang prefixes. This MUST run before
  // <Outlet/> so we never render the 404 page (with broken canonical +
  // noindex) for crawlers hitting URLs like /en-US@posix/.
  if (!isSupported) {
    let preferred;
    try { preferred = localStorage.getItem(LANG_KEY); } catch { /* SSR / private mode */ }
    preferred = normalizeLang(preferred);

    const isLocaleTag = LOCALE_TAG_RE.test(lang || '');
    let restPath;
    if (isLocaleTag) {
      // Strip the locale-shaped first segment, keep whatever was after it.
      const tail = location.pathname.split('/').slice(2).join('/');
      restPath = tail ? `/${tail}` : '';
    } else {
      // Real lang-less URL (e.g. /policies/terms) — preserve the full path.
      restPath = location.pathname;
    }
    return <Navigate to={`/${preferred}${restPath}${location.search}${location.hash}`} replace />;
  }

  return <Outlet />;
};
