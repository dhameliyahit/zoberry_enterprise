const { GraphQLError } = require('graphql');
const { sequelize } = require('../../config/db');
const {
  OrderModel,
  OrderItemModel,
  ShipmentModel,
  ShipmentTrackingEventModel,
} = require('../../models');
const {
  SHIPMENT_STATUS,
  isValidShipmentStatusTransition,
} = require('../../helpers/shipmentStateMachine');
const { ORDER_STATUS, PAYMENT_STATUS, FULFILLMENT_STATUS } = require('../../helpers/orderStateMachine');
const { getShippingProvider } = require('./shippingProviderAdapter');

/**
 * Validates whether an order is eligible for fulfillment.
 * Authoritative Rule: Order must be PAID (or valid COD) and NOT CANCELLED.
 * 
 * @param {Object} order
 */
function validateOrderFulfillmentEligibility(order) {
  if (!order) {
    throw new GraphQLError('Order not found.', {
      extensions: { code: 'NOT_FOUND' },
    });
  }

  if (order.status === ORDER_STATUS.CANCELLED) {
    throw new GraphQLError('Cannot fulfill a cancelled order.', {
      extensions: { code: 'BAD_USER_INPUT' },
    });
  }

  if (order.paymentStatus !== PAYMENT_STATUS.PAID) {
    throw new GraphQLError(
      `Order is not eligible for fulfillment. Payment status is "${order.paymentStatus}" (Required: PAID).`,
      { extensions: { code: 'BAD_USER_INPUT' } }
    );
  }
}

/**
 * Creates a new shipment for an eligible, paid order.
 * Server-authoritative and idempotent.
 * 
 * @param {Object} params
 * @param {string} params.orderId
 * @param {string} [params.provider='INTERNAL_COURIER']
 * @param {Object} [params.packageDetails]
 * @param {string} [params.idempotencyKey]
 * @param {string} [params.notes]
 * @param {Object} [params.adminUser]
 * @returns {Promise<Object>} Created or existing shipment
 */
async function createShipmentForOrder(params = {}) {
  const {
    orderId,
    provider = 'INTERNAL_COURIER',
    packageDetails = {},
    idempotencyKey = null,
    notes = null,
    adminUser = null,
  } = params;

  if (!orderId) {
    throw new GraphQLError('Order ID is required to create a shipment.', {
      extensions: { code: 'BAD_USER_INPUT' },
    });
  }

  // 1. Check Idempotency: Return existing shipment if key already submitted
  if (idempotencyKey && typeof idempotencyKey === 'string' && idempotencyKey.trim()) {
    const cleanKey = idempotencyKey.trim();
    const existing = await ShipmentModel.findOne({
      where: { idempotencyKey: cleanKey },
      include: [{ model: ShipmentTrackingEventModel, as: 'trackingEvents' }],
    });
    if (existing) {
      return existing;
    }
  }

  try {
    return await sequelize.transaction(async (t) => {
      // Check idempotency again within transaction
      if (idempotencyKey && typeof idempotencyKey === 'string' && idempotencyKey.trim()) {
        const cleanKey = idempotencyKey.trim();
        const existing = await ShipmentModel.findOne({
          where: { idempotencyKey: cleanKey },
          include: [{ model: ShipmentTrackingEventModel, as: 'trackingEvents' }],
          transaction: t,
        });
        if (existing) {
          return existing;
        }
      }

      // 2. Lock Order row and validate eligibility
      const order = await OrderModel.findByPk(orderId, {
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      validateOrderFulfillmentEligibility(order);

      // 3. Check for existing active shipment to prevent duplicate dispatch
      const existingActiveShipment = await ShipmentModel.findOne({
        where: {
          orderId: order.id,
          status: [
            SHIPMENT_STATUS.PENDING,
            SHIPMENT_STATUS.READY_TO_SHIP,
            SHIPMENT_STATUS.SHIPMENT_CREATED,
            SHIPMENT_STATUS.PICKED_UP,
            SHIPMENT_STATUS.IN_TRANSIT,
            SHIPMENT_STATUS.OUT_FOR_DELIVERY,
          ],
        },
        transaction: t,
      });

      if (existingActiveShipment && !idempotencyKey) {
        throw new GraphQLError(
          `Order already has an active shipment in progress (AWB: ${existingActiveShipment.awbNumber || 'Pending'}, Status: ${existingActiveShipment.status}).`,
          { extensions: { code: 'BAD_USER_INPUT' } }
        );
      }

      // 4. Call Shipping Provider Adapter
      const providerAdapter = getShippingProvider(provider);
      const providerResult = await providerAdapter.createShipment({
        order: order.toJSON(),
        packageDetails,
        shippingAddress: order.shippingAddressSnapshot,
      });

      // 5. Create immutable Shipment record
      const shipment = await ShipmentModel.create({
        orderId: order.id,
        provider: providerResult.provider || provider,
        providerShipmentId: providerResult.providerShipmentId || null,
        awbNumber: providerResult.awbNumber || null,
        trackingNumber: providerResult.trackingNumber || providerResult.awbNumber || null,
        status: providerResult.status || SHIPMENT_STATUS.SHIPMENT_CREATED,
        shippingMethodCode: order.shippingMethod || 'STANDARD',
        shippingAddressSnapshot: order.shippingAddressSnapshot,
        packageDetails: packageDetails || {},
        estimatedDeliveryAt: providerResult.estimatedDeliveryAt || null,
        notes: notes?.trim() || null,
        idempotencyKey: idempotencyKey?.trim() || null,
      }, { transaction: t });

      // 6. Record Initial Tracking Milestone
      await ShipmentTrackingEventModel.create({
        shipmentId: shipment.id,
        status: shipment.status,
        location: 'Fulfillment Hub',
        description: `Shipment booked with ${shipment.provider}. AWB: ${shipment.awbNumber || 'Assigned'}`,
        eventTime: new Date(),
        source: adminUser ? 'ADMIN' : 'SYSTEM',
        rawPayload: providerResult,
      }, { transaction: t });

      // 7. Synchronize Order state
      order.fulfillmentStatus = FULFILLMENT_STATUS.PARTIALLY_FULFILLED;
      if (order.status === ORDER_STATUS.CONFIRMED || order.status === ORDER_STATUS.PENDING) {
        order.status = ORDER_STATUS.PROCESSING;
      }
      await order.save({ transaction: t });

      return await ShipmentModel.findByPk(shipment.id, {
        include: [{ model: ShipmentTrackingEventModel, as: 'trackingEvents' }],
        transaction: t,
      });
    });
  } catch (error) {
    // If unique constraint collision occurs concurrently for idempotencyKey, return existing gracefully
    if (idempotencyKey && (error.name === 'SequelizeUniqueConstraintError' || error.message?.includes('idempotencyKey') || error.message?.includes('idempotency_key'))) {
      const cleanKey = typeof idempotencyKey === 'string' ? idempotencyKey.trim() : idempotencyKey;
      const existing = await ShipmentModel.findOne({
        where: { idempotencyKey: cleanKey },
        include: [{ model: ShipmentTrackingEventModel, as: 'trackingEvents' }],
      });
      if (existing) {
        return existing;
      }
    }
    throw error;
  }
}

/**
 * Updates the lifecycle status of a shipment and synchronizes order milestones.
 * 
 * @param {Object} params
 * @param {string} params.shipmentId
 * @param {string} params.nextStatus
 * @param {string} [params.location]
 * @param {string} [params.description]
 * @param {Object} [params.adminUser]
 * @param {string} [params.source='ADMIN']
 * @returns {Promise<Object>}
 */
async function updateShipmentStatus(params = {}) {
  const {
    shipmentId,
    nextStatus,
    location = null,
    description = null,
    adminUser = null,
    source = 'ADMIN',
  } = params;

  if (!shipmentId || !nextStatus) {
    throw new GraphQLError('Shipment ID and next status are required.', {
      extensions: { code: 'BAD_USER_INPUT' },
    });
  }

  const targetStatus = nextStatus.trim().toUpperCase();

  return await sequelize.transaction(async (t) => {
    const shipment = await ShipmentModel.findByPk(shipmentId, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!shipment) {
      throw new GraphQLError('Shipment not found.', {
        extensions: { code: 'NOT_FOUND' },
      });
    }

    if (!isValidShipmentStatusTransition(shipment.status, targetStatus)) {
      throw new GraphQLError(
        `Illegal shipment status transition from "${shipment.status}" to "${targetStatus}".`,
        { extensions: { code: 'BAD_USER_INPUT' } }
      );
    }

    // Set timestamps
    const now = new Date();
    if (targetStatus === SHIPMENT_STATUS.PICKED_UP || targetStatus === SHIPMENT_STATUS.IN_TRANSIT) {
      if (!shipment.shippedAt) shipment.shippedAt = now;
    }
    if (targetStatus === SHIPMENT_STATUS.DELIVERED) {
      shipment.deliveredAt = now;
    }
    if (targetStatus === SHIPMENT_STATUS.CANCELLED) {
      shipment.cancelledAt = now;
    }

    shipment.status = targetStatus;
    await shipment.save({ transaction: t });

    // Append audit tracking milestone
    await ShipmentTrackingEventModel.create({
      shipmentId: shipment.id,
      status: targetStatus,
      location: location?.trim() || null,
      description: description?.trim() || `Status updated to ${targetStatus}`,
      eventTime: now,
      source: source || (adminUser ? 'ADMIN' : 'SYSTEM'),
    }, { transaction: t });

    // Synchronize parent Order status
    const order = await OrderModel.findByPk(shipment.orderId, { transaction: t });
    if (order) {
      if (targetStatus === SHIPMENT_STATUS.PICKED_UP || targetStatus === SHIPMENT_STATUS.IN_TRANSIT || targetStatus === SHIPMENT_STATUS.OUT_FOR_DELIVERY) {
        order.status = ORDER_STATUS.SHIPPED;
        order.fulfillmentStatus = FULFILLMENT_STATUS.FULFILLED;
        if (!order.shippedAt) order.shippedAt = now;
        await order.save({ transaction: t });
      } else if (targetStatus === SHIPMENT_STATUS.DELIVERED) {
        order.status = ORDER_STATUS.DELIVERED;
        order.fulfillmentStatus = FULFILLMENT_STATUS.FULFILLED;
        if (!order.deliveredAt) order.deliveredAt = now;
        await order.save({ transaction: t });
      } else if (targetStatus === SHIPMENT_STATUS.CANCELLED) {
        // Check if other active shipments remain
        const otherActive = await ShipmentModel.count({
          where: {
            orderId: order.id,
            status: [
              SHIPMENT_STATUS.PENDING,
              SHIPMENT_STATUS.READY_TO_SHIP,
              SHIPMENT_STATUS.SHIPMENT_CREATED,
              SHIPMENT_STATUS.PICKED_UP,
              SHIPMENT_STATUS.IN_TRANSIT,
              SHIPMENT_STATUS.OUT_FOR_DELIVERY,
              SHIPMENT_STATUS.DELIVERED,
            ],
          },
          transaction: t,
        });
        if (otherActive === 0) {
          order.fulfillmentStatus = FULFILLMENT_STATUS.UNFULFILLED;
          await order.save({ transaction: t });
        }
      }
    }

    return await ShipmentModel.findByPk(shipment.id, {
      include: [{ model: ShipmentTrackingEventModel, as: 'trackingEvents' }],
      transaction: t,
    });
  });
}

/**
 * Cancels a shipment and records the cancellation event.
 * Note: Does not automatically restock inventory (inventory is tied to order cancellation).
 * 
 * @param {Object} params
 * @param {string} params.shipmentId
 * @param {string} [params.reason]
 * @param {Object} [params.adminUser]
 * @returns {Promise<Object>}
 */
async function cancelShipment(params = {}) {
  const { shipmentId, reason = 'Cancelled by administrator', adminUser = null } = params;

  return await updateShipmentStatus({
    shipmentId,
    nextStatus: SHIPMENT_STATUS.CANCELLED,
    description: `Shipment cancelled: ${reason}`,
    adminUser,
    source: 'ADMIN',
  });
}

module.exports = {
  validateOrderFulfillmentEligibility,
  createShipmentForOrder,
  updateShipmentStatus,
  cancelShipment,
};
