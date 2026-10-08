const { ProductModel, ProductVariantModel, InventoryMovementModel } = require('../models');
const { GraphQLError } = require('graphql');

/**
 * Checks available stock for a product or variant.
 * 
 * @param {string} productId
 * @param {string|null} [variantId]
 * @param {Object} [transaction]
 * @returns {Promise<{ availableStock: number, name: string, price: number, sku: string, image: string }>}
 */
async function checkItemStockAndDetails(productId, variantId = null, transaction = null) {
  const options = transaction ? { transaction } : {};

  if (variantId) {
    const variant = await ProductVariantModel.findByPk(variantId, {
      ...options,
      include: [{ model: ProductModel, as: 'product' }],
    });

    if (!variant || !variant.isActive) {
      throw new GraphQLError('The requested product variant is not available.', {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    }

    if (!variant.product || !variant.product.isActive) {
      throw new GraphQLError('The parent product is currently unavailable.', {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    }

    const firstImage = variant.product.images?.[0] || null;

    return {
      availableStock: variant.stockQuantity,
      productName: variant.product.name,
      variantTitle: variant.title,
      price: variant.price,
      sku: variant.sku,
      image: firstImage,
      modelInstance: variant,
      isVariant: true,
    };
  }

  const product = await ProductModel.findByPk(productId, options);
  if (!product || !product.isActive) {
    throw new GraphQLError('The requested product is currently unavailable.', {
      extensions: { code: 'BAD_USER_INPUT' },
    });
  }

  const firstImage = product.images?.[0] || null;

  return {
    availableStock: product.stockQuantity,
    productName: product.name,
    variantTitle: null,
    price: product.price,
    sku: `ZB-PRD-${product.id.slice(0, 8).toUpperCase()}`,
    image: firstImage,
    modelInstance: product,
    isVariant: false,
  };
}

/**
 * Atomically decrements stock for an order reservation within a transaction.
 * Ensures stock cannot become negative and handles concurrency cleanly.
 * 
 * @param {string} productId
 * @param {string|null} variantId
 * @param {number} quantity
 * @param {string} orderId
 * @param {Object} transaction - Sequelize transaction object
 */
async function reserveStockForOrder(productId, variantId, quantity, orderId, transaction) {
  if (!transaction) {
    throw new Error('Transaction is required for stock reservation.');
  }

  const qty = parseInt(quantity, 10);
  if (qty <= 0) {
    throw new GraphQLError('Invalid reservation quantity.', {
      extensions: { code: 'BAD_USER_INPUT' },
    });
  }

  if (variantId) {
    // Row lock on variant to prevent race conditions during concurrent checkouts
    const variant = await ProductVariantModel.findByPk(variantId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!variant || !variant.isActive) {
      throw new GraphQLError('Product variant is no longer available.', {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    }

    if (variant.stockQuantity < qty) {
      throw new GraphQLError(
        `Insufficient stock for "${variant.title}". Available: ${variant.stockQuantity}, Requested: ${qty}`,
        { extensions: { code: 'BAD_USER_INPUT' } }
      );
    }

    const newBalance = variant.stockQuantity - qty;
    variant.stockQuantity = newBalance;
    await variant.save({ transaction });

    // Record inventory audit movement
    await InventoryMovementModel.create({
      productId,
      variantId,
      quantityChange: -qty,
      type: 'CHECKOUT_RESERVATION',
      referenceType: 'ORDER',
      referenceId: String(orderId),
      balanceAfter: newBalance,
      notes: `Reserved for Order ID ${orderId}`,
    }, { transaction });

    return newBalance;
  }

  // Row lock on product
  const product = await ProductModel.findByPk(productId, {
    transaction,
    lock: transaction.LOCK.UPDATE,
  });

  if (!product || !product.isActive) {
    throw new GraphQLError('Product is no longer available.', {
      extensions: { code: 'BAD_USER_INPUT' },
    });
  }

  if (product.stockQuantity < qty) {
    throw new GraphQLError(
      `Insufficient stock for "${product.name}". Available: ${product.stockQuantity}, Requested: ${qty}`,
      { extensions: { code: 'BAD_USER_INPUT' } }
    );
  }

  const newBalance = product.stockQuantity - qty;
  product.stockQuantity = newBalance;
  await product.save({ transaction });

  // Record inventory audit movement
  await InventoryMovementModel.create({
    productId,
    variantId: null,
    quantityChange: -qty,
    type: 'CHECKOUT_RESERVATION',
    referenceType: 'ORDER',
    referenceId: String(orderId),
    balanceAfter: newBalance,
    notes: `Reserved for Order ID ${orderId}`,
  }, { transaction });

  return newBalance;
}

/**
 * Restocks inventory if an order is cancelled.
 * 
 * @param {string} productId
 * @param {string|null} variantId
 * @param {number} quantity
 * @param {string} orderId
 * @param {Object} transaction
 */
async function releaseStockForCancelledOrder(productId, variantId, quantity, orderId, transaction) {
  if (!transaction) {
    throw new Error('Transaction is required for stock release.');
  }

  const qty = parseInt(quantity, 10);
  if (qty <= 0) return;

  if (variantId) {
    const variant = await ProductVariantModel.findByPk(variantId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (variant) {
      const newBalance = variant.stockQuantity + qty;
      variant.stockQuantity = newBalance;
      await variant.save({ transaction });

      await InventoryMovementModel.create({
        productId,
        variantId,
        quantityChange: qty,
        type: 'ORDER_CANCELLATION_RESTOCK',
        referenceType: 'ORDER',
        referenceId: String(orderId),
        balanceAfter: newBalance,
        notes: `Restocked after Order ID ${orderId} cancellation`,
      }, { transaction });
    }
    return;
  }

  const product = await ProductModel.findByPk(productId, {
    transaction,
    lock: transaction.LOCK.UPDATE,
  });

  if (product) {
    const newBalance = product.stockQuantity + qty;
    product.stockQuantity = newBalance;
    await product.save({ transaction });

    await InventoryMovementModel.create({
      productId,
      variantId: null,
      quantityChange: qty,
      type: 'ORDER_CANCELLATION_RESTOCK',
      referenceType: 'ORDER',
      referenceId: String(orderId),
      balanceAfter: newBalance,
      notes: `Restocked after Order ID ${orderId} cancellation`,
    }, { transaction });
  }
}

module.exports = {
  checkItemStockAndDetails,
  reserveStockForOrder,
  releaseStockForCancelledOrder,
};
