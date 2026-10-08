const crypto = require('crypto');

// Standard Order Status Values
const ORDER_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
};

// Standard Payment Status Values
const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
};

// Standard Fulfillment Status Values
const FULFILLMENT_STATUS = {
  UNFULFILLED: 'UNFULFILLED',
  PARTIALLY_FULFILLED: 'PARTIALLY_FULFILLED',
  FULFILLED: 'FULFILLED',
};

// Allowed State Transitions
const ALLOWED_ORDER_TRANSITIONS = {
  [ORDER_STATUS.PENDING]: [ORDER_STATUS.CONFIRMED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.CONFIRMED]: [ORDER_STATUS.PROCESSING, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.PROCESSING]: [ORDER_STATUS.SHIPPED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.SHIPPED]: [ORDER_STATUS.DELIVERED], // Once shipped, cannot directly cancel without return flow
  [ORDER_STATUS.DELIVERED]: [], // Terminal state
  [ORDER_STATUS.CANCELLED]: [], // Terminal state
};

const ALLOWED_PAYMENT_TRANSITIONS = {
  [PAYMENT_STATUS.PENDING]: [PAYMENT_STATUS.PAID, PAYMENT_STATUS.FAILED],
  [PAYMENT_STATUS.FAILED]: [PAYMENT_STATUS.PENDING, PAYMENT_STATUS.PAID], // Can retry payment
  [PAYMENT_STATUS.PAID]: [PAYMENT_STATUS.REFUNDED],
  [PAYMENT_STATUS.REFUNDED]: [], // Terminal state
};

/**
 * Validates whether an order status transition is allowed.
 * @param {string} currentStatus
 * @param {string} nextStatus
 * @returns {boolean}
 */
function isValidOrderStatusTransition(currentStatus, nextStatus) {
  if (currentStatus === nextStatus) return true; // Idempotent no-op
  const allowed = ALLOWED_ORDER_TRANSITIONS[currentStatus];
  return Array.isArray(allowed) && allowed.includes(nextStatus);
}

/**
 * Validates whether a payment status transition is allowed.
 * @param {string} currentStatus
 * @param {string} nextStatus
 * @returns {boolean}
 */
function isValidPaymentStatusTransition(currentStatus, nextStatus) {
  if (currentStatus === nextStatus) return true;
  const allowed = ALLOWED_PAYMENT_TRANSITIONS[currentStatus];
  return Array.isArray(allowed) && allowed.includes(nextStatus);
}

/**
 * Generates a human-friendly unique order number.
 * Format: ZB-YYYYMMDD-XXXXXX (e.g. ZB-20261007-8F3K9A)
 * 
 * @param {Date} [date]
 * @returns {string} Unique human readable order number
 */
function generateOrderNumber(date = new Date()) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;

  // 6 high-entropy cryptographically random uppercase alphanumeric characters (excluding confusing 0/O/1/I)
  const alphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  const randomBytes = crypto.randomBytes(6);
  let randomSuffix = '';
  for (let i = 0; i < 6; i++) {
    randomSuffix += alphabet[randomBytes[i] % alphabet.length];
  }

  return `ZB-${dateStr}-${randomSuffix}`;
}

module.exports = {
  ORDER_STATUS,
  PAYMENT_STATUS,
  FULFILLMENT_STATUS,
  isValidOrderStatusTransition,
  isValidPaymentStatusTransition,
  generateOrderNumber,
};
