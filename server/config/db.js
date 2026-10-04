const { Sequelize } = require('sequelize');
require('dotenv').config();

// Create connection
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false, // keep it clean
  }
);

// Function to connect to the database and sync models
const connectDB = async () => {
  try {
    // Authenticate checks if the credentials are correct
    await sequelize.authenticate();
    console.log('MySQL Database connected successfully.');
    
    // Sync models to the database. 'alter: true' will automatically update tables
    await sequelize.sync({ alter: true });
    console.log('Database models synchronized successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
