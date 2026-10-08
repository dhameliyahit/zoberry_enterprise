/**
 * Provider-Independent Shipping Adapter & Interface Layer
 * 
 * Defines the standard contract for external logistics providers (Shiprocket, Delhivery, Blue Dart, DTDC)
 * while keeping the core commerce and fulfillment domain decoupled.
 */

const { generateAWBNumber, generateTrackingNumber, SHIPMENT_STATUS } = require('../../helpers/shipmentStateMachine');

class BaseShippingProvider {
  constructor(name) {
    this.name = name;
  }

  /**
   * Checks whether a destination postal code is serviceable.
   * @param {Object} params
   * @param {string} params.postalCode
   * @param {string} [params.country='IN']
   * @param {string} [params.state]
   * @param {string} [params.shippingMethodCode]
   * @returns {Promise<Object>}
   */
  async checkServiceability(params) {
    throw new Error('checkServiceability must be implemented by provider');
  }

  /**
   * Dispatches shipment request to logistics provider.
   * @param {Object} params
   * @param {Object} params.order
   * @param {Object} params.packageDetails
   * @param {Object} params.shippingAddress
   * @returns {Promise<Object>}
   */
  async createShipment(params) {
    throw new Error('createShipment must be implemented by provider');
  }

  /**
   * Requests shipment cancellation with provider.
   * @param {Object} params
   * @param {Object} params.shipment
   * @param {string} params.reason
   * @returns {Promise<Object>}
   */
  async cancelShipment(params) {
    throw new Error('cancelShipment must be implemented by provider');
  }

  /**
   * Fetches latest tracking milestones.
   * @param {Object} params
   * @param {string} params.awbNumber
   * @returns {Promise<Object>}
   */
  async getTracking(params) {
    throw new Error('getTracking must be implemented by provider');
  }
}

/**
 * Standard Internal / Mock Courier Provider for Testing & Standalone Fulfillment
 */
class InternalCourierProvider extends BaseShippingProvider {
  constructor(name = 'INTERNAL_COURIER') {
    super(name);
  }

  async checkServiceability({ postalCode, country = 'IN', state, shippingMethodCode = 'STANDARD' }) {
    const cleanPin = (postalCode || '').trim();
    // Deterministic validation: 6-digit Indian pincode is serviceable
    const isStandardPin = /^\d{6}$/.test(cleanPin);
    
    return {
      serviceable: isStandardPin || cleanPin.length > 0,
      provider: this.name,
      postalCode: cleanPin,
      country,
      state: state || null,
      estimatedDays: shippingMethodCode === 'EXPRESS' ? '1 - 2 business days' : '3 - 5 business days',
      availableMethods: ['STANDARD', 'EXPRESS'],
    };
  }

  async createShipment({ order, packageDetails = {}, shippingAddress }) {
    const awbNumber = generateAWBNumber(this.name);
    const trackingNumber = generateTrackingNumber(this.name);
    const providerShipmentId = `PRV-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // Estimated delivery (3 days from dispatch)
    const estimatedDeliveryAt = new Date();
    estimatedDeliveryAt.setDate(estimatedDeliveryAt.getDate() + (order.shippingMethod === 'EXPRESS' ? 2 : 4));

    return {
      success: true,
      provider: this.name,
      providerShipmentId,
      awbNumber,
      trackingNumber,
      status: SHIPMENT_STATUS.SHIPMENT_CREATED,
      estimatedDeliveryAt,
      labelUrl: null, // Future provider label URL
      manifestUrl: null,
    };
  }

  async cancelShipment({ shipment, reason }) {
    return {
      success: true,
      provider: this.name,
      awbNumber: shipment.awbNumber,
      status: SHIPMENT_STATUS.CANCELLED,
      cancelledAt: new Date(),
      message: `Shipment cancelled: ${reason || 'Admin requested cancellation'}`,
    };
  }

  async getTracking({ awbNumber }) {
    return {
      awbNumber,
      provider: this.name,
      currentStatus: SHIPMENT_STATUS.IN_TRANSIT,
      events: [
        {
          status: SHIPMENT_STATUS.SHIPMENT_CREATED,
          description: 'Shipment created and assigned to courier',
          eventTime: new Date(),
        },
      ],
    };
  }
}

// Provider Registry
const providers = {
  INTERNAL_COURIER: new InternalCourierProvider('INTERNAL_COURIER'),
  MOCK_CARRIER: new InternalCourierProvider('MOCK_CARRIER'),
  DELHIVERY_MOCK: new InternalCourierProvider('DELHIVERY_MOCK'),
  SHIPROCKET_MOCK: new InternalCourierProvider('SHIPROCKET_MOCK'),
  BLUE_DART_MOCK: new InternalCourierProvider('BLUE_DART_MOCK'),
};

/**
 * Resolves a shipping provider adapter by name.
 * @param {string} [name='INTERNAL_COURIER']
 * @returns {BaseShippingProvider}
 */
function getShippingProvider(name = 'INTERNAL_COURIER') {
  const key = (name || 'INTERNAL_COURIER').toUpperCase();
  return providers[key] || providers.INTERNAL_COURIER;
}

module.exports = {
  BaseShippingProvider,
  InternalCourierProvider,
  getShippingProvider,
};
