const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const PaymentTransactionModel = sequelize.define('PaymentTransaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  paymentId: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: 'Associated parent Payment ID',
  },
  transactionReference: {
    type: DataTypes.STRING(128),
    allowNull: true,
  },
  eventType: {
    type: DataTypes.STRING(64),
    allowNull: false,
    comment: 'e.g. INITIATE, WEBHOOK_CALLBACK, STATUS_VERIFY, RETRY, EXPIRE',
  },
  status: {
    type: DataTypes.STRING(32),
    allowNull: false,
    comment: 'e.g. PENDING, SUCCESS, FAILED, ERROR',
  },
  responseCode: {
    type: DataTypes.STRING(64),
    allowNull: true,
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Non-sensitive gateway request/response payload for audit',
  },
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['paymentId'],
      name: 'payment_transactions_payment_id_index',
    },
    {
      fields: ['eventType'],
      name: 'payment_transactions_event_type_index',
    },
    {
      fields: ['status'],
      name: 'payment_transactions_status_index',
    },
  ],
});

module.exports = PaymentTransactionModel;
