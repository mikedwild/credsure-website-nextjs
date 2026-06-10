"use client";
import React from 'react';
import { useLocale } from 'next-intl';
import { LocalizedLink as Link } from '@/components/LocalizedLink';
import { useTranslation } from '@/lib/useTranslation';

export const Footer = () => {
  const t = useTranslation();
  const locale = useLocale();
  const currentYear = new Date().getFullYear();

  // heyData GDPR privacy seal for Certif-ID International GmbH (shared with talentsure.de)
  const heyDataSealUrl =
    `https://api.heydata.eu/privacy-seal/seal/32205f8d-5344-43d5-8f54-2abd4100da7d` +
    `?lang=${locale}&design=design1&sealType=GDPR`;

  const productLinks = [
    { label: t('footer.links.features'), to: '/features' },
    { label: t('footer.links.pricing'), to: '/pricing' },
    { label: t('footer.links.integrations'), to: '/integrations' },
    { label: t('footer.links.apiIntegration', 'API Integration'), to: '/features/api-integration' },
    { label: t('footer.links.templates'), to: '/features/template-designer' },
    { label: t('footer.links.digitalCertificates', 'Digital Certificates'), to: '/features/digital-certificates' },
    { label: t('footer.links.digitalBadges', 'Digital Badges'), to: '/digital-badges' }
  ];

  const companyLinks = [
    { label: t('footer.links.about'), to: '/about' },
    { label: t('footer.links.blog'), to: '/blog' },
    { label: t('footer.links.customerStories'), to: '/customer-success' },
    { label: t('nav.contact'), to: '/contact' }
  ];

  const resourcesLinks = [
    { label: t('footer.links.helpCenter'), to: 'https://credsure.helpsite.com/', external: true },
    { label: t('footer.links.guides', 'Guides & Insights'), to: '/guides' },
    { label: t('footer.links.webinars', 'Webinars'), to: '/webinars' },
    { label: t('footer.links.caseStudies'), to: '/customer-success' }
  ];

  const legalLinks = [
    { label: t('footer.links.privacy'), to: '/privacy' },
    { label: t('footer.links.terms'), to: '/policies/terms' },
    { label: t('footer.links.impressum'), to: '/impressum' },
    { label: t('footer.links.security'), to: '/security' },
    { label: t('footer.links.gdpr'), to: '/gdpr' }
  ];

  return (
    <footer id="footer" className="cs-footer-bg text-[rgba(248,245,240,0.7)]" role="contentinfo">
      {/* Main footer */}
      <div className="container mx-auto px-6 sm:px-8 lg:px-12 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <div className="flex items-center">
              <img 
                src="/credsure-logo-main.webp" 
                alt="CredSure" 
                width="640"
                height="360"
                className="h-10 w-auto brightness-0 invert mb-4"
                loading="lazy"
              />
            </div>
            <p className="text-[rgba(248,245,240,0.65)] mb-6 leading-relaxed font-body">
              {t('footer.description')}
            </p>
            
            {/* Social links */}
            <div className="flex gap-3" data-testid="footer-social-links">
              {[
                { icon: () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>, href: 'https://www.linkedin.com/showcase/credsureverified/', label: 'LinkedIn' },
                { icon: () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>, href: 'https://x.com/Cred_Sure', label: 'X' },
                { icon: () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>, href: 'https://www.facebook.com/credsureverified', label: 'Facebook' },
                { icon: () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>, href: 'https://www.youtube.com/@CredSure', label: 'YouTube' }
              ].map((social) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="cs-footer-social w-10 h-10 rounded-lg flex items-center justify-center text-[rgba(248,245,240,0.85)]"
                  >
                    <IconComponent className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Product links */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('footer.product', t('footer.platform'))}</h3>
            <ul className="space-y-3">
              {productLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="cs-footer-link inline-block py-1.5"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('footer.company')}</h3>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="cs-footer-link inline-block py-1.5"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources links */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('footer.resources')}</h3>
            <ul className="space-y-3">
              {resourcesLinks.map((link) => (
                <li key={link.to}>
                  {link.external ? (
                    <a
                      href={link.to}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cs-footer-link inline-block py-1.5"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      to={link.to}
                      className="cs-footer-link inline-block py-1.5"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
            {/* Compare sub-section */}
            <h4 className="text-white font-semibold mt-6 mb-3">{t('footer.compare', 'Compare')}</h4>
            <ul className="space-y-3">
              <li><Link to="/compare/accredible" className="cs-footer-link inline-block py-1.5">CredSure vs Accredible</Link></li>
              <li><Link to="/compare/credly" className="cs-footer-link inline-block py-1.5">CredSure vs Credly</Link></li>
            </ul>
          </div>

          {/* Contact info - Removed per user request */}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t cs-footer-divider">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12 py-6 pb-20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright & Trust Badges */}
            <div className="flex flex-col md:flex-row items-center gap-4">
              <p className="text-sm text-[rgba(248,245,240,0.6)]">
                &copy; {currentYear} CredSure. {t('footer.copyright')}
              </p>
              
              {/* Vanta Trust Badge */}
              <a 
                href="https://app.vanta.com/certifid/trust/kxnl6hbd4n0x6uotrj300" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-full transition-colors"
              >
                <img
                  src="/images/badges/gdpr-light.svg"
                  alt="Vanta Secure"
                  width="80"
                  height="28"
                  className="h-7 w-auto"
                  loading="lazy"
                  decoding="async"
                />
                <span className="text-xs text-[rgba(248,245,240,0.85)]">{t('footer.securityVerified')}</span>
              </a>

              {/* heyData privacy seal */}
              <a
                href="https://heydata.eu/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="heyData privacy seal"
                className="hover:opacity-80 transition-opacity"
              >
                <img
                  src={heyDataSealUrl}
                  alt="heyData GDPR privacy seal"
                  width="406"
                  height="226"
                  className="h-16 w-auto"
                  style={{ border: 0 }}
                  loading="lazy"
                  decoding="async"
                />
              </a>
            </div>

            {/* Legal links */}
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
              {legalLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="cs-footer-link inline-block py-1.5"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
