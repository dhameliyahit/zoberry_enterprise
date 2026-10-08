/**
 * REST Routes for Payment Gateway Callbacks and Webhooks
 */

const express = require('express');
const router = express.Router();
const { verifyAndProcessPhonePePayment } = require('../services/payment/paymentService');
const phonepeConfig = require('../services/payment/phonepe/phonepeConfig');

/**
 * Handle PhonePe return / callback redirect.
 * Supported on both GET and POST (PhonePe redirects can be GET with query or POST).
 */
const handlePhonePeCallback = async (req, res) => {
  const merchantOrderId = req.query.merchantOrderId || req.body?.merchantOrderId;

  if (!merchantOrderId) {
    console.error('PhonePe callback missing merchantOrderId');
    return res.redirect(`${phonepeConfig.clientUrl}/?payment=missing_order`);
  }

  try {
    const result = await verifyAndProcessPhonePePayment(merchantOrderId);
    const orderNumber = result.order?.orderNumber;

    if (result.success && result.state === 'COMPLETED') {
      return res.redirect(`${phonepeConfig.clientUrl}/order/${orderNumber}?payment=success`);
    } else if (result.state === 'FAILED' || result.state === 'DECLINED' || result.state === 'TIMED_OUT' || result.state === 'AMOUNT_MISMATCH') {
      return res.redirect(`${phonepeConfig.clientUrl}/order/${orderNumber}?payment=failed&reason=${encodeURIComponent(result.message)}`);
    } else {
      return res.redirect(`${phonepeConfig.clientUrl}/order/${orderNumber}?payment=pending`);
    }
  } catch (error) {
    console.error('PhonePe callback processing error:', error.message);
    return res.redirect(`${phonepeConfig.clientUrl}/?payment=error&message=${encodeURIComponent(error.message)}`);
  }
};

router.get('/phonepe/callback', handlePhonePeCallback);
router.post('/phonepe/callback', handlePhonePeCallback);

module.exports = router;
