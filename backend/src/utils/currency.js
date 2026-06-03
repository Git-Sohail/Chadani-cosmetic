/** Prices in DB are stored in base units; display in Nepali Rupees (NPR). */
const NPR_SYMBOL = 'Rs.';
const NPR_RATE = parseFloat(process.env.NPR_CONVERSION_RATE || '133');

function toNprAmount(amount) {
  if (amount == null || Number.isNaN(Number(amount))) return null;
  return Number(amount) * NPR_RATE;
}

function formatNpr(amount) {
  const npr = toNprAmount(amount);
  if (npr == null) return 'N/A';
  return `${NPR_SYMBOL} ${npr.toLocaleString('en-NP', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

module.exports = { NPR_SYMBOL, NPR_RATE, toNprAmount, formatNpr };
