const { Sequelize } = require('sequelize');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    dialect: 'mysql',
    logging: process.env.DB_LOGGING === 'true' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
    },
  }
);

/**
 * Connects to the database safely without destructive auto-alter migrations.
 */
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL database connected successfully.');

    // In production, NEVER execute auto-alter or table dropping at startup
    if (!isProduction && process.env.DB_AUTO_SYNC === 'true') {
      // Safe non-destructive sync (creates tables/indexes if they do not exist, does not alter/drop)
      await sequelize.sync();
      console.log('📋 Database tables verified.');
    }
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error.message);
    throw error;
  }
};

module.exports = { sequelize, connectDB };