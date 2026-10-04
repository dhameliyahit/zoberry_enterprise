const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const UserModel = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true, // Prevents fake/invalid email formats
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true, // Can be null if they login with Google or auto-register during checkout
  },
  googleId: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  role: {
    type: DataTypes.ENUM('customer', 'admin'),
    defaultValue: 'customer',
  },
  isGuestConverted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'True if the user was automatically registered during checkout',
  },
  // Future fields (like address, phone) can be added here easily later
}, {
  timestamps: true,
});

module.exports = UserModel;
