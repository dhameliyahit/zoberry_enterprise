const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const WishlistItemModel = sequelize.define('WishlistItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  productId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['userId'],
      name: 'wishlist_items_user_id_index',
    },
    {
      fields: ['productId'],
      name: 'wishlist_items_product_id_index',
    },
    {
      unique: true,
      fields: ['userId', 'productId'],
      name: 'wishlist_user_product_unique',
    },
  ],
});

module.exports = WishlistItemModel;
