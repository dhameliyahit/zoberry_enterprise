const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const CategoryModel = sequelize.define('Category', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    comment: 'URL friendly version of the name (e.g., Electronics -> electronics)',
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Path to the WebP image stored in the local uploads folder',
  },
  // Future fields like 'isActive' or 'description' can go here
}, {
  timestamps: true,
});

module.exports = CategoryModel;
