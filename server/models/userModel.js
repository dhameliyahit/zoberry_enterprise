const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const UserModel = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING(254),
    allowNull: false,
    unique: true,
    set(val) {
      if (val && typeof val === 'string') {
        this.setDataValue('email', val.trim().toLowerCase());
      }
    },
    validate: {
      isEmail: {
        msg: 'Please provide a valid email address',
      },
      notEmpty: {
        msg: 'Email address cannot be empty',
      },
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true, // Can be null if they login with Google
  },
  googleId: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  role: {
    type: DataTypes.ENUM('customer', 'admin'),
    defaultValue: 'customer',
    allowNull: false,
  },
  isGuestConverted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'True if the user was automatically registered during checkout',
  },
}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['email'],
      name: 'users_email_unique',
    },
    {
      unique: true,
      fields: ['googleId'],
      name: 'users_google_id_unique',
    },
    {
      fields: ['role'],
      name: 'users_role_index',
    },
  ],
  defaultScope: {
    attributes: { exclude: ['password'] },
  },
  scopes: {
    withPassword: {
      attributes: { include: ['password'] },
    },
  },
});

module.exports = UserModel;
