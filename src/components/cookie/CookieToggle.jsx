"use client";
import React from 'react';
import PropTypes from 'prop-types';

export const CookieToggle = ({ enabled, color, onChange, testId }) => (
  <button onClick={onChange} className="ml-4 flex-shrink-0" data-testid={testId}>
    <div className={`w-14 h-8 rounded-full transition-all duration-300 ${enabled ? color : 'bg-slate-300 '}`}>
      <div className={`w-6 h-6 bg-white rounded-full mt-1 transition-transform duration-300 shadow-md ${enabled ? 'ml-7' : 'ml-1'}`} />
    </div>
  </button>
);

CookieToggle.propTypes = {
  enabled: PropTypes.bool.isRequired,
  color: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  testId: PropTypes.string,
};
