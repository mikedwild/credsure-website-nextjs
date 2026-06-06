"use client";
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { LocalizedLink as Link } from '../LocalizedLink';
import { useTranslation } from '@/lib/useTranslation';
import { Button } from '../ui/button';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { useMegaMenuData } from './useMegaMenuData';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../ui/accordion';
import { DollarSign, Calculator, X } from 'lucide-react';

export const MobileNav = ({ currentLang, onLinkClick, onClose, onDemoClick }) => {
  const t = useTranslation();
  const { megaMenus } = useMegaMenuData();

  // Lock body scroll when mobile nav is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const sections = [
    { key: 'platform', labelKey: 'nav.platform', menu: megaMenus.platform },
    { key: 'solutions', labelKey: 'nav.solutions', menu: megaMenus.solutions },
    { key: 'resources', labelKey: 'nav.resources', fallback: 'Resources', menu: megaMenus.resources },
  ];

  const standaloneLinks = [
    { labelKey: 'nav.pricing', href: '/pricing', icon: DollarSign },
  ];

  return (
    <div className="fixed inset-0 z-40 xl:hidden" style={{ top: '80px' }} data-testid="mobile-nav" role="dialog" aria-modal="true" aria-label="Navigation menu">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="relative bg-white  h-full overflow-y-auto pb-20 overscroll-contain shadow-xl">
        <div className="container mx-auto px-5 py-5 space-y-4">
          {/* Header row with close button */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 ">
            <span className="text-base font-semibold text-slate-900  tracking-tight">Menu</span>
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <button
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 :bg-slate-800 transition-colors"
                aria-label="Close menu"
                data-testid="mobile-nav-close"
              >
                <X className="w-5 h-5 text-slate-600 " />
              </button>
            </div>
          </div>

          {/* Accordion sections mirroring mega menu */}
          <Accordion type="single" collapsible className="w-full">
            {sections.map(({ key, labelKey, fallback, menu }) => (
              <AccordionItem key={key} value={key} className="border-b border-slate-100 ">
                <AccordionTrigger
                  className="py-3.5 text-[15px] font-semibold text-slate-800  hover:no-underline hover:text-brand-purple transition-colors"
                  data-testid={`mobile-nav-${key}-trigger`}
                >
                  {t(labelKey, fallback || '')}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-1 pb-1">
                    {menu.sections.map((section) => (
                      <div key={section.title} className="mb-3">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400  px-2 mb-1.5">
                          {section.title}
                        </p>
                        {section.items.map((item) => {
                          const Icon = item.icon;
                          return (
                            <a
                              key={item.href}
                              href={`/${currentLang}${item.href}`}
                              onClick={(e) => { e.preventDefault(); onLinkClick(item.href); }}
                              className="flex items-center gap-3 px-2 py-2.5 min-h-[44px] rounded-lg hover:bg-slate-50 :bg-slate-800/60 transition-colors group"
                              data-testid={`mobile-nav-item-${item.href.replace(/\//g, '-').slice(1)}`}
                            >
                              {Icon && (
                                <span className="flex-shrink-0 w-7 h-7 rounded-md bg-slate-100  flex items-center justify-center group-hover:bg-brand-purple/10 transition-colors">
                                  <Icon className="w-3.5 h-3.5 text-slate-500  group-hover:text-brand-purple transition-colors" />
                                </span>
                              )}
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-slate-700  group-hover:text-brand-purple transition-colors truncate">
                                  {item.label}
                                </p>
                                {item.description && (
                                  <p className="text-[11px] text-slate-400  truncate leading-tight mt-0.5">
                                    {item.description}
                                  </p>
                                )}
                              </div>
                            </a>
                          );
                        })}
                      </div>
                    ))}
                    {/* Featured CTA for each section
                        Renders the same featured object as the desktop
                        MegaMenuPanel. Mobile background is light, so we
                        keep the brand-purple text color, but we also
                        render the lucide icon (was an emoji in the
                        locale string until 2026-05-19). */}
                    {menu.featured && (
                      <a
                        href={`/${currentLang}${menu.featured.href}`}
                        onClick={(e) => { e.preventDefault(); onLinkClick(menu.featured.href); }}
                        className="block mx-2 mt-2 p-3 rounded-xl bg-gradient-to-r from-[#5B22D6]/5 to-[#3F2BD9]/5 border border-[#5B22D6]/10 hover:border-[#5B22D6]/30 transition-colors"
                        data-testid={`mobile-nav-${key}-featured`}
                      >
                        <p className="text-xs font-semibold text-brand-purple inline-flex items-center gap-1.5">
                          {menu.featured.icon && <menu.featured.icon className="w-3.5 h-3.5" strokeWidth={2.5} />}
                          {menu.featured.title}
                        </p>
                        <p className="text-[11px] text-slate-500  mt-0.5">{menu.featured.description}</p>
                      </a>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* Standalone links */}
          <nav className="space-y-1 pt-1">
            {standaloneLinks.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.href}
                  href={`/${currentLang}${link.href}`}
                  onClick={(e) => { e.preventDefault(); onLinkClick(link.href); }}
                  className="flex items-center gap-3 py-3.5 min-h-[44px] px-2 text-slate-700  hover:text-brand-purple font-medium transition-colors rounded-lg hover:bg-slate-50 :bg-slate-800/60"
                  data-testid={`mobile-nav-${link.href.slice(1)}`}
                >
                  {Icon && <Icon className="w-4 h-4 text-slate-400" />}
                  {t(link.labelKey, link.fallback || '')}
                </a>
              );
            })}

            {/* ROI Calculator - highlighted */}
            <a
              href={`/${currentLang}/roi-calculator`}
              onClick={(e) => { e.preventDefault(); onLinkClick('/roi-calculator'); }}
              className="flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-[#5B22D6] to-[#3F2BD9] text-white font-semibold rounded-xl hover:opacity-90 transition-opacity text-sm"
              data-testid="mobile-nav-roi"
            >
              <Calculator className="w-4 h-4" />
              {t('calculateRoi')}
            </a>
          </nav>

          {/* Auth actions */}
          <div className="pt-4 space-y-3 border-t border-slate-200 ">
            <a
              href="https://app.certif-id.com/"
              className="block w-full py-3 px-6 text-center font-medium text-slate-700  hover:text-brand-purple border border-slate-200  rounded-xl transition-colors"
              data-testid="mobile-nav-signin"
              rel="noopener noreferrer"
            >
              {t('common.signIn')}
            </a>
            <a
              href="https://app.certif-id.com/sign-up"
              className="block w-full py-3 px-6 text-center font-medium text-slate-700  hover:text-brand-purple border border-slate-200  rounded-xl transition-colors"
              data-testid="mobile-nav-signup"
              rel="noopener noreferrer"
            >
              {t('common.signUp', 'Sign Up')}
            </a>
            <Button
              onClick={onDemoClick}
              className="w-full brand-gradient text-white py-3 px-6 rounded-xl font-medium shadow-md"
              data-testid="mobile-nav-demo-btn"
            >
              {t('hero.cta.secondary')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

MobileNav.propTypes = {
  currentLang: PropTypes.string.isRequired,
  onLinkClick: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onDemoClick: PropTypes.func.isRequired,
};
