"use client";
import React from 'react';
import PropTypes from 'prop-types';
import { LocalizedLink as Link } from '../LocalizedLink';
import { useTranslations as useTranslation } from 'next-intl';
import { MegaMenuPanel } from './MegaMenuPanel';
import { ResourcesMegaPanel } from './ResourcesMegaPanel';

export const DesktopNav = ({ navItems, activeMegaMenu, focusedItemIndex, megaMenuRef, onMouseEnter, onMouseLeave, onFocusItem, onLinkClick }) => {
  const t = useTranslation();

  return (
    <nav className="hidden xl:flex items-center gap-1" data-testid="desktop-nav">
      {navItems.map(({ key, labelKey, menuData, width, cols }) => (
        <div
          key={key}
          className="relative"
          onMouseEnter={() => onMouseEnter(key)}
          onMouseLeave={onMouseLeave}
        >
          <button className="px-4 py-2 text-slate-700 hover:text-brand-purple font-medium transition-colors rounded-lg hover:bg-slate-50" data-testid={`nav-${key}-trigger`}>
            {t(labelKey)}
          </button>
          {activeMegaMenu === key && (
            <MegaMenuPanel
              menuData={menuData}
              focusedItemIndex={focusedItemIndex}
              onFocusItem={onFocusItem}
              onLinkClick={onLinkClick}
              megaMenuRef={megaMenuRef}
              width={width}
              cols={cols}
              ariaLabel={`${key} menu`}
            />
          )}
        </div>
      ))}

      <Link to="/pricing" className="px-4 py-2 text-slate-700 hover:text-brand-purple font-medium transition-colors rounded-lg hover:bg-slate-50 cursor-pointer" data-testid="nav-pricing">
        {t('nav.pricing')}
      </Link>

      <Link to="/roi-calculator" className="px-4 py-2 text-brand-purple hover:text-[#3F2BD9] font-semibold transition-colors rounded-lg hover:bg-purple-50 cursor-pointer border border-purple-200" data-testid="nav-roi">
        {t('calculateRoi')}
      </Link>

      <div
        className="relative"
        onMouseEnter={() => onMouseEnter('resources')}
        onMouseLeave={onMouseLeave}
      >
        <button className="px-4 py-2 text-slate-700 hover:text-brand-purple font-medium transition-colors rounded-lg hover:bg-slate-50" data-testid="nav-resources-trigger">
          {t('nav.resources')}
        </button>
        {activeMegaMenu === 'resources' && (
          <ResourcesMegaPanel
            onLinkClick={onLinkClick}
            megaMenuRef={megaMenuRef}
          />
        )}
      </div>
    </nav>
  );
};

DesktopNav.propTypes = {
  navItems: PropTypes.array.isRequired,
  activeMegaMenu: PropTypes.string,
  focusedItemIndex: PropTypes.number.isRequired,
  megaMenuRef: PropTypes.object.isRequired,
  onMouseEnter: PropTypes.func.isRequired,
  onMouseLeave: PropTypes.func.isRequired,
  onFocusItem: PropTypes.func.isRequired,
  onLinkClick: PropTypes.func.isRequired,
};
