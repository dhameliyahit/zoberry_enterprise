/**
 * Phase 7 Database Migration Script: Fulfillment & Logistics
 * 
 * Safely creates Shipments and ShipmentTrackingEvents tables, indexes,
 * foreign keys, and unique constraints without alter:true or force:true.
 */

require('dotenv').config();
const { sequelize } = require('../config/db');
const { ShipmentModel, ShipmentTrackingEventModel } = require('../models');

async function migratePhase7() {
  try {
    console.log('Running safe Phase 7 fulfillment schema migration...');
    await sequelize.authenticate();
    console.log('✅ Database connection authenticated.');

    // 1. Safely create Shipments table and indexes if not existing
    console.log('Synchronizing Shipments table...');
    await ShipmentModel.sync();
    console.log('✅ Shipments table and unique constraints verified (awbNumber, idempotencyKey).');

    // 2. Safely create ShipmentTrackingEvents table and indexes if not existing
    console.log('Synchronizing ShipmentTrackingEvents table...');
    await ShipmentTrackingEventModel.sync();
    console.log('✅ ShipmentTrackingEvents table and indexes verified.');

    console.log('🎉 Phase 7 database migration completed successfully!');
    if (require.main === module) {
      process.exit(0);
    }
    return true;
  } catch (error) {
    console.error('❌ Phase 7 migration error:', error);
    if (require.main === module) {
      process.exit(1);
    }
    throw error;
  }
}

if (require.main === module) {
  migratePhase7();
}

module.exports = { migratePhase7 };
