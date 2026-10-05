const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ProductModel = sequelize.define('Product', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  categoryId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  shortDescription: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Quick summary for product cards',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Full rich-text description for the product page',
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  costPrice: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'Admin internal cost price for profit tracking',
  },
  compareAtPrice: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'Original price for showing discount badges',
  },
  images: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Array of image URLs (optimized WebP)',
  },
  stockQuantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  optionsLabel: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Simple label for customers, e.g., "Free Size", "Mixed Colors"',
  },
  productVideoUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Link to a product video to build high customer trust',
  },
  features: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Array of bullet points highlighting key trust factors/specs',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  timestamps: true,
});

module.exports = ProductModel;
