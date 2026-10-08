/**
 * Zoberry Single Server-Authoritative Checkout Pricing Engine
 * 
 * Centralized, deterministic, integer-paise financial calculation service for:
 * 1. Merchandise subtotal
 * 2. Promotions & coupon discounts (with caps and item targeting)
 * 3. Shipping method rates & free-shipping threshold
 * 4. Tax calculation (standard tax-inclusive consumer pricing or tax-exclusive)
 * 5. Final grand total
 * 6. Immutable snapshots for order history
 */

const { toPaise, fromPaise } = require('./moneyHelper');
const {
  PromotionModel,
  ShippingMethodModel,
  TaxRuleModel,
} = require('../models');
const {
  normalizeCouponCode,
  validatePromotionEligibility,
  calculatePromotionDiscount,
  createDiscountSnapshot,
} = require('./promotionHelper');

// Standard Fallback Shipping Methods if database table is empty
const DEFAULT_SHIPPING_METHODS = [
  {
    code: 'STANDARD',
    name: 'Standard Delivery',
    description: 'Safe and reliable ground shipping to your doorstep',
    price: 99.00,
    freeThreshold: 999.00,
    estimatedDays: '3 - 5 business days',
    isActive: true,
    priority: 10,
  },
  {
    code: 'EXPRESS',
    name: 'Express Priority Delivery',
    description: 'Expedited courier priority dispatch',
    price: 199.00,
    freeThreshold: null,
    estimatedDays: '1 - 2 business days',
    isActive: true,
    priority: 20,
  },
];

// Standard Fallback Tax Rule (GST Tax-Inclusive consumer model)
const DEFAULT_TAX_RULE = {
  name: 'Standard GST',
  ratePercent: 5.00, // 5% standard apparel/merchandise GST
  isInclusive: true, // Consumer catalog prices already include tax
  isActive: true,
  country: 'IN',
};

/**
 * Fetches all active shipping methods from DB or returns defaults.
 * @returns {Promise<Array<Object>>}
 */
async function getActiveShippingMethods() {
  try {
    const methods = await ShippingMethodModel.findAll({
      where: { isActive: true },
      order: [['priority', 'ASC'], ['createdAt', 'ASC']],
    });

    if (methods && methods.length > 0) {
      return methods.map((m) => m.toJSON());
    }
  } catch (err) {
    // Fallback if table not yet initialized
  }
  return DEFAULT_SHIPPING_METHODS;
}

/**
 * Evaluates and returns all available shipping methods with real-time computed
 * pricing and free-shipping eligibility based on the current subtotal.
 * 
 * @param {Object} params
 * @param {number} params.eligibleSubtotal - Subtotal after discounts in INR
 * @param {string} [params.postalCode] - Optional destination pincode
 * @returns {Promise<Array<Object>>}
 */
async function getAvailableShippingMethods({ eligibleSubtotal = 0, postalCode = null }) {
  const activeMethods = await getActiveShippingMethods();
  const eligibleSubtotalPaise = toPaise(eligibleSubtotal);

  return activeMethods.map((method) => {
    let feePaise = toPaise(method.price);
    let isFree = false;

    if (method.freeThreshold !== null && method.freeThreshold !== undefined && Number(method.freeThreshold) > 0) {
      const thresholdPaise = toPaise(method.freeThreshold);
      if (eligibleSubtotalPaise >= thresholdPaise) {
        feePaise = 0;
        isFree = true;
      }
    }

    return {
      id: method.id || method.code,
      code: method.code,
      name: method.name,
      description: method.description,
      basePrice: method.price,
      actualPrice: fromPaise(feePaise),
      freeThreshold: method.freeThreshold,
      isFree,
      estimatedDays: method.estimatedDays,
      isActive: method.isActive,
    };
  });
}

/**
 * Fetches the active tax rule for the checkout calculation.
 * @returns {Promise<Object>}
 */
async function getActiveTaxRule() {
  try {
    const rule = await TaxRuleModel.findOne({
      where: { isActive: true },
      order: [['createdAt', 'DESC']],
    });

    if (rule) {
      return rule.toJSON();
    }
  } catch (err) {
    // Fallback if table not yet initialized
  }
  return DEFAULT_TAX_RULE;
}

/**
 * Calculates complete, server-authoritative checkout totals.
 * 
 * @param {Object} params
 * @param {Array<Object>} params.items - Cart or Order items
 * @param {string} [params.shippingMethodCode='STANDARD'] - Selected shipping method code
 * @param {string} [params.couponCode] - User entered coupon code
 * @param {Object} [params.user] - Authenticated user context
 * @param {string} [params.guestEmail] - Guest email if checking out as guest
 * @param {string} [params.postalCode] - Destination postal code
 * @param {Object} [params.transaction] - Optional database transaction
 * @returns {Promise<Object>}
 */
async function calculateCheckoutTotals(params = {}) {
  const {
    items = [],
    shippingMethodCode = 'STANDARD',
    couponCode = null,
    user = null,
    guestEmail = null,
    postalCode = null,
    transaction = null,
  } = params;

  // 1. Calculate merchandise subtotal strictly in integer paise
  let subtotalPaise = 0;
  const lineItemsBreakdown = [];

  for (const item of items) {
    const rawPrice = item.unitPrice !== undefined ? item.unitPrice : item.price || item.product?.price || 0;
    const pricePaise = toPaise(rawPrice);
    const quantity = Math.max(0, parseInt(item.quantity, 10) || 0);
    const lineTotalPaise = pricePaise * quantity;

    subtotalPaise += lineTotalPaise;
    lineItemsBreakdown.push({
      ...item,
      unitPricePaise: pricePaise,
      quantity,
      lineTotalPaise,
    });
  }

  // 2. Evaluate Coupon / Promotion if provided
  let discountPaise = 0;
  let appliedPromotion = null;
  let appliedCouponCode = null;
  let discountSnapshot = null;
  let couponMessage = null;

  if (couponCode && typeof couponCode === 'string' && couponCode.trim()) {
    appliedCouponCode = normalizeCouponCode(couponCode);
    const promotion = await PromotionModel.findOne({
      where: { code: appliedCouponCode },
      transaction,
    });

    if (promotion) {
      const eligibility = await validatePromotionEligibility(promotion, {
        cartItems: items,
        subtotalPaise,
        user,
        guestEmail,
        transaction,
      });

      if (eligibility.isValid) {
        const discountResult = calculatePromotionDiscount(
          promotion,
          eligibility.eligibleSubtotalPaise,
          subtotalPaise
        );
        discountPaise = discountResult.discountPaise;
        appliedPromotion = promotion;
        discountSnapshot = createDiscountSnapshot(promotion, discountResult.discountAmount);
        couponMessage = `Coupon "${appliedCouponCode}" applied: Saved Rs. ${discountResult.discountAmount}`;
      } else {
        couponMessage = eligibility.error || 'Coupon is not eligible for this order.';
      }
    } else {
      couponMessage = `Coupon "${appliedCouponCode}" is invalid.`;
    }
  }

  // 3. Eligible Merchandise Subtotal for Free Shipping & Tax
  const eligibleMerchandiseSubtotalPaise = Math.max(0, subtotalPaise - discountPaise);

  // 4. Calculate Shipping Method & Fee
  const availableMethods = await getAvailableShippingMethods({
    eligibleSubtotal: fromPaise(eligibleMerchandiseSubtotalPaise),
    postalCode,
  });

  const selectedCode = (shippingMethodCode || 'STANDARD').trim().toUpperCase();
  let selectedMethod = availableMethods.find((m) => m.code === selectedCode);

  if (!selectedMethod) {
    selectedMethod = availableMethods[0] || {
      code: 'STANDARD',
      name: 'Standard Delivery',
      actualPrice: 99.00,
      isFree: false,
      estimatedDays: '3 - 5 business days',
    };
  }

  const shippingPaise = toPaise(selectedMethod.actualPrice);

  const shippingSnapshot = {
    code: selectedMethod.code,
    name: selectedMethod.name,
    basePrice: selectedMethod.basePrice || selectedMethod.actualPrice,
    actualShippingFee: selectedMethod.actualPrice,
    freeThreshold: selectedMethod.freeThreshold || null,
    isFree: selectedMethod.isFree,
    estimatedDays: selectedMethod.estimatedDays || null,
  };

  // 5. Calculate Tax Breakdown (Standard Consumer Tax-Inclusive Model)
  const taxRule = await getActiveTaxRule();
  const taxRate = parseFloat(taxRule.ratePercent) || 0;
  let taxPaise = 0;

  if (taxRate > 0) {
    if (taxRule.isInclusive) {
      // In tax-inclusive catalog pricing, tax is already inside the eligible merchandise subtotal
      // Formula: Tax = TaxableSubtotal - (TaxableSubtotal / (1 + Rate))
      taxPaise = Math.round((eligibleMerchandiseSubtotalPaise * taxRate) / (100 + taxRate));
    } else {
      // In tax-exclusive pricing, tax adds on top of eligible subtotal
      taxPaise = Math.round((eligibleMerchandiseSubtotalPaise * taxRate) / 100);
    }
  }

  const taxSnapshot = {
    name: taxRule.name,
    ratePercent: taxRate,
    isInclusive: taxRule.isInclusive,
    taxAmount: fromPaise(taxPaise),
  };

  // 6. Calculate Final Grand Total
  let grandTotalPaise = 0;
  if (taxRule.isInclusive) {
    // Grand Total = (Subtotal - Discount) + Shipping
    grandTotalPaise = Math.max(0, eligibleMerchandiseSubtotalPaise + shippingPaise);
  } else {
    // Grand Total = (Subtotal - Discount) + Shipping + Tax
    grandTotalPaise = Math.max(0, eligibleMerchandiseSubtotalPaise + shippingPaise + taxPaise);
  }

  return {
    subtotal: fromPaise(subtotalPaise),
    discountAmount: fromPaise(discountPaise),
    shippingAmount: fromPaise(shippingPaise),
    taxAmount: fromPaise(taxPaise),
    grandTotal: fromPaise(grandTotalPaise),
    couponCode: appliedPromotion ? appliedCouponCode : null,
    couponMessage,
    discountSnapshot,
    shippingMethod: selectedMethod.code,
    shippingSnapshot,
    taxSnapshot,
    availableShippingMethods: availableMethods,
    appliedPromotion,
    _raw: {
      subtotalPaise,
      discountPaise,
      eligibleMerchandiseSubtotalPaise,
      shippingPaise,
      taxPaise,
      grandTotalPaise,
    },
  };
}

module.exports = {
  DEFAULT_SHIPPING_METHODS,
  DEFAULT_TAX_RULE,
  getActiveShippingMethods,
  getAvailableShippingMethods,
  getActiveTaxRule,
  calculateCheckoutTotals,
};
