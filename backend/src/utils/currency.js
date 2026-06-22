/**
 * Chadani Cosmetic — Currency Utility (Backend)
 * Prices in DB are stored in Nepalese Rupees (NPR).
 * Display format: Rs. 1,250
 */

const NPR_SYMBOL = 'Rs.';

/**
 * Format a price in NPR for use in emails and server responses.
 * formatNpr(1250)   → "Rs. 1,250"
 * formatNpr(null)   → "N/A"
 */
function formatNpr(amount) {
  if (amount == null || Number.isNaN(Number(amount))) return 'N/A';
  const rounded = Math.round(Number(amount));
  return `${NPR_SYMBOL} ${rounded.toLocaleString('en-NP')}`;
}

module.exports = { NPR_SYMBOL, formatNpr };
