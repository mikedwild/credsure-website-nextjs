"use client";
/**
 * PillarTabs — horizontal tab strip with bottom-border-on-active styling.
 *
 * Reuses the `cs-pillar-tab` utility from beamery-system.css so visuals
 * stay in lock-step with BeameryPlatform.
 *
 *   <PillarTabs
 *     tabs={[{ key:'issue', label:'Issue', icon: Award }, ...]}
 *     activeKey={key}
 *     onChange={setKey}
 *     testIdPrefix="feature-tab"
 *   />
 */
import React from 'react';

export const PillarTabs = ({ tabs, activeKey, onChange, testIdPrefix = 'pillar-tab', className = '' }) => (
  <div
    className={`flex flex-wrap gap-1 border-b border-[#ECE7F1] ${className}`}
    role="tablist"
    data-testid={`${testIdPrefix}-list`}
  >
    {tabs.map(tab => {
      const Icon = tab.icon;
      const isActive = tab.key === activeKey;
      return (
        <button
          key={tab.key}
          type="button"
          role="tab"
          aria-selected={isActive}
          data-active={isActive}
          data-testid={`${testIdPrefix}-${tab.key}`}
          onClick={() => onChange(tab.key)}
          className="cs-pillar-tab"
        >
          {Icon && <Icon className="w-4 h-4" />} {tab.label}
        </button>
      );
    })}
  </div>
);

export default PillarTabs;
