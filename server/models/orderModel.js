const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const OrderModel = sequelize.define('Order', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  orderNumber: {
    type: DataTypes.STRING(32),
    allowNull: false,
    unique: true,
    comment: 'Human-readable unique order identifier e.g. ZB-20261007-XXXXXX',
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'Associated customer ID if authenticated',
  },
  guestEmail: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  guestPhone: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM(
      'PENDING',
      'CONFIRMED',
      'PROCESSING',
      'SHIPPED',
      'DELIVERED',
      'CANCELLED'
    ),
    defaultValue: 'PENDING',
    allowNull: false,
  },
  paymentStatus: {
    type: DataTypes.ENUM(
      'PENDING',
      'PAID',
      'FAILED',
      'REFUNDED'
    ),
    defaultValue: 'PENDING',
    allowNull: false,
  },
  fulfillmentStatus: {
    type: DataTypes.ENUM(
      'UNFULFILLED',
      'PARTIALLY_FULFILLED',
      'FULFILLED'
    ),
    defaultValue: 'UNFULFILLED',
    allowNull: false,
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'INR',
    allowNull: false,
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    get() {
      const val = this.getDataValue('subtotal');
      return val === null ? null : parseFloat(val);
    },
  },
  discountAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    allowNull: false,
    get() {
      const val = this.getDataValue('discountAmount');
      return val === null ? 0 : parseFloat(val);
    },
  },
  shippingAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    allowNull: false,
    get() {
      const val = this.getDataValue('shippingAmount');
      return val === null ? 0 : parseFloat(val);
    },
  },
  taxAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    allowNull: false,
    get() {
      const val = this.getDataValue('taxAmount');
      return val === null ? 0 : parseFloat(val);
    },
  },
  grandTotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    get() {
      const val = this.getDataValue('grandTotal');
      return val === null ? null : parseFloat(val);
    },
  },
  shippingAddressSnapshot: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: 'Immutable snapshot of customer delivery address at time of purchase',
  },
  billingAddressSnapshot: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  couponCode: {
    type: DataTypes.STRING(64),
    allowNull: true,
    comment: 'Coupon code used for this order, if any',
  },
  discountSnapshot: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Immutable snapshot of applied promotion/discount rules and calculations',
  },
  shippingMethod: {
    type: DataTypes.STRING(32),
    allowNull: true,
    comment: 'Selected shipping method code e.g. STANDARD, EXPRESS',
  },
  shippingSnapshot: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Immutable snapshot of shipping rate, delivery estimates, and method details',
  },
  taxSnapshot: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Immutable snapshot of tax rates and itemized tax breakdowns',
  },
  idempotencyKey: {
    type: DataTypes.STRING(128),
    allowNull: true,
    unique: true,
    comment: 'Prevents double order creation from network retries or multiple clicks',
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  cancelledReason: {
    type: DataTypes.TEXT,
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
}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['orderNumber'],
      name: 'orders_order_number_unique',
    },
    {
      unique: true,
      fields: ['idempotencyKey'],
      name: 'orders_idempotency_key_unique',
    },
    {
      fields: ['userId'],
      name: 'orders_user_id_index',
    },
    {
      fields: ['status'],
      name: 'orders_status_index',
    },
    {
      fields: ['paymentStatus'],
      name: 'orders_payment_status_index',
    },
    {
      fields: ['createdAt'],
      name: 'orders_created_at_index',
    },
  ],
});

module.exports = OrderModel;
