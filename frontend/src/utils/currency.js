/**
 * Chadani Cosmetic — Currency Utility
 * Prices in DB are stored in Nepalese Rupees (NPR).
 * Display format: Rs. 1,250
 */

export const CURRENCY_SYMBOL = 'Rs.';
export const CURRENCY_CODE = 'NPR';
export const DHARAN_DELIVERY_FEE = 100;

/**
 * Calculates order total including flat Dharan delivery fee.
 * Empty carts evaluate to 0.
 */
export function calculateOrderTotal(subtotal) {
  if (!subtotal || subtotal <= 0) return 0;
  return subtotal + DHARAN_DELIVERY_FEE;
}

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

/**
 * Resolves active selling price and previous/strikethrough price for any product.
 * Respects both `discountPrice` and `oldPrice`.
 */
export function getProductPricing(product) {
  if (!product) {
    return { activePrice: 0, oldPrice: null, hasDiscount: false, discountPercent: null };
  }

  const regularPrice = Number(product.price) || 0;
  const discountPrice =
    product.discountPrice !== null && product.discountPrice !== undefined
      ? Number(product.discountPrice)
      : null;
  const explicitOldPrice =
    product.oldPrice !== null && product.oldPrice !== undefined
      ? Number(product.oldPrice)
      : null;

  // Case 1: Active discountPrice lower than regular price
  if (
    discountPrice !== null &&
    !Number.isNaN(discountPrice) &&
    discountPrice > 0 &&
    discountPrice < regularPrice
  ) {
    const old =
      explicitOldPrice && explicitOldPrice > regularPrice
        ? explicitOldPrice
        : regularPrice;
    const discountPercent = Math.round(((old - discountPrice) / old) * 100);
    return {
      activePrice: discountPrice,
      oldPrice: old,
      hasDiscount: true,
      discountPercent: discountPercent > 0 ? discountPercent : null,
    };
  }

  // Case 2: oldPrice is higher than regular price (regular price is the active sale price)
  if (
    explicitOldPrice !== null &&
    !Number.isNaN(explicitOldPrice) &&
    explicitOldPrice > regularPrice
  ) {
    const discountPercent = Math.round(((explicitOldPrice - regularPrice) / explicitOldPrice) * 100);
    return {
      activePrice: regularPrice,
      oldPrice: explicitOldPrice,
      hasDiscount: true,
      discountPercent: discountPercent > 0 ? discountPercent : null,
    };
  }

  // Case 3: Standard regular price with no active discount
  return {
    activePrice: regularPrice,
    oldPrice: null,
    hasDiscount: false,
    discountPercent: null,
  };
}

/**
 * Quick helper returning only the active selling price (number) of a product.
 */
export function getActivePrice(product) {
  return getProductPricing(product).activePrice;
}
