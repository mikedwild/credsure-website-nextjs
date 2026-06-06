"use client";
/**
 * ProductUIWindow — transparent passthrough wrapper for hero imagery.
 *
 * Originally rendered a Mac-window chrome strip (three dots + URL bar)
 * with a rounded white card + shadow. Both treatments were dropped per
 * design direction:
 *   1. The chrome strip read as visual noise.
 *   2. Hero images have been re-exported with proper alpha channels, so
 *      they float on the page gradient cleanly without needing a card.
 *
 * Kept as a wrapper (rather than ripped out everywhere it's used) so
 * `minHeight` keeps reserving consistent vertical space across pages —
 * eliminates CLS while images load. `url` is retained for API stability
 * but intentionally unused.
 */
import React from 'react';

// eslint-disable-next-line no-unused-vars
export const ProductUIWindow = ({ url, children, minHeight = 420, className = '' }) => (
  <div
    className={className}
    style={{ minHeight }}
    data-testid="product-ui-window"
  >
    {children}
  </div>
);

export default ProductUIWindow;
