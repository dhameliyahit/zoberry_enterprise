const { GraphQLError } = require('graphql');
const { OrderModel, PaymentModel, PaymentTransactionModel } = require('../../models');
const { requireAuth, requireOwnerOrAdmin } = require('../../helpers/authMiddleware');
const { initiateOrderPayment } = require('../../services/payment/paymentService');

const paymentResolvers = {
  Query: {
    getPaymentStatus: async (parent, { orderNumber }, context) => {
      if (!orderNumber || typeof orderNumber !== 'string') {
        throw new GraphQLError('Valid orderNumber is required.', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      const order = await OrderModel.findOne({
        where: { orderNumber: orderNumber.trim() },
        include: [{
          model: PaymentModel,
          as: 'payments',
          order: [['createdAt', 'DESC']],
          limit: 1,
        }],
      });

      if (!order) {
        throw new GraphQLError('Order not found.', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      // If registered customer order, enforce ownership
      if (order.userId && context?.user && context.user.role !== 'admin') {
        if (order.userId !== context.user.id) {
          throw new GraphQLError('You are not authorized to view this order.', {
            extensions: { code: 'FORBIDDEN' },
          });
        }
      }

      const latestPayment = order.payments?.[0] || null;

      let paymentStatus = order.paymentStatus;
      if (order.paymentStatus === 'PAID') {
        paymentStatus = 'SUCCESS';
      }

      return {
        orderNumber: order.orderNumber,
        paymentStatus,
        orderStatus: order.status,
        grandTotal: order.grandTotal,
        paidAt: latestPayment?.paidAt ? latestPayment.paidAt.toISOString() : null,
        providerPaymentId: latestPayment?.providerPaymentId || null,
        message:
          order.paymentStatus === 'PAID'
            ? 'Payment confirmed and verified.'
            : order.paymentStatus === 'FAILED'
            ? 'Payment attempt failed.'
            : 'Payment is pending verification.',
      };
    },

    getOrderPayments: async (parent, { orderId }, context) => {
      const order = await OrderModel.findByPk(orderId);
      if (!order) {
        throw new GraphQLError('Order not found.', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      if (order.userId) {
        requireOwnerOrAdmin(context, order.userId);
      } else {
        requireAuth(context);
      }

      return await PaymentModel.findAll({
        where: { orderId },
        order: [['createdAt', 'DESC']],
      });
    },
  },

  Mutation: {
    initiatePayment: async (parent, { orderNumber }, context) => {
      try {
        const result = await initiateOrderPayment({
          orderNumber,
          user: context?.user || null,
        });

        return {
          orderNumber: result.orderNumber,
          paymentId: result.paymentId,
          merchantOrderId: result.merchantOrderId,
          redirectUrl: result.redirectUrl,
          paymentStatus: result.paymentStatus,
          message: 'Payment initiated successfully.',
        };
      } catch (err) {
        console.error('Initiate payment error:', err.message);
        throw new GraphQLError(err.message || 'Failed to initiate payment.', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }
    },
  },
};

module.exports = paymentResolvers;
