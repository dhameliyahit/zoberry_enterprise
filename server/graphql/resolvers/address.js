const { GraphQLError } = require('graphql');
const { AddressModel } = require('../../models');
const { requireAuth, requireOwnerOrAdmin } = require('../../helpers/authMiddleware');

const addressResolvers = {
  Query: {
    getMyAddresses: async (parent, args, context) => {
      const authUser = requireAuth(context);
      return await AddressModel.findAll({
        where: { userId: authUser.id },
        order: [
          ['isDefaultShipping', 'DESC'],
          ['createdAt', 'DESC'],
        ],
      });
    },

    getAddressById: async (parent, { id }, context) => {
      const authUser = requireAuth(context);
      const address = await AddressModel.findByPk(id);
      if (!address) {
        throw new GraphQLError('Address not found.', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      requireOwnerOrAdmin(context, address.userId);
      return address;
    },
  },

  Mutation: {
    createAddress: async (parent, { input }, context) => {
      const authUser = requireAuth(context);
      const {
        fullName,
        phone,
        addressLine1,
        addressLine2,
        landmark,
        city,
        state,
        postalCode,
        country = 'IN',
        addressType = 'HOME',
        isDefaultShipping,
        isDefaultBilling,
      } = input;

      if (!fullName || !phone || !addressLine1 || !city || !state || !postalCode) {
        throw new GraphQLError('Full name, phone, address line 1, city, state, and postal code are required.', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      // Check if this is the user's first address
      const existingAddressCount = await AddressModel.count({ where: { userId: authUser.id } });
      const shouldBeDefault = isDefaultShipping || existingAddressCount === 0;

      if (shouldBeDefault) {
        await AddressModel.update(
          { isDefaultShipping: false },
          { where: { userId: authUser.id } }
        );
      }

      if (isDefaultBilling) {
        await AddressModel.update(
          { isDefaultBilling: false },
          { where: { userId: authUser.id } }
        );
      }

      return await AddressModel.create({
        userId: authUser.id,
        fullName: fullName.trim(),
        phone: phone.trim(),
        addressLine1: addressLine1.trim(),
        addressLine2: addressLine2?.trim() || null,
        landmark: landmark?.trim() || null,
        city: city.trim(),
        state: state.trim(),
        postalCode: postalCode.trim(),
        country: country.trim().toUpperCase(),
        addressType: ['HOME', 'WORK', 'OTHER'].includes(addressType) ? addressType : 'HOME',
        isDefaultShipping: Boolean(shouldBeDefault),
        isDefaultBilling: Boolean(isDefaultBilling),
      });
    },

    updateAddress: async (parent, { id, input }, context) => {
      const authUser = requireAuth(context);
      const address = await AddressModel.findByPk(id);

      if (!address) {
        throw new GraphQLError('Address not found.', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      requireOwnerOrAdmin(context, address.userId);

      if (input.isDefaultShipping) {
        await AddressModel.update(
          { isDefaultShipping: false },
          { where: { userId: authUser.id } }
        );
        address.isDefaultShipping = true;
      }

      if (input.isDefaultBilling) {
        await AddressModel.update(
          { isDefaultBilling: false },
          { where: { userId: authUser.id } }
        );
        address.isDefaultBilling = true;
      }

      if (input.fullName !== undefined) address.fullName = input.fullName.trim();
      if (input.phone !== undefined) address.phone = input.phone.trim();
      if (input.addressLine1 !== undefined) address.addressLine1 = input.addressLine1.trim();
      if (input.addressLine2 !== undefined) address.addressLine2 = input.addressLine2?.trim() || null;
      if (input.landmark !== undefined) address.landmark = input.landmark?.trim() || null;
      if (input.city !== undefined) address.city = input.city.trim();
      if (input.state !== undefined) address.state = input.state.trim();
      if (input.postalCode !== undefined) address.postalCode = input.postalCode.trim();
      if (input.country !== undefined) address.country = input.country.trim().toUpperCase();
      if (input.addressType !== undefined) address.addressType = input.addressType;

      await address.save();
      return address;
    },

    deleteAddress: async (parent, { id }, context) => {
      const address = await AddressModel.findByPk(id);
      if (!address) {
        throw new GraphQLError('Address not found.', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      requireOwnerOrAdmin(context, address.userId);
      await address.destroy();
      return true;
    },

    setDefaultShippingAddress: async (parent, { id }, context) => {
      const authUser = requireAuth(context);
      const address = await AddressModel.findByPk(id);

      if (!address) {
        throw new GraphQLError('Address not found.', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      requireOwnerOrAdmin(context, address.userId);

      await AddressModel.update(
        { isDefaultShipping: false },
        { where: { userId: authUser.id } }
      );

      address.isDefaultShipping = true;
      await address.save();
      return address;
    },
  },
};

module.exports = addressResolvers;
