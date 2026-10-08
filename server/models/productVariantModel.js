const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ProductVariantModel = sequelize.define('ProductVariant', {
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
  sku: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    set(val) {
      if (val && typeof val === 'string') {
        this.setDataValue('sku', val.trim().toUpperCase());
      }
    },
    validate: {
      notEmpty: true,
    },
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Human readable title e.g. "Size: L / Color: Black"',
    set(val) {
      if (val && typeof val === 'string') {
        this.setDataValue('title', val.trim());
      }
    },
    validate: {
      notEmpty: true,
    },
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    get() {
      const val = this.getDataValue('price');
      return val === null ? null : parseFloat(val);
    },
    validate: {
      min: 0,
    },
  },
  compareAtPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    get() {
      const val = this.getDataValue('compareAtPrice');
      return val === null ? null : parseFloat(val);
    },
    validate: {
      min: 0,
    },
  },
  costPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    get() {
      const val = this.getDataValue('costPrice');
      return val === null ? null : parseFloat(val);
    },
    validate: {
      min: 0,
    },
  },
  stockQuantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
    validate: {
      isInt: true,
      min: 0,
    },
  },
  options: {
    type: DataTypes.JSON,
    defaultValue: {},
    comment: 'Key-value map of option dimensions e.g. {"Size": "L", "Color": "Black"}',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
  },
}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['sku'],
      name: 'variants_sku_unique',
    },
    {
      fields: ['productId'],
      name: 'variants_product_id_index',
    },
    {
      fields: ['isActive'],
      name: 'variants_is_active_index',
    },
    {
      fields: ['productId', 'isActive'],
      name: 'variants_product_active_index',
    },
  ],
});

module.exports = ProductVariantModel;
