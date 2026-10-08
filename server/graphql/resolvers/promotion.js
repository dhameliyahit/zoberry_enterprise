const { GraphQLError } = require('graphql');
const { Op } = require('sequelize');
const { PromotionModel, PromotionUsageModel, CartModel, CartItemModel, ProductModel } = require('../../models');
const { requireAdmin } = require('../../helpers/authMiddleware');
const {
  normalizeCouponCode,
  validatePromotionEligibility,
  calculatePromotionDiscount,
} = require('../../helpers/promotionHelper');
const { toPaise, fromPaise } = require('../../helpers/moneyHelper');
const { getOrCreateCartInstance, formatCartResponse } = require('./cart');

const promotionResolvers = {
  Query: {
    adminGetAllPromotions: async (parent, { page = 1, limit = 20, search, isActive }, context) => {
      requireAdmin(context);

      const sanitizedPage = Math.max(1, parseInt(page, 10) || 1);
      const sanitizedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
      const offset = (sanitizedPage - 1) * sanitizedLimit;

      const where = {};
      if (isActive !== undefined && isActive !== null) {
        where.isActive = isActive;
      }

      if (search && search.trim()) {
        const query = `%${search.trim()}%`;
        where[Op.or] = [
          { name: { [Op.like]: query } },
          { code: { [Op.like]: query } },
          { description: { [Op.like]: query } },
        ];
      }

      const { count, rows } = await PromotionModel.findAndCountAll({
        where,
        order: [['createdAt', 'DESC']],
        limit: sanitizedLimit,
        offset,
      });

      return {
        items: rows,
        total: count,
        page: sanitizedPage,
        limit: sanitizedLimit,
        totalPages: Math.ceil(count / sanitizedLimit) || 1,
      };
    },

    adminGetPromotionById: async (parent, { id }, context) => {
      requireAdmin(context);

      const promo = await PromotionModel.findByPk(id);
      if (!promo) {
        throw new GraphQLError('Promotion not found.', {
          extensions: { code: 'NOT_FOUND' },
        });
      }
      return promo;
    },

    validateCoupon: async (parent, { code, guestSessionToken, guestEmail }, context) => {
      const cleanCode = normalizeCouponCode(code);
      if (!cleanCode) {
        return {
          isValid: false,
          message: 'Please enter a valid coupon code.',
        };
      }

      // 1. Fetch promotion
      const promotion = await PromotionModel.findOne({
        where: { code: cleanCode },
      });

      if (!promotion) {
        return {
          isValid: false,
          message: 'Invalid coupon code. Please check and try again.',
        };
      }

      // 2. Fetch customer/guest cart
      const cartInstance = await getOrCreateCartInstance(context, guestSessionToken);
      const cart = await formatCartResponse(cartInstance.id);

      if (!cart.items || cart.items.length === 0) {
        return {
          isValid: false,
          message: 'Your shopping cart is empty.',
        };
      }

      const subtotalPaise = toPaise(cart.subtotal);

      // 3. Validate eligibility
      const eligibility = await validatePromotionEligibility(promotion, {
        cartItems: cart.items,
        subtotalPaise,
        user: context?.user,
        guestEmail,
      });

      if (!eligibility.isValid) {
        return {
          isValid: false,
          message: eligibility.error || 'Coupon cannot be applied.',
        };
      }

      // 4. Calculate discount
      const { discountAmount } = calculatePromotionDiscount(
        promotion,
        eligibility.eligibleSubtotalPaise,
        subtotalPaise
      );

      const newGrandTotal = Math.max(0, fromPaise(subtotalPaise - toPaise(discountAmount)));

      return {
        isValid: true,
        message: `Coupon "${promotion.code}" applied successfully!`,
        code: promotion.code,
        discountType: promotion.discountType,
        discountValue: promotion.discountValue,
        discountAmount,
        newSubtotal: cart.subtotal,
        newGrandTotal,
      };
    },
  },

  Mutation: {
    adminCreatePromotion: async (parent, { input }, context) => {
      requireAdmin(context);

      const {
        name,
        description,
        type = 'COUPON',
        code,
        discountType,
        discountValue,
        maximumDiscount,
        minimumSubtotal = 0,
        startsAt,
        endsAt,
        usageLimit,
        perCustomerLimit = 1,
        isActive = true,
        targetProductIds,
        targetCategoryIds,
        priority = 0,
      } = input;

      if (!name || !name.trim()) {
        throw new GraphQLError('Promotion name is required.', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      if (!['PERCENTAGE', 'FIXED_AMOUNT'].includes(discountType)) {
        throw new GraphQLError('Discount type must be PERCENTAGE or FIXED_AMOUNT.', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      if (discountValue === null || discountValue === undefined || discountValue <= 0) {
        throw new GraphQLError('Discount value must be greater than 0.', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      if (discountType === 'PERCENTAGE' && discountValue > 100) {
        throw new GraphQLError('Percentage discount cannot exceed 100%.', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      let cleanCode = null;
      if (type === 'COUPON' || code) {
        cleanCode = normalizeCouponCode(code);
        if (!cleanCode) {
          throw new GraphQLError('Coupon code is required for coupon promotions.', {
            extensions: { code: 'BAD_USER_INPUT' },
          });
        }

        const existingCode = await PromotionModel.findOne({ where: { code: cleanCode } });
        if (existingCode) {
          throw new GraphQLError(`Coupon code "${cleanCode}" already exists.`, {
            extensions: { code: 'BAD_USER_INPUT' },
          });
        }
      }

      if (startsAt && endsAt && new Date(startsAt) > new Date(endsAt)) {
        throw new GraphQLError('Promotion start date cannot be later than end date.', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      return await PromotionModel.create({
        name: name.trim(),
        description: description?.trim() || null,
        type,
        code: cleanCode,
        discountType,
        discountValue,
        maximumDiscount: maximumDiscount ? parseFloat(maximumDiscount) : null,
        minimumSubtotal: minimumSubtotal ? parseFloat(minimumSubtotal) : 0,
        startsAt: startsAt ? new Date(startsAt) : null,
        endsAt: endsAt ? new Date(endsAt) : null,
        usageLimit: usageLimit ? parseInt(usageLimit, 10) : null,
        perCustomerLimit: perCustomerLimit ? parseInt(perCustomerLimit, 10) : 1,
        isActive: Boolean(isActive),
        targetProductIds: Array.isArray(targetProductIds) ? targetProductIds : null,
        targetCategoryIds: Array.isArray(targetCategoryIds) ? targetCategoryIds : null,
        priority: parseInt(priority, 10) || 0,
      });
    },

    adminUpdatePromotion: async (parent, { id, input }, context) => {
      requireAdmin(context);

      const promo = await PromotionModel.findByPk(id);
      if (!promo) {
        throw new GraphQLError('Promotion not found.', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      const updates = {};

      if (input.name !== undefined) {
        if (!input.name.trim()) {
          throw new GraphQLError('Promotion name cannot be blank.', {
            extensions: { code: 'BAD_USER_INPUT' },
          });
        }
        updates.name = input.name.trim();
      }

      if (input.description !== undefined) updates.description = input.description?.trim() || null;
      if (input.type !== undefined) updates.type = input.type;

      if (input.code !== undefined) {
        const cleanCode = normalizeCouponCode(input.code);
        if (cleanCode && cleanCode !== promo.code) {
          const duplicate = await PromotionModel.findOne({ where: { code: cleanCode } });
          if (duplicate) {
            throw new GraphQLError(`Coupon code "${cleanCode}" is already in use.`, {
              extensions: { code: 'BAD_USER_INPUT' },
            });
          }
          updates.code = cleanCode;
        } else if (!cleanCode && promo.type === 'COUPON') {
          throw new GraphQLError('Coupon code cannot be empty for coupon promotions.', {
            extensions: { code: 'BAD_USER_INPUT' },
          });
        }
      }

      if (input.discountType !== undefined) updates.discountType = input.discountType;
      if (input.discountValue !== undefined) {
        if (input.discountValue <= 0) {
          throw new GraphQLError('Discount value must be greater than 0.', {
            extensions: { code: 'BAD_USER_INPUT' },
          });
        }
        if ((input.discountType || promo.discountType) === 'PERCENTAGE' && input.discountValue > 100) {
          throw new GraphQLError('Percentage discount cannot exceed 100%.', {
            extensions: { code: 'BAD_USER_INPUT' },
          });
        }
        updates.discountValue = input.discountValue;
      }

      if (input.maximumDiscount !== undefined) {
        updates.maximumDiscount = input.maximumDiscount ? parseFloat(input.maximumDiscount) : null;
      }

      if (input.minimumSubtotal !== undefined) {
        updates.minimumSubtotal = input.minimumSubtotal ? parseFloat(input.minimumSubtotal) : 0;
      }

      if (input.startsAt !== undefined) updates.startsAt = input.startsAt ? new Date(input.startsAt) : null;
      if (input.endsAt !== undefined) updates.endsAt = input.endsAt ? new Date(input.endsAt) : null;
      if (input.usageLimit !== undefined) {
        updates.usageLimit = input.usageLimit !== null ? parseInt(input.usageLimit, 10) : null;
      }
      if (input.perCustomerLimit !== undefined) {
        updates.perCustomerLimit = parseInt(input.perCustomerLimit, 10) || 1;
      }
      if (input.isActive !== undefined) updates.isActive = Boolean(input.isActive);
      if (input.targetProductIds !== undefined) updates.targetProductIds = input.targetProductIds;
      if (input.targetCategoryIds !== undefined) updates.targetCategoryIds = input.targetCategoryIds;
      if (input.priority !== undefined) updates.priority = parseInt(input.priority, 10) || 0;

      await promo.update(updates);
      return promo;
    },

    adminTogglePromotionActive: async (parent, { id }, context) => {
      requireAdmin(context);

      const promo = await PromotionModel.findByPk(id);
      if (!promo) {
        throw new GraphQLError('Promotion not found.', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      await promo.update({ isActive: !promo.isActive });
      return promo;
    },

    adminDeletePromotion: async (parent, { id }, context) => {
      requireAdmin(context);

      const promo = await PromotionModel.findByPk(id);
      if (!promo) {
        throw new GraphQLError('Promotion not found.', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      // If already redeemed in past orders, deactivate instead of hard-deleting to preserve historical relationships
      const usageCount = await PromotionUsageModel.count({ where: { promotionId: id } });
      if (usageCount > 0) {
        await promo.update({ isActive: false });
        return true;
      }

      await promo.destroy();
      return true;
    },
  },
};

module.exports = promotionResolvers;
