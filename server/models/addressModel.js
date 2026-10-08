const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const AddressModel = sequelize.define('Address', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    validate: {
      isUUID: 4,
    },
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: false,
    set(val) {
      if (val && typeof val === 'string') {
        this.setDataValue('fullName', val.trim());
      }
    },
    validate: {
      notEmpty: true,
    },
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false,
    set(val) {
      if (val && typeof val === 'string') {
        this.setDataValue('phone', val.trim());
      }
    },
    validate: {
      notEmpty: true,
    },
  },
  addressLine1: {
    type: DataTypes.STRING,
    allowNull: false,
    set(val) {
      if (val && typeof val === 'string') {
        this.setDataValue('addressLine1', val.trim());
      }
    },
    validate: {
      notEmpty: true,
    },
  },
  addressLine2: {
    type: DataTypes.STRING,
    allowNull: true,
    set(val) {
      if (val && typeof val === 'string') {
        this.setDataValue('addressLine2', val.trim());
      }
    },
  },
  landmark: {
    type: DataTypes.STRING,
    allowNull: true,
    set(val) {
      if (val && typeof val === 'string') {
        this.setDataValue('landmark', val.trim());
      }
    },
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false,
    set(val) {
      if (val && typeof val === 'string') {
        this.setDataValue('city', val.trim());
      }
    },
    validate: {
      notEmpty: true,
    },
  },
  state: {
    type: DataTypes.STRING,
    allowNull: false,
    set(val) {
      if (val && typeof val === 'string') {
        this.setDataValue('state', val.trim());
      }
    },
    validate: {
      notEmpty: true,
    },
  },
  postalCode: {
    type: DataTypes.STRING(10),
    allowNull: false,
    set(val) {
      if (val && typeof val === 'string') {
        this.setDataValue('postalCode', val.trim());
      }
    },
    validate: {
      notEmpty: true,
    },
  },
  country: {
    type: DataTypes.STRING(2),
    defaultValue: 'IN',
    allowNull: false,
  },
  addressType: {
    type: DataTypes.ENUM('HOME', 'WORK', 'OTHER'),
    defaultValue: 'HOME',
    allowNull: false,
  },
  isDefaultShipping: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },
  isDefaultBilling: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['userId'],
      name: 'addresses_user_id_index',
    },
    {
      fields: ['userId', 'isDefaultShipping'],
      name: 'addresses_user_default_shipping_index',
    },
  ],
});

module.exports = AddressModel;
