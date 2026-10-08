require('dotenv').config();
const { sequelize } = require('../config/db');
const models = require('../models');

async function syncMissingColumns() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to MySQL database.');

    const queryInterface = sequelize.getQueryInterface();

    for (const [modelName, model] of Object.entries(models)) {
      if (!model.getTableName) continue;
      const tableName = model.getTableName();
      console.log(`Checking table: ${tableName}...`);

      let tableDefinition;
      try {
        tableDefinition = await queryInterface.describeTable(tableName);
      } catch (err) {
        console.log(`Table ${tableName} does not exist yet. Syncing...`);
        await model.sync();
        continue;
      }

      const rawAttributes = model.rawAttributes;

      for (const [attrName, attrDef] of Object.entries(rawAttributes)) {
        if (!tableDefinition[attrName]) {
          console.log(`➕ Adding missing column '${attrName}' to table '${tableName}'...`);
          try {
            await queryInterface.addColumn(tableName, attrName, attrDef);
            console.log(`✅ Added '${attrName}' to '${tableName}'.`);
          } catch (colErr) {
            console.error(`⚠️ Could not add column '${attrName}' to '${tableName}':`, colErr.message);
          }
        }
      }
    }

    console.log('🎉 All missing columns successfully synchronized with database!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  syncMissingColumns();
}

module.exports = { syncMissingColumns };
