/**
 * Centralized Promotion, Coupon & Pricing Rules Helper
 * 
 * Provides server-authoritative discount validation, integer-paise calculations,
 * concurrency-safe usage tracking, and immutable snapshotting.
 */

const { toPaise, fromPaise } = require('./moneyHelper');
const { PromotionModel, PromotionUsageModel, ProductModel } = require('../models');

/**
 * Normalizes a user-entered coupon code.
 * Strips accidental whitespace and converts to standard uppercase.
 * @param {string} code
 * @returns {string}
 */
function normalizeCouponCode(code) {
  if (!code || typeof code !== 'string') return '';
  return code.trim().toUpperCase();
}

/**
 * Validates promotion eligibility against current cart items, subtotal, and customer identity.
 * 
 * @param {Object} promotion - Sequelize Promotion instance or plain object
 * @param {Object} context
 * @param {Array<Object>} context.cartItems - Cart items with product/variant details
 * @param {number} context.subtotalPaise - Cart subtotal in paise
 * @param {Object} [context.user] - Authenticated user if logged in
 * @param {string} [context.guestEmail] - Guest email if provided
 * @param {Object} [context.transaction] - Optional database transaction
 * @returns {Promise<{ isValid: boolean, error?: string, eligibleItems: Array<Object>, eligibleSubtotalPaise: number }>}
 */
async function validatePromotionEligibility(promotion, context = {}) {
  const { cartItems = [], subtotalPaise = 0, user, guestEmail, transaction } = context;

  if (!promotion) {
    return { isValid: false, error: 'Invalid coupon code.' };
  }

  // 1. Check Active Status
  if (!promotion.isActive) {
    return { isValid: false, error: 'This coupon is no longer active.' };
  }

  const now = new Date();

  // 2. Check Start Date
  if (promotion.startsAt && new Date(promotion.startsAt) > now) {
    return { isValid: false, error: 'This coupon is not yet active.' };
  }

  // 3. Check Expiry Date
  if (promotion.endsAt && new Date(promotion.endsAt) < now) {
    return { isValid: false, error: 'This coupon has expired.' };
  }

  // 4. Check Minimum Subtotal Requirement
  const minSubtotalPaise = toPaise(promotion.minimumSubtotal || 0);
  if (minSubtotalPaise > 0 && subtotalPaise < minSubtotalPaise) {
    const minRs = fromPaise(minSubtotalPaise);
    return {
      isValid: false,
      error: `Minimum cart subtotal of Rs. ${minRs.toLocaleString()} required to use this coupon.`,
    };
  }

  // 5. Check Global Usage Limit
  if (promotion.usageLimit !== null && promotion.usageLimit !== undefined && promotion.usageLimit > 0) {
    if (promotion.usageCount >= promotion.usageLimit) {
      return { isValid: false, error: 'This coupon has reached its maximum global usage limit.' };
    }
  }

  // 6. Check Per-Customer Usage Limit
  const perCustomerLimit = promotion.perCustomerLimit || 1;
  if (user?.id) {
    const customerUsages = await PromotionUsageModel.count({
      where: {
        promotionId: promotion.id,
        userId: user.id,
      },
      transaction,
    });
    if (customerUsages >= perCustomerLimit) {
      return {
        isValid: false,
        error: `You have already redeemed this coupon the maximum allowed number of times (${perCustomerLimit}).`,
      };
    }
  } else if (guestEmail && guestEmail.trim()) {
    const guestUsages = await PromotionUsageModel.count({
      where: {
        promotionId: promotion.id,
        guestEmail: guestEmail.trim().toLowerCase(),
      },
      transaction,
    });
    if (guestUsages >= perCustomerLimit) {
      return {
        isValid: false,
        error: `This email address has already redeemed this coupon (${perCustomerLimit} max).`,
      };
    }
  }

  // 7. Check Product / Category Targeting
  const targetProductIds = Array.isArray(promotion.targetProductIds) ? promotion.targetProductIds : [];
  const targetCategoryIds = Array.isArray(promotion.targetCategoryIds) ? promotion.targetCategoryIds : [];
  const isTargeted = targetProductIds.length > 0 || targetCategoryIds.length > 0;

  let eligibleItems = cartItems;
  let eligibleSubtotalPaise = subtotalPaise;

  if (isTargeted) {
    eligibleItems = cartItems.filter((item) => {
      const prodId = item.productId || item.product?.id;
      const catId = item.product?.categoryId || item.categoryId;

      const matchesProduct = targetProductIds.length > 0 && targetProductIds.includes(prodId);
      const matchesCategory = targetCategoryIds.length > 0 && targetCategoryIds.includes(catId);

      return matchesProduct || matchesCategory;
    });

    if (eligibleItems.length === 0) {
      return {
        isValid: false,
        error: 'This coupon is not applicable to any of the items in your cart.',
      };
    }

    eligibleSubtotalPaise = 0;
    for (const item of eligibleItems) {
      const price = item.unitPrice !== undefined ? item.unitPrice : item.price || item.product?.price || 0;
      const qty = item.quantity || 1;
      eligibleSubtotalPaise += toPaise(price) * qty;
    }
  }

  return {
    isValid: true,
    eligibleItems,
    eligibleSubtotalPaise,
  };
}

/**
 * Calculates the exact discount amount in paise for an eligible promotion.
 * 
 * @param {Object} promotion
 * @param {number} eligibleSubtotalPaise
 * @param {number} totalSubtotalPaise
 * @returns {{ discountPaise: number, discountAmount: number }}
 */
function calculatePromotionDiscount(promotion, eligibleSubtotalPaise, totalSubtotalPaise) {
  let discountPaise = 0;

  if (promotion.discountType === 'PERCENTAGE') {
    const pct = Math.max(0, parseFloat(promotion.discountValue) || 0);
    discountPaise = Math.round((eligibleSubtotalPaise * pct) / 100);

    // Apply Maximum Discount Cap if specified
    if (promotion.maximumDiscount && Number(promotion.maximumDiscount) > 0) {
      const maxDiscountPaise = toPaise(promotion.maximumDiscount);
      discountPaise = Math.min(discountPaise, maxDiscountPaise);
    }
  } else if (promotion.discountType === 'FIXED_AMOUNT') {
    const fixedPaise = toPaise(promotion.discountValue);
    discountPaise = Math.min(eligibleSubtotalPaise, fixedPaise);
  }

  // Safety boundaries: Never exceed total subtotal, never negative
  discountPaise = Math.max(0, Math.min(discountPaise, totalSubtotalPaise));

  return {
    discountPaise,
    discountAmount: fromPaise(discountPaise),
  };
}

/**
 * Creates an immutable snapshot object of the applied promotion for long-term order history.
 * 
 * @param {Object} promotion
 * @param {number} discountAmount
 * @returns {Object}
 */
function createDiscountSnapshot(promotion, discountAmount) {
  return {
    promotionId: promotion.id,
    code: promotion.code || null,
    name: promotion.name,
    type: promotion.type,
    discountType: promotion.discountType,
    discountValue: promotion.discountValue,
    maximumDiscount: promotion.maximumDiscount || null,
    minimumSubtotal: promotion.minimumSubtotal || 0,
    actualDiscountAmount: discountAmount,
    appliedAt: new Date().toISOString(),
  };
}

/**
 * Atomically records promotion usage and increments the usage counter in the DB inside a transaction.
 * 
 * @param {Object} promotion
 * @param {Object} params
 * @param {string} [params.userId]
 * @param {string} [params.guestEmail]
 * @param {string} params.orderId
 * @param {number} params.discountAmount
 * @param {Object} params.transaction - Mandatory Sequelize transaction
 */
async function recordPromotionUsage(promotion, params) {
  const { userId, guestEmail, orderId, discountAmount, transaction } = params;

  if (!transaction) {
    throw new Error('Transaction is required to record promotion usage safely.');
  }

  // 1. Concurrency-safe atomic increment with lock verification
  const lockedPromotion = await PromotionModel.findByPk(promotion.id, {
    transaction,
    lock: transaction.LOCK.UPDATE,
  });

  if (!lockedPromotion) {
    throw new Error('Promotion record not found.');
  }

  if (lockedPromotion.usageLimit !== null && lockedPromotion.usageLimit !== undefined && lockedPromotion.usageLimit > 0) {
    if (lockedPromotion.usageCount >= lockedPromotion.usageLimit) {
      throw new Error('This promotion has just reached its global usage limit.');
    }
  }

  await lockedPromotion.increment('usageCount', { by: 1, transaction });

  // 2. Insert into PromotionUsageModel
  await PromotionUsageModel.create(
    {
      promotionId: promotion.id,
      userId: userId || null,
      guestEmail: guestEmail ? guestEmail.trim().toLowerCase() : null,
      orderId,
      discountAmount,
    },
    { transaction }
  );
}

module.exports = {
  normalizeCouponCode,
  validatePromotionEligibility,
  calculatePromotionDiscount,
  createDiscountSnapshot,
  recordPromotionUsage,
};
