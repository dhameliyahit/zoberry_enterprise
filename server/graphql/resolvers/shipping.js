const { GraphQLError } = require('graphql');
const { ShippingMethodModel, TaxRuleModel } = require('../../models');
const { requireAdmin } = require('../../helpers/authMiddleware');
const {
  getAvailableShippingMethods,
  DEFAULT_SHIPPING_METHODS,
  DEFAULT_TAX_RULE,
} = require('../../helpers/checkoutPricingEngine');

const shippingResolvers = {
  Query: {
    getAvailableShippingMethods: async (parent, { subtotal, postalCode }) => {
      return await getAvailableShippingMethods({
        eligibleSubtotal: subtotal || 0,
        postalCode: postalCode || null,
      });
    },

    adminGetAllShippingMethods: async (parent, args, context) => {
      requireAdmin(context);
      const methods = await ShippingMethodModel.findAll({
        order: [['priority', 'ASC'], ['createdAt', 'ASC']],
      });

      if (methods.length === 0) {
        return DEFAULT_SHIPPING_METHODS.map((m, idx) => ({
          ...m,
          id: `default-${idx}`,
          basePrice: m.price,
          actualPrice: m.price,
          isFree: false,
        }));
      }

      return methods.map((m) => {
        const json = m.toJSON();
        return {
          ...json,
          basePrice: json.price,
          actualPrice: json.price,
          isFree: false,
        };
      });
    },

    getTaxRules: async () => {
      const rules = await TaxRuleModel.findAll({
        where: { isActive: true },
        order: [['createdAt', 'DESC']],
      });

      if (rules.length === 0) {
        return [{
          id: 'default-tax',
          ...DEFAULT_TAX_RULE,
        }];
      }

      return rules;
    },
  },

  Mutation: {
    adminCreateShippingMethod: async (parent, { input }, context) => {
      requireAdmin(context);

      const code = input.code.trim().toUpperCase();
      const existing = await ShippingMethodModel.findOne({ where: { code } });
      if (existing) {
        throw new GraphQLError(`Shipping method code "${code}" already exists.`, {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      const method = await ShippingMethodModel.create({
        code,
        name: input.name.trim(),
        description: input.description?.trim() || null,
        price: input.price || 0,
        freeThreshold: input.freeThreshold || null,
        estimatedDays: input.estimatedDays?.trim() || null,
        isActive: input.isActive !== undefined ? input.isActive : true,
        priority: input.priority || 0,
      });

      const json = method.toJSON();
      return {
        ...json,
        basePrice: json.price,
        actualPrice: json.price,
        isFree: false,
      };
    },

    adminUpdateShippingMethod: async (parent, { id, input }, context) => {
      requireAdmin(context);

      const method = await ShippingMethodModel.findByPk(id);
      if (!method) {
        throw new GraphQLError('Shipping method not found.', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      if (input.name !== undefined) method.name = input.name.trim();
      if (input.description !== undefined) method.description = input.description?.trim() || null;
      if (input.price !== undefined) method.price = input.price;
      if (input.freeThreshold !== undefined) method.freeThreshold = input.freeThreshold;
      if (input.estimatedDays !== undefined) method.estimatedDays = input.estimatedDays?.trim() || null;
      if (input.isActive !== undefined) method.isActive = input.isActive;
      if (input.priority !== undefined) method.priority = input.priority;

      await method.save();

      const json = method.toJSON();
      return {
        ...json,
        basePrice: json.price,
        actualPrice: json.price,
        isFree: false,
      };
    },

    adminToggleShippingMethodActive: async (parent, { id, isActive }, context) => {
      requireAdmin(context);

      const method = await ShippingMethodModel.findByPk(id);
      if (!method) {
        throw new GraphQLError('Shipping method not found.', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      method.isActive = isActive;
      await method.save();

      const json = method.toJSON();
      return {
        ...json,
        basePrice: json.price,
        actualPrice: json.price,
        isFree: false,
      };
    },

    adminDeleteShippingMethod: async (parent, { id }, context) => {
      requireAdmin(context);

      const method = await ShippingMethodModel.findByPk(id);
      if (!method) {
        throw new GraphQLError('Shipping method not found.', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      await method.destroy();
      return true;
    },

    adminCreateTaxRule: async (parent, { input }, context) => {
      requireAdmin(context);

      return await TaxRuleModel.create({
        name: input.name.trim(),
        ratePercent: input.ratePercent,
        isInclusive: input.isInclusive !== undefined ? input.isInclusive : true,
        isActive: input.isActive !== undefined ? input.isActive : true,
        country: (input.country || 'IN').trim().toUpperCase(),
        state: input.state?.trim() || null,
      });
    },

    adminUpdateTaxRule: async (parent, { id, input }, context) => {
      requireAdmin(context);

      const rule = await TaxRuleModel.findByPk(id);
      if (!rule) {
        throw new GraphQLError('Tax rule not found.', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      if (input.name !== undefined) rule.name = input.name.trim();
      if (input.ratePercent !== undefined) rule.ratePercent = input.ratePercent;
      if (input.isInclusive !== undefined) rule.isInclusive = input.isInclusive;
      if (input.isActive !== undefined) rule.isActive = input.isActive;
      if (input.state !== undefined) rule.state = input.state?.trim() || null;

      await rule.save();
      return rule;
    },

    adminToggleTaxRuleActive: async (parent, { id, isActive }, context) => {
      requireAdmin(context);

      const rule = await TaxRuleModel.findByPk(id);
      if (!rule) {
        throw new GraphQLError('Tax rule not found.', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      rule.isActive = isActive;
      await rule.save();
      return rule;
    },
  },
};

module.exports = shippingResolvers;
