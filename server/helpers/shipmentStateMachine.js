const crypto = require('crypto');
const { SHIPMENT_STATUS } = require('../models/shipmentModel');

// Controlled, Non-Arbitrary Shipment Lifecycle Transitions
const ALLOWED_SHIPMENT_TRANSITIONS = {
  [SHIPMENT_STATUS.PENDING]: [
    SHIPMENT_STATUS.READY_TO_SHIP,
    SHIPMENT_STATUS.CANCELLED,
  ],
  [SHIPMENT_STATUS.READY_TO_SHIP]: [
    SHIPMENT_STATUS.SHIPMENT_CREATED,
    SHIPMENT_STATUS.CANCELLED,
  ],
  [SHIPMENT_STATUS.SHIPMENT_CREATED]: [
    SHIPMENT_STATUS.PICKED_UP,
    SHIPMENT_STATUS.FAILED,
    SHIPMENT_STATUS.CANCELLED,
  ],
  [SHIPMENT_STATUS.PICKED_UP]: [
    SHIPMENT_STATUS.IN_TRANSIT,
    SHIPMENT_STATUS.FAILED,
  ],
  [SHIPMENT_STATUS.IN_TRANSIT]: [
    SHIPMENT_STATUS.OUT_FOR_DELIVERY,
    SHIPMENT_STATUS.DELIVERED,
    SHIPMENT_STATUS.FAILED,
  ],
  [SHIPMENT_STATUS.OUT_FOR_DELIVERY]: [
    SHIPMENT_STATUS.DELIVERED,
    SHIPMENT_STATUS.FAILED,
  ],
  [SHIPMENT_STATUS.DELIVERED]: [], // Terminal state
  [SHIPMENT_STATUS.CANCELLED]: [], // Terminal state
  [SHIPMENT_STATUS.FAILED]: [
    SHIPMENT_STATUS.READY_TO_SHIP,
    SHIPMENT_STATUS.SHIPMENT_CREATED,
    SHIPMENT_STATUS.CANCELLED,
  ], // Controlled retry path
};

/**
 * Validates whether a shipment status transition is allowed.
 * @param {string} currentStatus
 * @param {string} nextStatus
 * @returns {boolean}
 */
function isValidShipmentStatusTransition(currentStatus, nextStatus) {
  if (!currentStatus || !nextStatus) return false;
  if (currentStatus === nextStatus) return true; // Idempotent no-op
  const allowed = ALLOWED_SHIPMENT_TRANSITIONS[currentStatus];
  return Array.isArray(allowed) && allowed.includes(nextStatus);
}

/**
 * Generates an authoritative provider-independent AWB tracking number.
 * Format: AWB-[PROVIDER_PREFIX]-[YYYYMMDD]-[6_CHAR_HEX]
 * 
 * @param {string} [provider='ZB']
 * @returns {string} Unique AWB number
 */
function generateAWBNumber(provider = 'ZB') {
  const prefix = (provider || 'ZB').replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase();
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomHex = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `AWB-${prefix}-${dateStr}-${randomHex}`;
}

/**
 * Generates a customer-friendly tracking number.
 * 
 * @param {string} [provider='ZB']
 * @returns {string}
 */
function generateTrackingNumber(provider = 'ZB') {
  return generateAWBNumber(provider);
}

module.exports = {
  SHIPMENT_STATUS,
  ALLOWED_SHIPMENT_TRANSITIONS,
  isValidShipmentStatusTransition,
  generateAWBNumber,
  generateTrackingNumber,
};
