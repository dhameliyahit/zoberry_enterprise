const { GraphQLError } = require('graphql');
const {
  OrderModel,
  ShipmentModel,
  ShipmentTrackingEventModel,
} = require('../../models');
const { requireAuth, requireAdmin, requireOwnerOrAdmin } = require('../../helpers/authMiddleware');
const {
  createShipmentForOrder,
  updateShipmentStatus,
  cancelShipment,
} = require('../../services/shipping/fulfillmentService');
const { getShippingProvider } = require('../../services/shipping/shippingProviderAdapter');

const shipmentResolvers = {
  Query: {
    getMyOrderShipments: async (parent, { orderId }, context) => {
      const authUser = requireAuth(context);

      const order = await OrderModel.findByPk(orderId);
      if (!order) {
        throw new GraphQLError('Order not found.', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      // Enforce strict ownership protection against IDOR
      requireOwnerOrAdmin(context, order.userId);

      return await ShipmentModel.findAll({
        where: { orderId },
        include: [{ model: ShipmentTrackingEventModel, as: 'trackingEvents' }],
        order: [['createdAt', 'DESC']],
      });
    },

    getShipmentTracking: async (parent, { awbNumber }) => {
      if (!awbNumber || typeof awbNumber !== 'string' || !awbNumber.trim()) {
        throw new GraphQLError('Valid AWB number is required.', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      const shipment = await ShipmentModel.findOne({
        where: { awbNumber: awbNumber.trim() },
        include: [{ model: ShipmentTrackingEventModel, as: 'trackingEvents' }],
      });

      if (!shipment) {
        throw new GraphQLError('Shipment not found for the provided AWB.', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      // Public response is strictly limited to safe tracking milestones and delivery data
      // Strips out customer email, phone, full address snapshot, order ID, internal user IDs, notes, and raw webhooks
      return {
        provider: shipment.provider,
        awbNumber: shipment.awbNumber,
        trackingNumber: shipment.trackingNumber,
        status: shipment.status,
        shippingMethodCode: shipment.shippingMethodCode,
        estimatedDeliveryAt: shipment.estimatedDeliveryAt ? new Date(shipment.estimatedDeliveryAt).toISOString() : null,
        shippedAt: shipment.shippedAt ? new Date(shipment.shippedAt).toISOString() : null,
        deliveredAt: shipment.deliveredAt ? new Date(shipment.deliveredAt).toISOString() : null,
        trackingEvents: (shipment.trackingEvents || []).map((evt) => ({
          id: evt.id,
          status: evt.status,
          location: evt.location,
          description: evt.description,
          eventTime: evt.eventTime ? new Date(evt.eventTime).toISOString() : new Date().toISOString(),
        })),
      };
    },

    checkPostalServiceability: async (parent, { postalCode, shippingMethodCode }) => {
      const provider = getShippingProvider();
      return await provider.checkServiceability({
        postalCode,
        shippingMethodCode: shippingMethodCode || 'STANDARD',
      });
    },

    adminGetOrderShipments: async (parent, { orderId }, context) => {
      requireAdmin(context);

      return await ShipmentModel.findAll({
        where: { orderId },
        include: [{ model: ShipmentTrackingEventModel, as: 'trackingEvents' }],
        order: [['createdAt', 'DESC']],
      });
    },

    adminGetShipmentById: async (parent, { id }, context) => {
      requireAdmin(context);

      const shipment = await ShipmentModel.findByPk(id, {
        include: [{ model: ShipmentTrackingEventModel, as: 'trackingEvents' }],
      });

      if (!shipment) {
        throw new GraphQLError('Shipment not found.', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      return shipment;
    },

    adminGetAllShipments: async (parent, { status, page = 1, limit = 50 }, context) => {
      requireAdmin(context);

      const sanitizedPage = Math.max(1, parseInt(page, 10) || 1);
      const sanitizedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
      const offset = (sanitizedPage - 1) * sanitizedLimit;

      const where = {};
      if (status && status.trim()) {
        where.status = status.trim().toUpperCase();
      }

      return await ShipmentModel.findAll({
        where,
        include: [{ model: ShipmentTrackingEventModel, as: 'trackingEvents' }],
        order: [['createdAt', 'DESC']],
        limit: sanitizedLimit,
        offset,
      });
    },
  },

  Mutation: {
    adminCreateShipment: async (parent, { input }, context) => {
      requireAdmin(context);

      return await createShipmentForOrder({
        orderId: input.orderId,
        provider: input.provider || 'INTERNAL_COURIER',
        packageDetails: input.packageDetails || {},
        idempotencyKey: input.idempotencyKey || null,
        notes: input.notes || null,
        adminUser: context.user,
      });
    },

    adminUpdateShipmentStatus: async (parent, { input }, context) => {
      requireAdmin(context);

      return await updateShipmentStatus({
        shipmentId: input.shipmentId,
        nextStatus: input.nextStatus,
        location: input.location || null,
        description: input.description || null,
        adminUser: context.user,
        source: 'ADMIN',
      });
    },

    adminCancelShipment: async (parent, { shipmentId, reason }, context) => {
      requireAdmin(context);

      return await cancelShipment({
        shipmentId,
        reason: reason || 'Cancelled by administrator',
        adminUser: context.user,
      });
    },

    adminAddTrackingEvent: async (parent, { shipmentId, status, location, description }, context) => {
      requireAdmin(context);

      const shipment = await ShipmentModel.findByPk(shipmentId);
      if (!shipment) {
        throw new GraphQLError('Shipment not found.', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      await ShipmentTrackingEventModel.create({
        shipmentId,
        status: status.trim().toUpperCase(),
        location: location?.trim() || null,
        description: description?.trim() || 'Tracking update logged by admin',
        eventTime: new Date(),
        source: 'ADMIN',
      });

      return await ShipmentModel.findByPk(shipmentId, {
        include: [{ model: ShipmentTrackingEventModel, as: 'trackingEvents' }],
      });
    },
  },
};

module.exports = shipmentResolvers;
