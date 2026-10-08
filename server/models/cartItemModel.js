const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const CartItemModel = sequelize.define('CartItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  cartId: {
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
    validate: {
      isUUID: 4,
    },
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      isInt: true,
      min: 1,
    },
  },
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['cartId'],
      name: 'cart_items_cart_id_index',
    },
    {
      fields: ['productId'],
      name: 'cart_items_product_id_index',
    },
    {
      fields: ['variantId'],
      name: 'cart_items_variant_id_index',
    },
    {
      unique: true,
      fields: ['cartId', 'productId', 'variantId'],
      name: 'cart_items_unique_item_per_cart',
    },
  ],
});

module.exports = CartItemModel;
