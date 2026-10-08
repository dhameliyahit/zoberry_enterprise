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
    validate: {
      isUUID: {
        args: 4,
        msg: 'A valid category ID is required',
      },
    },
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    set(val) {
      if (val && typeof val === 'string') {
        this.setDataValue('name', val.trim());
      }
    },
    validate: {
      notEmpty: {
        msg: 'Product name is required',
      },
      len: {
        args: [1, 255],
        msg: 'Product name must be between 1 and 255 characters',
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
        msg: 'Product slug is required',
      },
      is: {
        args: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        msg: 'Product slug must contain only lowercase letters, numbers, and single hyphens',
      },
    },
  },
  shortDescription: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Quick summary for product cards',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Full rich-text description for the product page',
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    get() {
      const val = this.getDataValue('price');
      return val === null ? null : parseFloat(val);
    },
    validate: {
      min: {
        args: [0],
        msg: 'Price cannot be negative',
      },
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
      min: {
        args: [0],
        msg: 'Cost price cannot be negative',
      },
    },
    comment: 'Admin internal cost price for profit tracking',
  },
  compareAtPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    get() {
      const val = this.getDataValue('compareAtPrice');
      return val === null ? null : parseFloat(val);
    },
    validate: {
      min: {
        args: [0],
        msg: 'Compare at price cannot be negative',
      },
    },
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
    validate: {
      isInt: {
        msg: 'Stock quantity must be an integer',
      },
      min: {
        args: [0],
        msg: 'Stock quantity cannot be negative',
      },
    },
  },
  hasVariants: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'True if product pricing/stock is driven by variants',
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
    allowNull: false,
  },
}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['slug'],
      name: 'products_slug_unique',
    },
    {
      fields: ['categoryId'],
      name: 'products_category_id_index',
    },
    {
      fields: ['isActive'],
      name: 'products_is_active_index',
    },
    {
      fields: ['price'],
      name: 'products_price_index',
    },
    {
      fields: ['createdAt'],
      name: 'products_created_at_index',
    },
    {
      fields: ['categoryId', 'isActive'],
      name: 'products_category_active_compound_index',
    },
  ],
});

module.exports = ProductModel;
