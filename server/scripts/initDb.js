/**
 * Safe Database Schema Initialization & Migration Runner
 * 
 * Safely creates tables and indexes if they do not exist.
 * Preserves all existing data without altering or dropping tables destructively.
 */

require('dotenv').config();
require('../models');
const { sequelize } = require('../config/db');
const bcrypt = require('bcryptjs');
const UserModel = require('../models/userModel');

async function initializeDatabase() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Connection authenticated.');

    console.log('Running safe schema synchronization (no data loss)...');
    await sequelize.sync();
    console.log('✅ Schema tables and indexes verified successfully.');

    // Seed default admin if not present
    const adminEmail = process.env.ADMIN_EMAIL || 'heet@admin.com';
    const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || '123456';

    const existingAdmin = await UserModel.scope('withPassword').findOne({
      where: { email: adminEmail.trim().toLowerCase() },
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 12);
      await UserModel.create({
        email: adminEmail.trim().toLowerCase(),
        password: hashedPassword,
        role: 'admin',
        isGuestConverted: false,
      });
      console.log(`👤 Initial admin account created: ${adminEmail}`);
    } else {
      console.log(`👤 Admin account (${adminEmail}) already exists.`);
    }

    console.log('🎉 Database initialization complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  initializeDatabase();
}

module.exports = { initializeDatabase };
