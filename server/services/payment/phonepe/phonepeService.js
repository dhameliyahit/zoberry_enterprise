/**
 * PhonePe Gateway Adapter (Standard Checkout SDK)
 * 
 * Interacts with PhonePe pg-sdk-node for initiating payments and verifying order status.
 */

const { StandardCheckoutClient, StandardCheckoutPayRequest } = require('pg-sdk-node');
const phonepeConfig = require('./phonepeConfig');

let clientInstance = null;

function getClient() {
  if (!clientInstance) {
    clientInstance = StandardCheckoutClient.getInstance(
      phonepeConfig.clientId,
      phonepeConfig.clientSecret,
      phonepeConfig.clientVersion,
      phonepeConfig.env
    );
  }
  return clientInstance;
}

/**
 * Initiates standard PhonePe checkout payment.
 * 
 * @param {Object} params
 * @param {string} params.merchantOrderId - Unique merchant transaction ID (e.g. UUID)
 * @param {number} params.amountPaise - Order payable amount in integer paise
 * @param {string} [params.redirectUrl] - Server callback redirect URL
 * @returns {Promise<{ redirectUrl: string, rawResponse: Object }>}
 */
async function initiatePhonePePayment({ merchantOrderId, amountPaise, redirectUrl }) {
  if (!merchantOrderId || !amountPaise) {
    throw new Error('merchantOrderId and amountPaise are required to initiate PhonePe payment.');
  }

  const callbackRedirectUrl = redirectUrl || `${phonepeConfig.callbackUrl}?merchantOrderId=${encodeURIComponent(merchantOrderId)}`;

  try {
    const client = getClient();
    const payload = StandardCheckoutPayRequest.builder()
      .merchantOrderId(merchantOrderId)
      .amount(amountPaise)
      .redirectUrl(callbackRedirectUrl)
      .build();

    const response = await client.pay(payload);

    return {
      redirectUrl: response?.redirectUrl || null,
      rawResponse: response,
    };
  } catch (error) {
    console.error('PhonePe SDK Pay Error:', error.message);
    throw new Error(`PhonePe payment initiation failed: ${error.message}`);
  }
}

/**
 * Fetches authoritative payment status directly from PhonePe server.
 * 
 * @param {string} merchantOrderId
 * @returns {Promise<{ state: string, amount: number, transactionId: string|null, rawResponse: Object }>}
 */
async function getPhonePeOrderStatus(merchantOrderId) {
  if (!merchantOrderId) {
    throw new Error('merchantOrderId is required to check PhonePe order status.');
  }

  try {
    const client = getClient();
    const response = await client.getOrderStatus(merchantOrderId);

    return {
      state: response?.state || 'UNKNOWN',
      amount: response?.amount || null,
      transactionId: response?.transactionId || response?.providerReferenceId || null,
      rawResponse: response,
    };
  } catch (error) {
    console.error('PhonePe SDK GetOrderStatus Error:', error.message);
    throw new Error(`PhonePe status verification failed: ${error.message}`);
  }
}

module.exports = {
  getClient,
  initiatePhonePePayment,
  getPhonePeOrderStatus,
};
