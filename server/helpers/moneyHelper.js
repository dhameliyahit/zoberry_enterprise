/**
 * Money & Financial Calculations Utility
 * 
 * Provides safe, non-floating-point financial calculations using integer arithmetic (paise / cents).
 * 1 INR = 100 paise.
 * Avoids IEEE-754 binary floating-point rounding errors (e.g. 0.1 + 0.2 !== 0.3).
 */

/**
 * Converts standard decimal monetary value to integer paise/cents.
 * e.g. 499.99 -> 49999
 * @param {number|string} amount
 * @returns {number} Integer paise
 */
function toPaise(amount) {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return 0;
  }
  return Math.round(Number(amount) * 100);
}

/**
 * Converts integer paise back to fixed 2-decimal number.
 * e.g. 49999 -> 499.99
 * @param {number} paise
 * @returns {number} Decimal currency value
 */
function fromPaise(paise) {
  if (paise === null || paise === undefined || isNaN(Number(paise))) {
    return 0;
  }
  return Math.round(paise) / 100;
}

/**
 * Formats a monetary value to a standard 2-decimal string.
 * e.g. 499.9 -> "499.90"
 * @param {number|string} amount
 * @returns {string}
 */
function formatCurrency(amount) {
  const num = typeof amount === 'number' ? amount : Number(amount) || 0;
  return num.toFixed(2);
}

/**
 * Calculates item line total safely in paise.
 * @param {number|string} unitPrice
 * @param {number} quantity
 * @returns {number} Line total in decimal
 */
function calculateLineTotal(unitPrice, quantity) {
  const pricePaise = toPaise(unitPrice);
  const qty = Math.max(0, parseInt(quantity, 10) || 0);
  const totalPaise = pricePaise * qty;
  return fromPaise(totalPaise);
}

/**
 * Calculates complete order / checkout financial breakdown.
 * 
 * @param {Array<{ price: number|string, quantity: number }>} items - Cart/Order items
 * @param {Object} [options] - Additional charges / discounts
 * @param {number|string} [options.discountAmount=0] - Pre-calculated discount
 * @param {number|string} [options.shippingAmount=0] - Shipping fee
 * @param {number|string} [options.taxRatePercent=0] - Tax percentage (e.g. 18 for 18% GST)
 * @returns {Object} Complete monetary breakdown
 */
function calculateTotals(items = [], options = {}) {
  let subtotalPaise = 0;

  for (const item of items) {
    const itemPricePaise = toPaise(item.price);
    const itemQty = Math.max(0, parseInt(item.quantity, 10) || 0);
    subtotalPaise += itemPricePaise * itemQty;
  }

  const discountPaise = Math.min(subtotalPaise, Math.max(0, toPaise(options.discountAmount || 0)));
  const shippingPaise = Math.max(0, toPaise(options.shippingAmount || 0));

  // Tax calculation on (subtotal - discount) if taxRatePercent is specified
  let taxPaise = 0;
  if (options.taxRatePercent && Number(options.taxRatePercent) > 0) {
    const taxablePaise = Math.max(0, subtotalPaise - discountPaise);
    taxPaise = Math.round((taxablePaise * Number(options.taxRatePercent)) / 100);
  } else if (options.taxAmount) {
    taxPaise = Math.max(0, toPaise(options.taxAmount));
  }

  const grandTotalPaise = Math.max(0, subtotalPaise - discountPaise + shippingPaise + taxPaise);

  return {
    subtotal: fromPaise(subtotalPaise),
    discountAmount: fromPaise(discountPaise),
    shippingAmount: fromPaise(shippingPaise),
    taxAmount: fromPaise(taxPaise),
    grandTotal: fromPaise(grandTotalPaise),
    // Expose raw integer paise for exact ledger calculations
    _raw: {
      subtotalPaise,
      discountPaise,
      shippingPaise,
      taxPaise,
      grandTotalPaise,
    },
  };
}

module.exports = {
  toPaise,
  fromPaise,
  formatCurrency,
  calculateLineTotal,
  calculateTotals,
};
