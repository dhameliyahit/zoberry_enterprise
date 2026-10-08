const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const SHIPMENT_STATUS = {
  PENDING: 'PENDING',
  READY_TO_SHIP: 'READY_TO_SHIP',
  SHIPMENT_CREATED: 'SHIPMENT_CREATED',
  PICKED_UP: 'PICKED_UP',
  IN_TRANSIT: 'IN_TRANSIT',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  FAILED: 'FAILED',
};

const ShipmentModel = sequelize.define('Shipment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  orderId: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: 'Associated order ID',
  },
  provider: {
    type: DataTypes.STRING(64),
    allowNull: false,
    defaultValue: 'INTERNAL_COURIER',
    comment: 'Carrier / Provider name e.g. INTERNAL_COURIER, DELHIVERY_MOCK, SHIPROCKET_MOCK',
  },
  providerShipmentId: {
    type: DataTypes.STRING(128),
    allowNull: true,
    comment: 'External reference ID assigned by carrier provider',
  },
  awbNumber: {
    type: DataTypes.STRING(64),
    allowNull: true,
    unique: true,
    comment: 'Air Waybill tracking number',
  },
  trackingNumber: {
    type: DataTypes.STRING(64),
    allowNull: true,
    comment: 'Customer-facing tracking identifier',
  },
  status: {
    type: DataTypes.ENUM(
      SHIPMENT_STATUS.PENDING,
      SHIPMENT_STATUS.READY_TO_SHIP,
      SHIPMENT_STATUS.SHIPMENT_CREATED,
      SHIPMENT_STATUS.PICKED_UP,
      SHIPMENT_STATUS.IN_TRANSIT,
      SHIPMENT_STATUS.OUT_FOR_DELIVERY,
      SHIPMENT_STATUS.DELIVERED,
      SHIPMENT_STATUS.CANCELLED,
      SHIPMENT_STATUS.FAILED
    ),
    defaultValue: SHIPMENT_STATUS.PENDING,
    allowNull: false,
  },
  shippingMethodCode: {
    type: DataTypes.STRING(32),
    allowNull: true,
    defaultValue: 'STANDARD',
  },
  shippingAddressSnapshot: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: 'Immutable snapshot of recipient delivery address',
  },
  packageDetails: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Weight, dimensions (L x W x H), unit details',
  },
  estimatedDeliveryAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  shippedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  deliveredAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  cancelledAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  cancelledReason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  idempotencyKey: {
    type: DataTypes.STRING(128),
    allowNull: true,
    unique: true,
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
  },
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['orderId'],
      name: 'shipments_order_id_index',
    },
    {
      fields: ['status'],
      name: 'shipments_status_index',
    },
    {
      fields: ['awbNumber'],
      name: 'shipments_awb_number_index',
    },
    {
      fields: ['providerShipmentId'],
      name: 'shipments_provider_shipment_id_index',
    },
    {
      fields: ['idempotencyKey'],
      unique: true,
      name: 'shipments_idempotency_key_unique',
    },
  ],
});

module.exports = {
  ShipmentModel,
  SHIPMENT_STATUS,
};
