/**
 * Chadani Cosmetic — Currency Utility
 * Prices in DB are stored in Nepalese Rupees (NPR).
 * Display format: Rs. 1,250
 */

export const CURRENCY_SYMBOL = 'Rs.';
export const CURRENCY_CODE = 'NPR';

/**
 * Format a price in NPR.
 * formatPrice(1250)   → "Rs. 1,250"
 * formatPrice(1250.5) → "Rs. 1,251" (rounded)
 * formatPrice(null)   → "N/A"
 */
export function formatPrice(price) {
  if (price == null || Number.isNaN(Number(price))) return 'N/A';
  const amount = Math.round(Number(price));
  return `${CURRENCY_SYMBOL} ${amount.toLocaleString('en-NP')}`;
}

/** Alias kept for backward compatibility */
export const formatNpr = formatPrice;
export const toNprAmount = (p) => Number(p);
