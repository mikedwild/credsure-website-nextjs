"use client";
import React from 'react';
import PropTypes from 'prop-types';

export const MegaMenuItem = ({ item, isFocused, onMouseEnter, onClick }) => {
  const IconComponent = item.icon;
  return (
    <a
      href={item.href}
      onClick={(e) => {
        e.preventDefault();
        onClick(item.href);
      }}
      onMouseEnter={onMouseEnter}
      className={`flex items-start gap-3 p-3 rounded-lg transition-all duration-200 group cursor-pointer ${
        isFocused
          ? 'bg-purple-100 ring-2 ring-brand-purple ring-offset-1 scale-105'
          : 'hover:bg-purple-50'
      }`}
      role="menuitem"
      tabIndex={isFocused ? 0 : -1}
      data-testid={`mega-menu-item-${item.href}`}
    >
      <IconComponent
        className={`w-5 h-5 flex-shrink-0 mt-0.5 transition-colors ${
          isFocused ? 'text-brand-purple' : 'text-brand-purple-light'
        }`}
      />
      <div>
        <div
          className={`font-semibold text-sm transition-colors ${
            isFocused ? 'text-brand-purple' : 'text-slate-900 group-hover:text-brand-purple'
          }`}
        >
          {item.label}
        </div>
        <div className="text-xs text-slate-500 mt-0.5">{item.description}</div>
      </div>
    </a>
  );
};

MegaMenuItem.propTypes = {
  item: PropTypes.shape({
    label: PropTypes.string.isRequired,
    to: PropTypes.string.isRequired,
    icon: PropTypes.elementType,
    description: PropTypes.string,
  }).isRequired,
  isFocused: PropTypes.bool,
  onMouseEnter: PropTypes.func,
  onClick: PropTypes.func,
};
