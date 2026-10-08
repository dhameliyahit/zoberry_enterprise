const { GraphQLError } = require('graphql');
const { ProductVariantModel, ProductModel, InventoryMovementModel } = require('../../models');
const { requireAdmin } = require('../../helpers/authMiddleware');
const { isNonNegativeNumber } = require('../../helpers/validationHelper');

const variantResolvers = {
  Mutation: {
    createProductVariant: async (parent, { input }, context) => {
      requireAdmin(context);

      const {
        productId,
        sku,
        title,
        price,
        compareAtPrice,
        costPrice,
        stockQuantity,
        options,
        isActive,
      } = input;

      if (!productId || !sku || !title) {
        throw new GraphQLError('Product ID, SKU, and title are required.', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      if (!isNonNegativeNumber(price)) {
        throw new GraphQLError('Variant price must be a valid non-negative number.', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      const product = await ProductModel.findByPk(productId);
      if (!product) {
        throw new GraphQLError('Parent product does not exist.', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      const cleanSku = sku.trim().toUpperCase();
      const existingSku = await ProductVariantModel.findOne({ where: { sku: cleanSku } });
      if (existingSku) {
        throw new GraphQLError(`A variant with SKU "${cleanSku}" already exists.`, {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      const initialStock = Math.max(0, parseInt(stockQuantity, 10) || 0);

      const newVariant = await ProductVariantModel.create({
        productId,
        sku: cleanSku,
        title: title.trim(),
        price: parseFloat(price),
        compareAtPrice: compareAtPrice !== undefined && compareAtPrice !== null ? parseFloat(compareAtPrice) : null,
        costPrice: costPrice !== undefined && costPrice !== null ? parseFloat(costPrice) : null,
        stockQuantity: initialStock,
        options: options || {},
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      });

      // Update parent product flag
      if (!product.hasVariants) {
        product.hasVariants = true;
        await product.save();
      }

      // Record initial inventory movement
      if (initialStock > 0) {
        await InventoryMovementModel.create({
          productId,
          variantId: newVariant.id,
          quantityChange: initialStock,
          type: 'INITIAL',
          referenceType: 'MANUAL',
          balanceAfter: initialStock,
          notes: 'Initial variant creation stock',
        });
      }

      return newVariant;
    },

    updateProductVariant: async (parent, { input }, context) => {
      requireAdmin(context);

      const { id, ...updateData } = input;
      const variant = await ProductVariantModel.findByPk(id);
      if (!variant) {
        throw new GraphQLError('Product variant not found.', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      if (updateData.sku !== undefined) {
        const cleanSku = updateData.sku.trim().toUpperCase();
        if (cleanSku !== variant.sku) {
          const duplicate = await ProductVariantModel.findOne({ where: { sku: cleanSku } });
          if (duplicate) {
            throw new GraphQLError(`SKU "${cleanSku}" is already in use by another variant.`, {
              extensions: { code: 'BAD_USER_INPUT' },
            });
          }
          variant.sku = cleanSku;
        }
      }

      if (updateData.title !== undefined) {
        variant.title = updateData.title.trim();
      }

      if (updateData.price !== undefined) {
        if (!isNonNegativeNumber(updateData.price)) {
          throw new GraphQLError('Variant price must be a non-negative number.', {
            extensions: { code: 'BAD_USER_INPUT' },
          });
        }
        variant.price = parseFloat(updateData.price);
      }

      if (updateData.compareAtPrice !== undefined) {
        variant.compareAtPrice = updateData.compareAtPrice !== null ? parseFloat(updateData.compareAtPrice) : null;
      }

      if (updateData.costPrice !== undefined) {
        variant.costPrice = updateData.costPrice !== null ? parseFloat(updateData.costPrice) : null;
      }

      if (updateData.stockQuantity !== undefined) {
        const newStock = Math.max(0, parseInt(updateData.stockQuantity, 10) || 0);
        const diff = newStock - variant.stockQuantity;
        variant.stockQuantity = newStock;

        if (diff !== 0) {
          await InventoryMovementModel.create({
            productId: variant.productId,
            variantId: variant.id,
            quantityChange: diff,
            type: 'MANUAL_ADJUSTMENT',
            referenceType: 'ADMIN_ADJUSTMENT',
            balanceAfter: newStock,
            notes: 'Admin manual stock update',
          });
        }
      }

      if (updateData.options !== undefined) {
        variant.options = updateData.options;
      }

      if (updateData.isActive !== undefined) {
        variant.isActive = Boolean(updateData.isActive);
      }

      await variant.save();
      return variant;
    },

    deleteProductVariant: async (parent, { id }, context) => {
      requireAdmin(context);

      const variant = await ProductVariantModel.findByPk(id);
      if (!variant) {
        throw new GraphQLError('Product variant not found.', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      const productId = variant.productId;
      await ProductVariantModel.destroy({ where: { id } });

      // Check remaining variants on parent product
      const remainingCount = await ProductVariantModel.count({ where: { productId } });
      if (remainingCount === 0) {
        await ProductModel.update({ hasVariants: false }, { where: { id: productId } });
      }

      return true;
    },
  },
};

module.exports = variantResolvers;
