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
    set(val) {
      if (val && typeof val === 'string') {
        this.setDataValue('name', val.trim());
      }
    },
    validate: {
      notEmpty: {
        msg: 'Category name is required',
      },
    },
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    set(val) {
      if (val && typeof val === 'string') {
        this.setDataValue('slug', val.trim().toLowerCase());
      }
    },
    validate: {
      notEmpty: {
        msg: 'Category slug is required',
      },
      is: {
        args: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        msg: 'Slug must consist of lowercase alphanumeric characters and single hyphens',
      },
    },
    comment: 'URL friendly version of the name (e.g., electronics)',
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Category image URL is required',
      },
    },
    comment: 'Path to the WebP image stored in the local uploads folder',
  },
}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['slug'],
      name: 'categories_slug_unique',
    },
    {
      unique: true,
      fields: ['name'],
      name: 'categories_name_unique',
    },
  ],
});

module.exports = CategoryModel;
