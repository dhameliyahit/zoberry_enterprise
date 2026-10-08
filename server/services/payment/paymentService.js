/**
 * Zoberry Centralized Payment Orchestration Service
 * 
 * Manages payment lifecycle, server-authoritative amount validation,
 * PhonePe SDK interactions, inventory reservation/release on failure,
 * and immutable state tracking with atomic database transactions.
 */

const { randomUUID } = require('crypto');
const { sequelize } = require('../../config/db');
const {
  OrderModel,
  OrderItemModel,
  PaymentModel,
  PaymentTransactionModel,
} = require('../../models');
const { toPaise, fromPaise } = require('../../helpers/moneyHelper');
const {
  ORDER_STATUS,
  PAYMENT_STATUS,
  isValidPaymentStatusTransition,
  isValidOrderStatusTransition,
} = require('../../helpers/orderStateMachine');
const { releaseStockForCancelledOrder } = require('../../helpers/inventoryHelper');
const { initiatePhonePePayment, getPhonePeOrderStatus } = require('./phonepe/phonepeService');
const phonepeConfig = require('./phonepe/phonepeConfig');

// Payment attempt TTL: 15 minutes
const PAYMENT_EXPIRY_MS = 15 * 60 * 1000;

/**
 * Initiates payment for a Zoberry order.
 * 
 * @param {Object} params
 * @param {string} params.orderNumber
 * @param {Object} [params.user] - Authenticated user context
 * @returns {Promise<{ orderNumber: string, paymentId: string, merchantOrderId: string, redirectUrl: string, paymentStatus: string }>}
 */
async function initiateOrderPayment({ orderNumber, user }) {
  if (!orderNumber || typeof orderNumber !== 'string') {
    throw new Error('Valid orderNumber is required to initiate payment.');
  }

  const order = await OrderModel.findOne({
    where: { orderNumber: orderNumber.trim() },
    include: [{ model: OrderItemModel, as: 'items' }],
  });

  if (!order) {
    throw new Error(`Order "${orderNumber}" not found.`);
  }

  // Enforce customer ownership if order belongs to a registered user
  if (order.userId && user && user.role !== 'admin' && order.userId !== user.id) {
    throw new Error('You are not authorized to initiate payment for this order.');
  }

  // Validate Order Status
  if (order.status === ORDER_STATUS.CANCELLED) {
    throw new Error('Cannot initiate payment for a cancelled order.');
  }

  if (order.paymentStatus === PAYMENT_STATUS.PAID) {
    throw new Error('This order has already been paid successfully.');
  }

  const amountPaise = toPaise(order.grandTotal);
  if (amountPaise <= 0) {
    throw new Error('Order amount must be greater than zero.');
  }

  // Check for existing unexpired pending payment attempt to prevent duplicates (Idempotency)
  const existingPendingPayment = await PaymentModel.findOne({
    where: {
      orderId: order.id,
      status: 'INITIATED',
    },
    order: [['createdAt', 'DESC']],
  });

  if (existingPendingPayment && existingPendingPayment.expiresAt > new Date() && existingPendingPayment.redirectUrl) {
    return {
      orderNumber: order.orderNumber,
      paymentId: existingPendingPayment.id,
      merchantOrderId: existingPendingPayment.merchantOrderId,
      redirectUrl: existingPendingPayment.redirectUrl,
      paymentStatus: existingPendingPayment.status,
    };
  }

  // Generate unique merchantOrderId (UUID v4)
  const merchantOrderId = randomUUID();
  const expiresAt = new Date(Date.now() + PAYMENT_EXPIRY_MS);

  // 1. Initiate PhonePe transaction via SDK
  const redirectUrlCallback = `${phonepeConfig.callbackUrl}?merchantOrderId=${encodeURIComponent(merchantOrderId)}`;
  const phonepeResult = await initiatePhonePePayment({
    merchantOrderId,
    amountPaise,
    redirectUrl: redirectUrlCallback,
  });

  // 2. Persist Payment and initial PaymentTransaction inside a DB transaction
  const payment = await sequelize.transaction(async (t) => {
    const createdPayment = await PaymentModel.create({
      orderId: order.id,
      merchantOrderId,
      provider: 'PHONEPE',
      amount: order.grandTotal,
      currency: 'INR',
      status: 'INITIATED',
      redirectUrl: phonepeResult.redirectUrl,
      expiresAt,
      rawResponse: phonepeResult.rawResponse || null,
    }, { transaction: t });

    await PaymentTransactionModel.create({
      paymentId: createdPayment.id,
      transactionReference: merchantOrderId,
      eventType: 'INITIATE',
      status: 'INITIATED',
      responseCode: 'INITIATED',
      metadata: {
        orderNumber: order.orderNumber,
        amountPaise,
        redirectUrl: phonepeResult.redirectUrl,
      },
    }, { transaction: t });

    return createdPayment;
  });

  return {
    orderNumber: order.orderNumber,
    paymentId: payment.id,
    merchantOrderId: payment.merchantOrderId,
    redirectUrl: payment.redirectUrl,
    paymentStatus: payment.status,
  };
}

/**
 * Server-to-server verification and atomic state update for PhonePe payments.
 * NEVER trusts client-side status. Authoritatively calls PhonePe getOrderStatus.
 * 
 * @param {string} merchantOrderId
 * @returns {Promise<{ success: boolean, order: Object, payment: Object, state: string, message: string }>}
 */
async function verifyAndProcessPhonePePayment(merchantOrderId) {
  if (!merchantOrderId || typeof merchantOrderId !== 'string') {
    throw new Error('Valid merchantOrderId is required.');
  }

  const payment = await PaymentModel.findOne({
    where: { merchantOrderId: merchantOrderId.trim() },
    include: [{
      model: OrderModel,
      as: 'order',
      include: [{ model: OrderItemModel, as: 'items' }],
    }],
  });

  if (!payment || !payment.order) {
    throw new Error(`Payment record not found for merchantOrderId "${merchantOrderId}".`);
  }

  const order = payment.order;

  // 1. Authoritative Server-to-Server status check from PhonePe
  const statusResult = await getPhonePeOrderStatus(merchantOrderId);
  const phonepeState = (statusResult.state || '').toUpperCase();

  // 2. Atomic state transition within DB transaction
  return await sequelize.transaction(async (t) => {
    // Lock payment row to prevent race conditions with duplicate webhooks / redirects
    const lockedPayment = await PaymentModel.findByPk(payment.id, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    const lockedOrder = await OrderModel.findByPk(order.id, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    // Idempotency: If already completed successfully, return current state safely
    if (lockedPayment.status === 'SUCCESS' && lockedOrder.paymentStatus === PAYMENT_STATUS.PAID) {
      return {
        success: true,
        order: lockedOrder,
        payment: lockedPayment,
        state: 'COMPLETED',
        message: 'Payment was already verified and confirmed.',
      };
    }

    if (phonepeState === 'COMPLETED') {
      // Amount verification: verify PhonePe returned amount matches order grandTotal in paise
      const expectedPaise = toPaise(lockedOrder.grandTotal);
      if (statusResult.amount && Number(statusResult.amount) !== expectedPaise) {
        console.error(
          `[SECURITY ALERT] Payment amount mismatch for Order ${lockedOrder.orderNumber}! Expected: ${expectedPaise}, Received: ${statusResult.amount}`
        );

        lockedPayment.status = 'FAILED';
        lockedPayment.providerResponseCode = 'AMOUNT_MISMATCH';
        lockedPayment.rawResponse = statusResult.rawResponse || null;
        await lockedPayment.save({ transaction: t });

        await PaymentTransactionModel.create({
          paymentId: lockedPayment.id,
          transactionReference: statusResult.transactionId || merchantOrderId,
          eventType: 'VERIFICATION_REJECTED',
          status: 'FAILED',
          responseCode: 'AMOUNT_MISMATCH',
          metadata: { expectedPaise, receivedAmount: statusResult.amount },
        }, { transaction: t });

        return {
          success: false,
          order: lockedOrder,
          payment: lockedPayment,
          state: 'AMOUNT_MISMATCH',
          message: 'Payment verification failed due to amount mismatch.',
        };
      }

      // Mark Payment as SUCCESS
      lockedPayment.status = 'SUCCESS';
      lockedPayment.providerPaymentId = statusResult.transactionId || null;
      lockedPayment.providerResponseCode = 'COMPLETED';
      lockedPayment.paidAt = new Date();
      lockedPayment.rawResponse = statusResult.rawResponse || null;
      await lockedPayment.save({ transaction: t });

      // Mark Order as PAID & CONFIRMED
      lockedOrder.paymentStatus = PAYMENT_STATUS.PAID;
      if (lockedOrder.status === ORDER_STATUS.PENDING) {
        lockedOrder.status = ORDER_STATUS.CONFIRMED;
      }
      await lockedOrder.save({ transaction: t });

      // Record transaction event
      await PaymentTransactionModel.create({
        paymentId: lockedPayment.id,
        transactionReference: statusResult.transactionId || merchantOrderId,
        eventType: 'STATUS_VERIFY',
        status: 'SUCCESS',
        responseCode: 'COMPLETED',
        metadata: statusResult.rawResponse || {},
      }, { transaction: t });

      return {
        success: true,
        order: lockedOrder,
        payment: lockedPayment,
        state: 'COMPLETED',
        message: 'Payment verified successfully.',
      };
    } else if (phonepeState === 'FAILED' || phonepeState === 'DECLINED' || phonepeState === 'TIMED_OUT') {
      // Do not regress if already SUCCESS
      if (lockedPayment.status !== 'SUCCESS') {
        lockedPayment.status = 'FAILED';
        lockedPayment.providerResponseCode = phonepeState;
        lockedPayment.rawResponse = statusResult.rawResponse || null;
        await lockedPayment.save({ transaction: t });

        lockedOrder.paymentStatus = PAYMENT_STATUS.FAILED;
        await lockedOrder.save({ transaction: t });

        await PaymentTransactionModel.create({
          paymentId: lockedPayment.id,
          transactionReference: statusResult.transactionId || merchantOrderId,
          eventType: 'STATUS_VERIFY',
          status: 'FAILED',
          responseCode: phonepeState,
          metadata: statusResult.rawResponse || {},
        }, { transaction: t });
      }

      return {
        success: false,
        order: lockedOrder,
        payment: lockedPayment,
        state: phonepeState,
        message: `Payment failed with status: ${phonepeState}`,
      };
    } else {
      // PENDING / IN_PROGRESS
      return {
        success: false,
        order: lockedOrder,
        payment: lockedPayment,
        state: phonepeState || 'PENDING',
        message: 'Payment is currently pending verification.',
      };
    }
  });
}

/**
 * Sweeps and cancels stale unpaid orders whose payment attempts have expired (TTL).
 * Releases reserved inventory back to products/variants.
 */
async function expireStaleUnpaidOrders() {
  const expiredPayments = await PaymentModel.findAll({
    where: {
      status: 'INITIATED',
      expiresAt: { [sequelize.Sequelize.Op.lt]: new Date() },
    },
    include: [{
      model: OrderModel,
      as: 'order',
      where: {
        paymentStatus: PAYMENT_STATUS.PENDING,
        status: ORDER_STATUS.PENDING,
      },
      include: [{ model: OrderItemModel, as: 'items' }],
    }],
  });

  for (const payment of expiredPayments) {
    const order = payment.order;
    if (!order) continue;

    try {
      await sequelize.transaction(async (t) => {
        payment.status = 'EXPIRED';
        payment.providerResponseCode = 'TTL_EXPIRED';
        await payment.save({ transaction: t });

        order.status = ORDER_STATUS.CANCELLED;
        order.paymentStatus = PAYMENT_STATUS.FAILED;
        order.cancelledReason = 'Payment attempt timed out / expired.';
        await order.save({ transaction: t });

        // Release stock for each item in the cancelled order
        if (Array.isArray(order.items)) {
          for (const item of order.items) {
            await releaseStockForCancelledOrder(
              item.productId,
              item.variantId,
              item.quantity,
              order.id,
              t
            );
          }
        }

        await PaymentTransactionModel.create({
          paymentId: payment.id,
          transactionReference: payment.merchantOrderId,
          eventType: 'EXPIRE',
          status: 'EXPIRED',
          responseCode: 'TTL_EXPIRED',
          metadata: { orderNumber: order.orderNumber },
        }, { transaction: t });
      });
    } catch (err) {
      console.error(`Error expiring order ${order.orderNumber}:`, err.message);
    }
  }
}

module.exports = {
  PAYMENT_EXPIRY_MS,
  initiateOrderPayment,
  verifyAndProcessPhonePePayment,
  expireStaleUnpaidOrders,
};
