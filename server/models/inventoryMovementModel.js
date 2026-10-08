const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const InventoryMovementModel = sequelize.define('InventoryMovement', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  productId: {
    type: DataTypes.UUID,
    allowNull: false,
    validate: {
      isUUID: 4,
    },
  },
  variantId: {
    type: DataTypes.UUID,
    allowNull: true,
    validate: {
      isUUID: 4,
    },
  },
  quantityChange: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Positive for additions/restocks, negative for reservations/sales',
  },
  type: {
    type: DataTypes.ENUM(
      'INITIAL',
      'MANUAL_ADJUSTMENT',
      'CHECKOUT_RESERVATION',
      'ORDER_COMPLETION',
      'ORDER_CANCELLATION_RESTOCK',
      'RESTOCK'
    ),
    allowNull: false,
  },
  referenceType: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'e.g. ORDER, MANUAL, RETURN',
  },
  referenceId: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Associated Order ID or tracking reference',
  },
  balanceAfter: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Recorded stock quantity after the movement occurred',
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['productId'],
      name: 'inv_movements_product_id_index',
    },
    {
      fields: ['variantId'],
      name: 'inv_movements_variant_id_index',
    },
    {
      fields: ['type'],
      name: 'inv_movements_type_index',
    },
    {
      fields: ['referenceId'],
      name: 'inv_movements_ref_id_index',
    },
    {
      fields: ['createdAt'],
      name: 'inv_movements_created_at_index',
    },
  ],
});

module.exports = InventoryMovementModel;
