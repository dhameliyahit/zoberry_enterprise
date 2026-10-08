const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const CartModel = sequelize.define('Cart', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'Associated customer ID if authenticated',
  },
  guestSessionToken: {
    type: DataTypes.STRING(128),
    allowNull: true,
    comment: 'Unique secure session identifier for guest shopping',
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'INR',
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('active', 'merged', 'converted', 'abandoned'),
    defaultValue: 'active',
    allowNull: false,
  },
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['userId'],
      name: 'carts_user_id_index',
    },
    {
      fields: ['guestSessionToken'],
      name: 'carts_guest_token_index',
    },
    {
      fields: ['status'],
      name: 'carts_status_index',
    },
    {
      fields: ['userId', 'status'],
      name: 'carts_user_status_index',
    },
  ],
});

module.exports = CartModel;
