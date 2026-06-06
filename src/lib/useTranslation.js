"use client";
/**
 * useTranslation — compatibility wrapper around next-intl's useTranslations.
 *
 * The codebase was migrated from react-i18next, whose `t()` supports an inline
 * default value as the 2nd argument: `t('hero.eyebrow', 'NEW · ...')`. next-intl
 * treats the 2nd argument as interpolation values, NOT a default, so missing
 * keys render the key's last segment ("eyebrow") instead of the intended copy.
 *
 * This wrapper restores react-i18next semantics:
 *   t('key')                                          → translation, or ''
 *   t('key', 'Default text')                          → translation, or default
 *   t('key', { returnObjects: true })                 → array/object, or []
 *   t('key', { returnObjects: true, defaultValue })   → array/object, or default
 *   t('key', { name: 'x' })                           → interpolated translation
 *
 * Components import this as:
 *   import { useTranslations as useTranslation } from '@/lib/useTranslation';
 */
import { useTranslations as useNextIntlTranslations } from "next-intl";

export function useTranslation() {
  const t = useNextIntlTranslations();

  const wrapped = (key, second, third) => {
    const opts =
      second !== null && typeof second === "object" ? second : undefined;
    const inlineDefault = typeof second === "string" ? second : undefined;
    const def = inlineDefault ?? (opts ? opts.defaultValue : undefined);

    const exists = safeHas(t, key);

    // Array / object lookups (react-i18next returnObjects)
    if (opts && opts.returnObjects) {
      if (!exists) return def !== undefined ? def : [];
      try {
        return t.raw(key);
      } catch {
        return def !== undefined ? def : [];
      }
    }

    // Plain string lookups
    if (!exists) return def !== undefined ? def : "";

    // Pass interpolation values only when they aren't our options bag
    const values =
      opts && !("returnObjects" in opts) && !("defaultValue" in opts)
        ? opts
        : typeof third === "object" && third !== null
        ? third
        : undefined;
    try {
      return t(key, values);
    } catch {
      return def !== undefined ? def : "";
    }
  };

  wrapped.has = (k) => safeHas(t, k);
  wrapped.raw = (k) => {
    try {
      return t.raw(k);
    } catch {
      return undefined;
    }
  };
  wrapped.rich = (...args) => t.rich(...args);
  return wrapped;
}

function safeHas(t, key) {
  try {
    return t.has(key);
  } catch {
    return false;
  }
}
