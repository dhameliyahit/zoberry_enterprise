const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ShippingMethodModel = sequelize.define('ShippingMethod', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  code: {
    type: DataTypes.STRING(32),
    allowNull: false,
    unique: true,
    comment: 'Unique identifier code e.g. STANDARD, EXPRESS',
    set(val) {
      if (val && typeof val === 'string') {
        this.setDataValue('code', val.trim().toUpperCase());
      }
    },
  },
  name: {
    type: DataTypes.STRING(128),
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    get() {
      const val = this.getDataValue('price');
      return val === null ? 0 : parseFloat(val);
    },
  },
  freeThreshold: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: null,
    comment: 'Eligible merchandise subtotal after discounts required for free shipping',
    get() {
      const val = this.getDataValue('freeThreshold');
      return val === null ? null : parseFloat(val);
    },
  },
  estimatedDays: {
    type: DataTypes.STRING(64),
    allowNull: true,
    comment: 'e.g. "3 - 5 business days", "1 - 2 business days"',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
  },
  priority: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['code'],
      name: 'shipping_methods_code_unique',
    },
    {
      fields: ['isActive'],
      name: 'shipping_methods_is_active_index',
    },
    {
      fields: ['priority'],
      name: 'shipping_methods_priority_index',
    },
  ],
});

module.exports = ShippingMethodModel;
