const { GraphQLError } = require('graphql');
const { sequelize } = require('../../config/db');
const {
  OrderModel,
  OrderItemModel,
  CartModel,
  CartItemModel,
  AddressModel,
  ProductModel,
  ProductVariantModel,
} = require('../../models');
const { requireAuth, requireAdmin, requireOwnerOrAdmin } = require('../../helpers/authMiddleware');
const { calculateTotals, calculateLineTotal } = require('../../helpers/moneyHelper');
const {
  checkItemStockAndDetails,
  reserveStockForOrder,
  releaseStockForCancelledOrder,
} = require('../../helpers/inventoryHelper');
const {
  ORDER_STATUS,
  PAYMENT_STATUS,
  isValidOrderStatusTransition,
  isValidPaymentStatusTransition,
  generateOrderNumber,
} = require('../../helpers/orderStateMachine');
const { getOrCreateCartInstance, formatCartResponse } = require('./cart');

const orderResolvers = {
  Query: {
    getMyOrders: async (parent, args, context) => {
      const authUser = requireAuth(context);
      return await OrderModel.findAll({
        where: { userId: authUser.id },
        include: [{ model: OrderItemModel, as: 'items' }],
        order: [['createdAt', 'DESC']],
      });
    },

    getMyOrder: async (parent, { id }, context) => {
      const order = await OrderModel.findByPk(id, {
        include: [{ model: OrderItemModel, as: 'items' }],
      });

      if (!order) {
        throw new GraphQLError('Order not found.', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      if (order.userId) {
        requireOwnerOrAdmin(context, order.userId);
      }

      return order;
    },

    previewCheckout: async (parent, { guestSessionToken }, context) => {
      const cartInstance = await getOrCreateCartInstance(context, guestSessionToken);
      const cart = await formatCartResponse(cartInstance.id);

      const validationErrors = [];
      for (const item of cart.items) {
        if (!item.isAvailable) {
          validationErrors.push(
            `Item "${item.variant?.title || item.product.name}" is no longer available or is out of stock.`
          );
        } else if (item.quantity > item.availableStock) {
          validationErrors.push(
            `Item "${item.variant?.title || item.product.name}" only has ${item.availableStock} units available (requested: ${item.quantity}).`
          );
        }
      }

      return {
        items: cart.items,
        itemCount: cart.itemCount,
        subtotal: cart.subtotal,
        discountAmount: cart.discountAmount,
        shippingAmount: cart.shippingAmount,
        taxAmount: cart.taxAmount,
        grandTotal: cart.grandTotal,
        isReadyForCheckout: validationErrors.length === 0 && cart.items.length > 0,
        validationErrors,
      };
    },

    adminGetAllOrders: async (parent, { status, page = 1, limit = 50 }, context) => {
      requireAdmin(context);
      const sanitizedPage = Math.max(1, parseInt(page, 10) || 1);
      const sanitizedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
      const offset = (sanitizedPage - 1) * sanitizedLimit;

      const where = {};
      if (status) {
        where.status = status;
      }

      return await OrderModel.findAll({
        where,
        include: [{ model: OrderItemModel, as: 'items' }],
        order: [['createdAt', 'DESC']],
        limit: sanitizedLimit,
        offset,
      });
    },

    adminGetOrderById: async (parent, { id }, context) => {
      requireAdmin(context);
      const order = await OrderModel.findByPk(id, {
        include: [{ model: OrderItemModel, as: 'items' }],
      });

      if (!order) {
        throw new GraphQLError('Order not found.', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      return order;
    },
  },

  Mutation: {
    createOrderFromCart: async (parent, { input }, context) => {
      const {
        shippingAddressId,
        guestShippingAddress,
        guestEmail,
        guestPhone,
        guestSessionToken,
        idempotencyKey,
        notes,
      } = input;

      if (!idempotencyKey || typeof idempotencyKey !== 'string' || !idempotencyKey.trim()) {
        throw new GraphQLError('Idempotency key is required to create an order.', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      const cleanIdempotencyKey = idempotencyKey.trim();

      // 1. Check Idempotency: Return existing order if key was already submitted
      const existingOrder = await OrderModel.findOne({
        where: { idempotencyKey: cleanIdempotencyKey },
        include: [{ model: OrderItemModel, as: 'items' }],
      });

      if (existingOrder) {
        return existingOrder;
      }

      // 2. Resolve Shopping Cart
      const cartInstance = await getOrCreateCartInstance(context, guestSessionToken);
      const cartWithItems = await CartModel.findByPk(cartInstance.id, {
        include: [{ model: CartItemModel, as: 'items' }],
      });

      if (!cartWithItems || !cartWithItems.items || cartWithItems.items.length === 0) {
        throw new GraphQLError('Your shopping cart is empty. Add items before placing an order.', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      // 3. Resolve and snapshot shipping address
      let addressSnapshot = null;
      const isAuthUser = Boolean(context?.user?.id);

      if (isAuthUser) {
        let address = null;
        if (shippingAddressId) {
          address = await AddressModel.findOne({
            where: { id: shippingAddressId, userId: context.user.id },
          });
        } else {
          address = await AddressModel.findOne({
            where: { userId: context.user.id, isDefaultShipping: true },
          });
          if (!address) {
            address = await AddressModel.findOne({
              where: { userId: context.user.id },
            });
          }
        }

        if (!address) {
          throw new GraphQLError('Please provide a valid shipping address.', {
            extensions: { code: 'BAD_USER_INPUT' },
          });
        }

        addressSnapshot = {
          fullName: address.fullName,
          phone: address.phone,
          addressLine1: address.addressLine1,
          addressLine2: address.addressLine2,
          landmark: address.landmark,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
          country: address.country,
        };
      } else {
        if (!guestShippingAddress || !guestShippingAddress.fullName || !guestShippingAddress.phone || !guestShippingAddress.addressLine1 || !guestShippingAddress.city || !guestShippingAddress.state || !guestShippingAddress.postalCode) {
          throw new GraphQLError('Complete shipping address and contact phone are required for guest checkout.', {
            extensions: { code: 'BAD_USER_INPUT' },
          });
        }

        addressSnapshot = {
          fullName: guestShippingAddress.fullName.trim(),
          phone: guestShippingAddress.phone.trim(),
          addressLine1: guestShippingAddress.addressLine1.trim(),
          addressLine2: guestShippingAddress.addressLine2?.trim() || null,
          landmark: guestShippingAddress.landmark?.trim() || null,
          city: guestShippingAddress.city.trim(),
          state: guestShippingAddress.state.trim(),
          postalCode: guestShippingAddress.postalCode.trim(),
          country: (guestShippingAddress.country || 'IN').trim().toUpperCase(),
        };
      }

      // 4. Atomic Transaction: Validate stock, reserve inventory, create immutable order & order items
      return await sequelize.transaction(async (t) => {
        // Double-check idempotency key inside the transaction lock
        const lockedExisting = await OrderModel.findOne({
          where: { idempotencyKey: cleanIdempotencyKey },
          transaction: t,
          include: [{ model: OrderItemModel, as: 'items' }],
        });

        if (lockedExisting) {
          return lockedExisting;
        }

        const orderItemsToCreate = [];
        const calculationItems = [];

        // Validate items and compute totals authoritatively from database records
        for (const item of cartWithItems.items) {
          const details = await checkItemStockAndDetails(item.productId, item.variantId, t);

          if (details.availableStock < item.quantity) {
            throw new GraphQLError(
              `Insufficient stock for "${details.variantTitle || details.productName}". Available: ${details.availableStock}, Requested: ${item.quantity}`,
              { extensions: { code: 'BAD_USER_INPUT' } }
            );
          }

          const lineTotal = calculateLineTotal(details.price, item.quantity);

          calculationItems.push({
            price: details.price,
            quantity: item.quantity,
          });

          orderItemsToCreate.push({
            productId: item.productId,
            variantId: item.variantId || null,
            productName: details.productName,
            variantTitle: details.variantTitle,
            sku: details.sku,
            quantity: item.quantity,
            unitPrice: details.price,
            lineTotal,
            productImage: details.image,
            metadata: {},
          });
        }

        const totals = calculateTotals(calculationItems);
        const orderNumber = generateOrderNumber();

        // Create the Order record
        const createdOrder = await OrderModel.create({
          orderNumber,
          userId: isAuthUser ? context.user.id : null,
          guestEmail: guestEmail?.trim() || null,
          guestPhone: guestPhone?.trim() || addressSnapshot.phone,
          status: ORDER_STATUS.PENDING,
          paymentStatus: PAYMENT_STATUS.PENDING,
          currency: 'INR',
          subtotal: totals.subtotal,
          discountAmount: totals.discountAmount,
          shippingAmount: totals.shippingAmount,
          taxAmount: totals.taxAmount,
          grandTotal: totals.grandTotal,
          shippingAddressSnapshot: addressSnapshot,
          idempotencyKey: cleanIdempotencyKey,
          notes: notes?.trim() || null,
        }, { transaction: t });

        // Reserve stock and persist OrderItems
        for (const orderItem of orderItemsToCreate) {
          await reserveStockForOrder(
            orderItem.productId,
            orderItem.variantId,
            orderItem.quantity,
            createdOrder.id,
            t
          );

          await OrderItemModel.create({
            ...orderItem,
            orderId: createdOrder.id,
          }, { transaction: t });
        }

        // Mark cart as converted and clear active items
        cartWithItems.status = 'converted';
        await cartWithItems.save({ transaction: t });
        await CartItemModel.destroy({ where: { cartId: cartWithItems.id }, transaction: t });

        return await OrderModel.findByPk(createdOrder.id, {
          include: [{ model: OrderItemModel, as: 'items' }],
          transaction: t,
        });
      });
    },

    cancelOrder: async (parent, { orderId, reason }, context) => {
      const order = await OrderModel.findByPk(orderId, {
        include: [{ model: OrderItemModel, as: 'items' }],
      });

      if (!order) {
        throw new GraphQLError('Order not found.', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      if (order.userId) {
        requireOwnerOrAdmin(context, order.userId);
      }

      if (!isValidOrderStatusTransition(order.status, ORDER_STATUS.CANCELLED)) {
        throw new GraphQLError(
          `Cannot cancel order with current status "${order.status}".`,
          { extensions: { code: 'BAD_USER_INPUT' } }
        );
      }

      return await sequelize.transaction(async (t) => {
        // Restock reserved inventory
        for (const item of order.items) {
          await releaseStockForCancelledOrder(
            item.productId,
            item.variantId,
            item.quantity,
            order.id,
            t
          );
        }

        order.status = ORDER_STATUS.CANCELLED;
        order.cancelledReason = reason || 'Customer/Admin requested cancellation';
        await order.save({ transaction: t });

        return await OrderModel.findByPk(order.id, {
          include: [{ model: OrderItemModel, as: 'items' }],
          transaction: t,
        });
      });
    },

    adminUpdateOrderStatus: async (parent, { orderId, status, notes }, context) => {
      requireAdmin(context);

      const targetStatus = status.trim().toUpperCase();
      if (!Object.values(ORDER_STATUS).includes(targetStatus)) {
        throw new GraphQLError(`Invalid order status: "${status}".`, {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      const order = await OrderModel.findByPk(orderId, {
        include: [{ model: OrderItemModel, as: 'items' }],
      });

      if (!order) {
        throw new GraphQLError('Order not found.', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      if (!isValidOrderStatusTransition(order.status, targetStatus)) {
        throw new GraphQLError(
          `Illegal status transition from "${order.status}" to "${targetStatus}".`,
          { extensions: { code: 'BAD_USER_INPUT' } }
        );
      }

      return await sequelize.transaction(async (t) => {
        if (targetStatus === ORDER_STATUS.CANCELLED) {
          for (const item of order.items) {
            await releaseStockForCancelledOrder(
              item.productId,
              item.variantId,
              item.quantity,
              order.id,
              t
            );
          }
          order.cancelledReason = notes || 'Cancelled by administrator';
        }

        if (targetStatus === ORDER_STATUS.SHIPPED) {
          order.shippedAt = new Date();
        }

        if (targetStatus === ORDER_STATUS.DELIVERED) {
          order.deliveredAt = new Date();
        }

        order.status = targetStatus;
        if (notes) {
          order.notes = notes;
        }

        await order.save({ transaction: t });

        return await OrderModel.findByPk(order.id, {
          include: [{ model: OrderItemModel, as: 'items' }],
          transaction: t,
        });
      });
    },

    adminUpdatePaymentStatus: async (parent, { orderId, paymentStatus }, context) => {
      requireAdmin(context);

      const targetStatus = paymentStatus.trim().toUpperCase();
      if (!Object.values(PAYMENT_STATUS).includes(targetStatus)) {
        throw new GraphQLError(`Invalid payment status: "${paymentStatus}".`, {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      const order = await OrderModel.findByPk(orderId);
      if (!order) {
        throw new GraphQLError('Order not found.', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      if (!isValidPaymentStatusTransition(order.paymentStatus, targetStatus)) {
        throw new GraphQLError(
          `Illegal payment status transition from "${order.paymentStatus}" to "${targetStatus}".`,
          { extensions: { code: 'BAD_USER_INPUT' } }
        );
      }

      order.paymentStatus = targetStatus;
      await order.save();

      return await OrderModel.findByPk(order.id, {
        include: [{ model: OrderItemModel, as: 'items' }],
      });
    },
  },
};

module.exports = orderResolvers;
