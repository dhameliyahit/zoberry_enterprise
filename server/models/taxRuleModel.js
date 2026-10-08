const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const TaxRuleModel = sequelize.define('TaxRule', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(128),
    allowNull: false,
    comment: 'e.g. Standard GST (Goods & Services Tax)',
  },
  ratePercent: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: 'Tax rate percentage e.g. 5.00, 12.00, 18.00',
    get() {
      const val = this.getDataValue('ratePercent');
      return val === null ? 0 : parseFloat(val);
    },
  },
  isInclusive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
    comment: 'True if catalog prices already include this tax, false if added on checkout',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
  },
  country: {
    type: DataTypes.STRING(2),
    defaultValue: 'IN',
    allowNull: false,
  },
  state: {
    type: DataTypes.STRING(64),
    allowNull: true,
    comment: 'Optional state-level targeting',
  },
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['isActive'],
      name: 'tax_rules_is_active_index',
    },
  ],
});

module.exports = TaxRuleModel;
