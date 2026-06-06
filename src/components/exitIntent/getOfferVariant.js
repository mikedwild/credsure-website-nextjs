/**
 * Selects the exit-intent offer variant based on the current pathname.
 * Falls back to 'roi-calculator' for unmatched paths.
 *
 * @param {string} pathname - The current location pathname (e.g., "/en/blog/foo")
 * @returns {'roi-calculator' | 'pdf-guide' | 'demo-incentive'}
 */
export const getOfferVariant = (pathname = '/') => {
  // Strip language prefix (/en or /de)
  const cleaned = pathname.toLowerCase().replace(/^\/(en|de)/, '') || '/';

  // Variant B: PDF Guide for content/learning paths
  if (/^\/(blog|resources|guides|webinars|customer-success)(\/|$)/.test(cleaned)) {
    return 'pdf-guide';
  }

  // Variant C: Demo Incentive for conversion-intent paths
  if (/^\/(demo|contact|integrations|security)(\/|$)/.test(cleaned)) {
    return 'demo-incentive';
  }

  // Variant A: Default ROI Calculator (homepage, /pricing, /platform, /solutions, etc.)
  return 'roi-calculator';
};
