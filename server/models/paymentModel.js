const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const PaymentModel = sequelize.define('Payment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  orderId: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: 'Associated Order ID',
  },
  merchantOrderId: {
    type: DataTypes.STRING(64),
    allowNull: false,
    unique: true,
    comment: 'Unique transaction identifier sent to payment gateway (e.g. PhonePe merchantOrderId)',
  },
  provider: {
    type: DataTypes.STRING(32),
    defaultValue: 'PHONEPE',
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Payment amount in INR',
    get() {
      const val = this.getDataValue('amount');
      return val === null ? null : parseFloat(val);
    },
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'INR',
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM(
      'PENDING',
      'INITIATED',
      'SUCCESS',
      'FAILED',
      'CANCELLED',
      'EXPIRED',
      'REFUNDED'
    ),
    defaultValue: 'PENDING',
    allowNull: false,
  },
  redirectUrl: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Gateway hosted checkout URL provided by PhonePe',
  },
  providerPaymentId: {
    type: DataTypes.STRING(128),
    allowNull: true,
    comment: 'Gateway transaction reference ID returned upon completion',
  },
  providerResponseCode: {
    type: DataTypes.STRING(64),
    allowNull: true,
    comment: 'Gateway response state e.g. COMPLETED, PAYMENT_SUCCESS, PAYMENT_ERROR',
  },
  rawResponse: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Sanitized gateway response payload for audit',
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Expiration timestamp for temporary inventory reservation (TTL)',
  },
  paidAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['merchantOrderId'],
      name: 'payments_merchant_order_id_unique',
    },
    {
      fields: ['orderId'],
      name: 'payments_order_id_index',
    },
    {
      fields: ['status'],
      name: 'payments_status_index',
    },
    {
      fields: ['expiresAt'],
      name: 'payments_expires_at_index',
    },
  ],
});

module.exports = PaymentModel;
