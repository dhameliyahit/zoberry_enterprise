const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const OrderItemModel = sequelize.define('OrderItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  orderId: {
    type: DataTypes.UUID,
    allowNull: false,
    validate: {
      isUUID: 4,
    },
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
  },
  productName: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Immutable snapshot of product name at purchase time',
  },
  variantTitle: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Immutable snapshot of variant title (e.g. Size: L / Color: Black)',
  },
  sku: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Immutable snapshot of SKU',
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
    },
  },
  unitPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    get() {
      const val = this.getDataValue('unitPrice');
      return val === null ? null : parseFloat(val);
    },
  },
  lineTotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    get() {
      const val = this.getDataValue('lineTotal');
      return val === null ? null : parseFloat(val);
    },
  },
  productImage: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {},
    comment: 'Any additional metadata options or attributes captured at checkout',
  },
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['orderId'],
      name: 'order_items_order_id_index',
    },
    {
      fields: ['productId'],
      name: 'order_items_product_id_index',
    },
    {
      fields: ['variantId'],
      name: 'order_items_variant_id_index',
    },
  ],
});

module.exports = OrderItemModel;
