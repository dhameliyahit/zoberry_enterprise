/**
 * PhonePe Test/Sandbox Configuration Module
 * 
 * Safely loads PhonePe credentials and endpoint configuration from environment variables.
 * Never hardcodes production credentials.
 */

const { Env } = require('pg-sdk-node');

const PHONEPE_ENV = (process.env.PHONEPE_ENV || 'test').toLowerCase();
const isProduction = PHONEPE_ENV === 'production' || PHONEPE_ENV === 'live';

const phonepeConfig = {
  env: isProduction ? Env.PRODUCTION : Env.SANDBOX,
  clientId: process.env.PHONEPE_CLIENT_ID || '',
  clientSecret: process.env.PHONEPE_CLIENT_SECRET || '',
  clientVersion: parseInt(process.env.PHONEPE_CLIENT_VERSION || '1', 10),
  callbackUrl: process.env.PHONEPE_CALLBACK_URL || `${process.env.API_URL || 'http://localhost:9000'}/api/payment/phonepe/callback`,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  isTestMode: !isProduction,
  isConfigured: Boolean(process.env.PHONEPE_CLIENT_ID && process.env.PHONEPE_CLIENT_SECRET),
};

module.exports = phonepeConfig;
