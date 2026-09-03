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

/**
 * Returns the effective selling price for a product.
 * If a valid discountPrice exists (greater than 0 and less than regular price), it takes priority.
 * If oldPrice is higher than regular price, regular price is already the active sale price.
 */
function getActivePrice(product) {
  if (!product) return 0;
  const regularPrice = Number(product.price) || 0;
  const discountPrice =
    product.discountPrice !== null && product.discountPrice !== undefined
      ? Number(product.discountPrice)
      : null;
  const oldPrice =
    product.oldPrice !== null && product.oldPrice !== undefined
      ? Number(product.oldPrice)
      : null;

  // Case 1: Valid discountPrice lower than regular price
  if (
    discountPrice !== null &&
    !Number.isNaN(discountPrice) &&
    discountPrice > 0 &&
    discountPrice < regularPrice
  ) {
    return discountPrice;
  }

  // Case 2: oldPrice is higher than regular price (regular price is the active sale price)
  if (
    oldPrice !== null &&
    !Number.isNaN(oldPrice) &&
    oldPrice > regularPrice &&
    regularPrice > 0
  ) {
    return regularPrice;
  }

  return regularPrice;
}

const DHARAN_DELIVERY_FEE = 100;

function calculateOrderTotal(subtotal) {
  const numSubtotal = Number(subtotal);
  if (!numSubtotal || numSubtotal <= 0) return 0;
  return numSubtotal + DHARAN_DELIVERY_FEE;
}

module.exports = {
  NPR_SYMBOL,
  formatNpr,
  getActivePrice,
  DHARAN_DELIVERY_FEE,
  calculateOrderTotal,
};
