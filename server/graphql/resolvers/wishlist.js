const { GraphQLError } = require('graphql');
const { WishlistItemModel, ProductModel, CategoryModel, ProductVariantModel } = require('../../models');
const { requireAuth } = require('../../helpers/authMiddleware');

const wishlistResolvers = {
  Query: {
    getMyWishlist: async (parent, args, context) => {
      const authUser = requireAuth(context);

      const items = await WishlistItemModel.findAll({
        where: { userId: authUser.id },
        include: [
          {
            model: ProductModel,
            as: 'product',
            include: [
              { model: CategoryModel, as: 'category' },
              { model: ProductVariantModel, as: 'variants' },
            ],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      return items
        .map((item) => item.product)
        .filter((prod) => prod !== null && prod !== undefined);
    },

    getMyWishlistItems: async (parent, args, context) => {
      const authUser = requireAuth(context);

      return await WishlistItemModel.findAll({
        where: { userId: authUser.id },
        include: [
          {
            model: ProductModel,
            as: 'product',
            include: [
              { model: CategoryModel, as: 'category' },
              { model: ProductVariantModel, as: 'variants' },
            ],
          },
        ],
        order: [['createdAt', 'DESC']],
      });
    },

    isInWishlist: async (parent, { productId }, context) => {
      if (!context?.user?.id) {
        return false;
      }

      const count = await WishlistItemModel.count({
        where: {
          userId: context.user.id,
          productId,
        },
      });

      return count > 0;
    },
  },

  Mutation: {
    addToWishlist: async (parent, { productId }, context) => {
      const authUser = requireAuth(context);

      const product = await ProductModel.findByPk(productId);
      if (!product) {
        throw new GraphQLError('Product not found.', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      const [item, created] = await WishlistItemModel.findOrCreate({
        where: {
          userId: authUser.id,
          productId,
        },
        defaults: {
          userId: authUser.id,
          productId,
        },
      });

      return true;
    },

    removeFromWishlist: async (parent, { productId }, context) => {
      const authUser = requireAuth(context);

      const deletedCount = await WishlistItemModel.destroy({
        where: {
          userId: authUser.id,
          productId,
        },
      });

      return deletedCount > 0;
    },

    toggleWishlist: async (parent, { productId }, context) => {
      const authUser = requireAuth(context);

      const product = await ProductModel.findByPk(productId);
      if (!product) {
        throw new GraphQLError('Product not found.', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      const existing = await WishlistItemModel.findOne({
        where: {
          userId: authUser.id,
          productId,
        },
      });

      if (existing) {
        await existing.destroy();
        return false; // Now removed
      } else {
        await WishlistItemModel.create({
          userId: authUser.id,
          productId,
        });
        return true; // Now added
      }
    },
  },
};

module.exports = wishlistResolvers;
