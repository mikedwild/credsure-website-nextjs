"use client";
/**
 * LocalizedLink - Drop-in replacement for React Router's <Link>.
 * Automatically prefixes the `to` path with the current language.
 * 
 * Usage: <LocalizedLink to="/pricing">Pricing</LocalizedLink>
 *        renders as: <Link to="/en/pricing"> or <Link to="/de/preise">
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Link, useParams } from '@/lib/router-shim';
import { localePath } from '@/utils/localePath';

export const LocalizedLink = React.forwardRef(({ to, children, ...props }, ref) => {
  const { lang } = useParams();
  const currentLang = lang || 'en';

  // If `to` is already language-prefixed, use as-is
  if (typeof to === 'string' && (to.startsWith('/en/') || to.startsWith('/de/') || to === '/en' || to === '/de')) {
    return <Link ref={ref} to={to} {...props}>{children}</Link>;
  }

  // Translate the path to the current language
  const localizedTo = typeof to === 'string' ? localePath(to, currentLang) : to;

  return <Link ref={ref} to={localizedTo} {...props}>{children}</Link>;
});

LocalizedLink.displayName = 'LocalizedLink';

LocalizedLink.propTypes = {
  to: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};
