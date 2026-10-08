const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ShipmentTrackingEventModel = sequelize.define('ShipmentTrackingEvent', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  shipmentId: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: 'Associated shipment ID',
  },
  status: {
    type: DataTypes.STRING(64),
    allowNull: false,
    comment: 'Status milestone e.g. PICKED_UP, IN_TRANSIT, OUT_FOR_DELIVERY',
  },
  location: {
    type: DataTypes.STRING(128),
    allowNull: true,
    comment: 'Hub or location name e.g. Mumbai Sorting Center',
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Human readable event summary',
  },
  eventTime: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false,
  },
  source: {
    type: DataTypes.STRING(32),
    defaultValue: 'SYSTEM',
    allowNull: false,
    comment: 'Origin of event e.g. ADMIN, SYSTEM, PROVIDER_WEBHOOK',
  },
  rawPayload: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Raw webhook / payload data',
  },
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['shipmentId'],
      name: 'tracking_events_shipment_id_index',
    },
    {
      fields: ['eventTime'],
      name: 'tracking_events_event_time_index',
    },
  ],
});

module.exports = ShipmentTrackingEventModel;
