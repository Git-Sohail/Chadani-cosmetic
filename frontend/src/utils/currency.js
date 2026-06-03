/**
 * Nepali Rupee (NPR) display — prices in API/DB use base units, shown as NPR in the storefront.
 */

export const CURRENCY_SYMBOL = 'Rs.';
export const NPR_CONVERSION_RATE =
  typeof process !== 'undefined' && process.env.NEXT_PUBLIC_NPR_RATE
    ? parseFloat(process.env.NEXT_PUBLIC_NPR_RATE)
    : 133;

export function toNprAmount(price) {
  if (price == null || Number.isNaN(Number(price))) return null;
  return Number(price) * NPR_CONVERSION_RATE;
}

export function formatPrice(price) {
  const npr = toNprAmount(price);
  if (npr == null) return 'N/A';
  return `${CURRENCY_SYMBOL} ${npr.toLocaleString('en-NP', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

export const currencyConfig = {
  symbol: CURRENCY_SYMBOL,
  code: 'NPR',
  rate: NPR_CONVERSION_RATE,
};
