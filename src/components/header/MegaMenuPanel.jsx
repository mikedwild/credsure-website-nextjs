"use client";
import React from 'react';
import PropTypes from 'prop-types';
import { ArrowRight } from 'lucide-react';
import { MegaMenuItem } from './MegaMenuItem';

export const MegaMenuPanel = ({
  menuData,
  focusedItemIndex,
  onFocusItem,
  onLinkClick,
  megaMenuRef,
  width = '800px',
  cols = 4,
  ariaLabel,
}) => {
  return (
    <div
      ref={megaMenuRef}
      className={`fixed left-1/2 -translate-x-1/2 bg-white  rounded-2xl shadow-2xl border border-slate-200  p-8 animate-in fade-in slide-in-from-top-4 duration-200 z-50`}
      style={{ top: '82px', width }}
      role="menu"
      aria-label={ariaLabel}
      data-testid={`mega-menu-panel-${ariaLabel}`}
    >
      <div className={`grid gap-6`} style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {menuData.sections.map((section) => (
          <div key={section.title}>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => {
                const globalIndex = getGlobalIndex(menuData.sections, section, item);
                return (
                  <MegaMenuItem
                    key={item.href}
                    item={item}
                    isFocused={focusedItemIndex === globalIndex}
                    onMouseEnter={() => onFocusItem(globalIndex)}
                    onClick={onLinkClick}
                  />
                );
              })}
            </div>
          </div>
        ))}

        {/* Featured Section
            Was: <div class="text-2xl"> rendering an emoji + plain text,
            which inherited the parent's black text color → failed WCAG
            contrast against the purple→pink gradient. Now: lucide icon +
            uppercase "pill" badge in translucent white, properly readable
            on the gradient and consistent with SaaS featured-card convention. */}
        {menuData.featured && (
          <div className="brand-gradient-blue rounded-xl p-6 border border-purple-200">
            {(() => {
              // Render the badge: icon prop is the lucide component (Sparkles/Star/BookOpen).
              const FeaturedIcon = menuData.featured.icon;
              return (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-sm mb-4">
                  {FeaturedIcon && <FeaturedIcon className="w-3.5 h-3.5 text-white shrink-0" strokeWidth={2.5} />}
                  <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-white whitespace-nowrap">
                    {menuData.featured.title}
                  </span>
                </div>
              );
            })()}
            <h4 className="font-bold text-white mb-2 text-lg leading-tight">{menuData.featured.subtitle}</h4>
            <p className="text-sm text-white/90 mb-4">{menuData.featured.description}</p>
            <a
              href={menuData.featured.href}
              onClick={(e) => {
                e.preventDefault();
                onLinkClick(menuData.featured.href);
              }}
              className="inline-flex items-center text-white hover:text-white/90 font-semibold text-sm group cursor-pointer"
            >
              {menuData.featured.cta}
              <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

function getGlobalIndex(sections, currentSection, currentItem) {
  let index = 0;
  for (const section of sections) {
    if (section === currentSection) {
      return index + section.items.indexOf(currentItem);
    }
    index += section.items.length;
  }
  return -1;
}

MegaMenuPanel.propTypes = {
  menuData: PropTypes.shape({
    sections: PropTypes.arrayOf(PropTypes.shape({
      title: PropTypes.string,
      items: PropTypes.array.isRequired,
    })).isRequired,
  }).isRequired,
  focusedItemIndex: PropTypes.number,
  onFocusItem: PropTypes.func,
  onLinkClick: PropTypes.func,
  megaMenuRef: PropTypes.object,
};
