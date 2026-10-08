const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const PromotionModel = sequelize.define('Promotion', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(128),
    allowNull: false,
    comment: 'Descriptive promotion title e.g. Summer Flat Rs.200 Off',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  type: {
    type: DataTypes.ENUM('COUPON', 'AUTOMATIC', 'PRODUCT_DISCOUNT', 'CATEGORY_DISCOUNT'),
    defaultValue: 'COUPON',
    allowNull: false,
  },
  code: {
    type: DataTypes.STRING(64),
    allowNull: true,
    unique: true,
    comment: 'Normalized uppercase coupon code',
    set(val) {
      if (val && typeof val === 'string') {
        this.setDataValue('code', val.trim().toUpperCase());
      } else {
        this.setDataValue('code', null);
      }
    },
  },
  discountType: {
    type: DataTypes.ENUM('PERCENTAGE', 'FIXED_AMOUNT'),
    allowNull: false,
  },
  discountValue: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    get() {
      const val = this.getDataValue('discountValue');
      return val === null ? null : parseFloat(val);
    },
  },
  maximumDiscount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    get() {
      const val = this.getDataValue('maximumDiscount');
      return val === null ? null : parseFloat(val);
    },
    comment: 'Cap on percentage-based discounts in rupees',
  },
  minimumSubtotal: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    allowNull: false,
    get() {
      const val = this.getDataValue('minimumSubtotal');
      return val === null ? 0 : parseFloat(val);
    },
  },
  startsAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  endsAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  usageLimit: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Global total usage limit across all customers',
  },
  usageCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
  perCustomerLimit: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    allowNull: false,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
  },
  targetProductIds: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Array of specific product IDs this promotion targets',
  },
  targetCategoryIds: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Array of category IDs this promotion targets',
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
      name: 'promotions_code_unique',
    },
    {
      fields: ['isActive'],
      name: 'promotions_is_active_index',
    },
    {
      fields: ['type'],
      name: 'promotions_type_index',
    },
    {
      fields: ['startsAt', 'endsAt'],
      name: 'promotions_dates_index',
    },
  ],
});

module.exports = PromotionModel;
