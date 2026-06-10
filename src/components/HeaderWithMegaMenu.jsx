"use client";
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useNavigate, useLocation, useParams } from '@/lib/router-shim';
import { Menu, X } from 'lucide-react';
import { useMegaMenuData } from './header/useMegaMenuData';
import { DesktopNav } from './header/DesktopNav';
import { HeaderActions } from './header/HeaderActions';
import { MobileNav } from './header/MobileNav';

export const HeaderWithMegaMenu = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { lang } = useParams();
  const currentLang = lang || 'en';
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState(null);
  const [focusedItemIndex, setFocusedItemIndex] = useState(-1);
  const menuTimeoutRef = useRef(null);
  const megaMenuRef = useRef(null);
  const megaMenusRef = useRef(null);
  const handleLinkClickRef = useRef(null);

  const { megaMenus, navItems } = useMegaMenuData();
  megaMenusRef.current = megaMenus;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    // `passive: true` lets the browser scroll without waiting for this
    // handler to finish — every passive listener counted as a TBT win
    // on the desktop PageSpeed audit.
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard navigation for mega menu
  useEffect(() => {
    if (!activeMegaMenu) return;
    const handleKeyDown = (e) => {
      const currentMenu = megaMenusRef.current?.[activeMegaMenu];
      if (!currentMenu) return;
      const allItems = currentMenu.sections.flatMap(s => s.items);
      const totalItems = allItems.length;

      switch (e.key) {
        case 'Escape':
          setActiveMegaMenu(null);
          setFocusedItemIndex(-1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          setFocusedItemIndex(prev => (prev + 1) % totalItems);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedItemIndex(prev => (prev - 1 + totalItems) % totalItems);
          break;
        case 'Enter':
          if (focusedItemIndex >= 0) {
            e.preventDefault();
            const item = allItems[focusedItemIndex];
            if (item?.href) handleLinkClickRef.current?.(item.href);
          }
          break;
        default:
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeMegaMenu, focusedItemIndex]);

  const handleMouseEnter = (menuName) => {
    if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current);
    setActiveMegaMenu(menuName);
    setFocusedItemIndex(-1);
  };

  const handleMouseLeave = () => {
    menuTimeoutRef.current = setTimeout(() => {
      setActiveMegaMenu(null);
      setFocusedItemIndex(-1);
    }, 150);
  };

  const handleLinkClick = (href) => {
    setActiveMegaMenu(null);
    setIsMobileMenuOpen(false);
    if (href.startsWith('http')) { window.open(href, '_blank'); return; }
    if (href.startsWith('/')) {
      const langPrefix = `/${currentLang}`;
      navigate(href.startsWith(langPrefix) ? href : `${langPrefix}${href}`);
      return;
    }
    if (href.startsWith('#')) {
      if (location.pathname !== `/${currentLang}` && location.pathname !== `/${currentLang}/`) {
        navigate(`/${currentLang}`);
        setTimeout(() => document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
      } else {
        document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };
  handleLinkClickRef.current = handleLinkClick;

  return (
    <>
      <header
        id="navigation"
        className={`fixed top-0 left-0 right-0 z-50 cs-header transition-colors duration-300 ${isScrolled ? 'cs-header-scrolled' : 'border-b border-[#ECE7F1]'}`}
        role="banner"
        aria-label="Main navigation"
        data-testid="main-header"
      >
        <div className="container mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div
              className="flex items-center cursor-pointer group"
              onClick={() => {
                navigate(`/${currentLang}`);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              data-testid="header-logo"
            >
              <Image
                src="/credsure-logo-main.webp"
                alt="CredSure"
                width={640}
                height={360}
                priority
                sizes="200px"
                className="h-16 md:h-20 lg:h-24 w-auto group-hover:scale-105 transition-transform"
              />
            </div>

            <DesktopNav
              navItems={navItems}
              activeMegaMenu={activeMegaMenu}
              focusedItemIndex={focusedItemIndex}
              megaMenuRef={megaMenuRef}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onFocusItem={setFocusedItemIndex}
              onLinkClick={handleLinkClick}
            />

            <HeaderActions
              currentLang={currentLang}
              onDemoClick={() => navigate(`/${currentLang}/demo`)}
            />

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="xl:hidden p-2 hover:bg-slate-100 :bg-slate-800 rounded-lg transition-colors"
              aria-label="Toggle Menu"
              data-testid="mobile-menu-toggle"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-slate-700 " />
              ) : (
                <Menu className="w-6 h-6 text-slate-700 " />
              )}
            </button>
          </div>
        </div>
      </header>

      {isMobileMenuOpen && (
        <MobileNav
          currentLang={currentLang}
          onLinkClick={handleLinkClick}
          onClose={() => setIsMobileMenuOpen(false)}
          onDemoClick={() => {
            setIsMobileMenuOpen(false);
            navigate(`/${currentLang}/demo`);
          }}
        />
      )}
    </>
  );
};
