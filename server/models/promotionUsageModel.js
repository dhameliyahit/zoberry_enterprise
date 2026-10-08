const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const PromotionUsageModel = sequelize.define('PromotionUsage', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  promotionId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  guestEmail: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  orderId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  discountAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    get() {
      const val = this.getDataValue('discountAmount');
      return val === null ? 0 : parseFloat(val);
    },
  },
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['promotionId', 'userId'],
      name: 'promotion_usage_user_index',
    },
    {
      fields: ['promotionId', 'guestEmail'],
      name: 'promotion_usage_guest_index',
    },
    {
      unique: true,
      fields: ['orderId'],
      name: 'promotion_usage_order_unique',
    },
  ],
});

module.exports = PromotionUsageModel;
