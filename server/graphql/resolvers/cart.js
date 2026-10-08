const { GraphQLError } = require('graphql');
const { sequelize } = require('../../config/db');
const {
  CartModel,
  CartItemModel,
  ProductModel,
  ProductVariantModel,
  CategoryModel,
} = require('../../models');
const { requireAuth } = require('../../helpers/authMiddleware');
const { calculateTotals, calculateLineTotal } = require('../../helpers/moneyHelper');
const { checkItemStockAndDetails } = require('../../helpers/inventoryHelper');

/**
 * Finds or creates an active shopping cart for an authenticated user or guest session.
 */
async function getOrCreateCartInstance(context, guestSessionToken, transaction = null) {
  const options = transaction ? { transaction } : {};
  const userId = context?.user?.id || null;

  if (userId) {
    let cart = await CartModel.findOne({
      where: { userId, status: 'active' },
      ...options,
    });

    if (!cart) {
      cart = await CartModel.create({
        userId,
        currency: 'INR',
        status: 'active',
      }, options);
    }

    return cart;
  }

  if (guestSessionToken && typeof guestSessionToken === 'string' && guestSessionToken.trim()) {
    const cleanToken = guestSessionToken.trim();
    let cart = await CartModel.findOne({
      where: { guestSessionToken: cleanToken, status: 'active' },
      ...options,
    });

    if (!cart) {
      cart = await CartModel.create({
        guestSessionToken: cleanToken,
        currency: 'INR',
        status: 'active',
      }, options);
    }

    return cart;
  }

  throw new GraphQLError('Guest session token or authentication is required to access shopping cart.', {
    extensions: { code: 'BAD_USER_INPUT' },
  });
}

/**
 * Loads and calculates authoritative financial totals for a cart.
 */
async function formatCartResponse(cartId, transaction = null) {
  const options = transaction ? { transaction } : {};

  const cart = await CartModel.findByPk(cartId, {
    ...options,
    include: [
      {
        model: CartItemModel,
        as: 'items',
        include: [
          {
            model: ProductModel,
            as: 'product',
            include: [{ model: CategoryModel, as: 'category' }],
          },
          {
            model: ProductVariantModel,
            as: 'variant',
          },
        ],
      },
    ],
  });

  if (!cart) {
    throw new GraphQLError('Cart not found.', { extensions: { code: 'NOT_FOUND' } });
  }

  const formattedItems = [];
  const calculationItems = [];

  for (const item of cart.items || []) {
    const product = item.product;
    const variant = item.variant;

    let isAvailable = true;
    let availableStock = 0;
    let authoritativeUnitPrice = 0;

    if (variant) {
      authoritativeUnitPrice = variant.price;
      availableStock = variant.stockQuantity;
      isAvailable = variant.isActive && product.isActive && availableStock > 0;
    } else if (product) {
      authoritativeUnitPrice = product.price;
      availableStock = product.stockQuantity;
      isAvailable = product.isActive && availableStock > 0;
    } else {
      isAvailable = false;
    }

    const lineTotal = calculateLineTotal(authoritativeUnitPrice, item.quantity);

    formattedItems.push({
      id: item.id,
      cartId: item.cartId,
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      unitPrice: authoritativeUnitPrice,
      lineTotal,
      product,
      variant,
      isAvailable,
      availableStock,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    });

    if (isAvailable) {
      calculationItems.push({
        price: authoritativeUnitPrice,
        quantity: item.quantity,
      });
    }
  }

  const totals = calculateTotals(calculationItems);
  const itemCount = formattedItems.reduce((sum, it) => sum + it.quantity, 0);

  return {
    id: cart.id,
    userId: cart.userId,
    guestSessionToken: cart.guestSessionToken,
    currency: cart.currency,
    status: cart.status,
    items: formattedItems,
    itemCount,
    subtotal: totals.subtotal,
    discountAmount: totals.discountAmount,
    shippingAmount: totals.shippingAmount,
    taxAmount: totals.taxAmount,
    grandTotal: totals.grandTotal,
    createdAt: cart.createdAt,
    updatedAt: cart.updatedAt,
  };
}

const cartResolvers = {
  Query: {
    getMyCart: async (parent, { guestSessionToken }, context) => {
      const cart = await getOrCreateCartInstance(context, guestSessionToken);
      return await formatCartResponse(cart.id);
    },

    getGuestCart: async (parent, { guestSessionToken }) => {
      if (!guestSessionToken || typeof guestSessionToken !== 'string') {
        throw new GraphQLError('Guest session token is required.', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }
      const cart = await CartModel.findOne({
        where: { guestSessionToken: guestSessionToken.trim(), status: 'active' },
      });
      if (!cart) return null;
      return await formatCartResponse(cart.id);
    },
  },

  Mutation: {
    addToCart: async (parent, { productId, variantId, quantity = 1, guestSessionToken }, context) => {
      const sanitizedQty = parseInt(quantity, 10);
      if (isNaN(sanitizedQty) || sanitizedQty < 1) {
        throw new GraphQLError('Quantity must be at least 1.', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      // Check item validity & stock server-side
      const itemDetails = await checkItemStockAndDetails(productId, variantId);

      const cart = await getOrCreateCartInstance(context, guestSessionToken);

      // Check if this exact sellable item is already in the cart
      const existingItem = await CartItemModel.findOne({
        where: {
          cartId: cart.id,
          productId,
          variantId: variantId || null,
        },
      });

      const targetQuantity = (existingItem ? existingItem.quantity : 0) + sanitizedQty;

      if (targetQuantity > itemDetails.availableStock) {
        throw new GraphQLError(
          `Cannot add ${sanitizedQty} items. Only ${itemDetails.availableStock} in stock (already ${existingItem?.quantity || 0} in cart).`,
          { extensions: { code: 'BAD_USER_INPUT' } }
        );
      }

      if (existingItem) {
        existingItem.quantity = targetQuantity;
        await existingItem.save();
      } else {
        await CartItemModel.create({
          cartId: cart.id,
          productId,
          variantId: variantId || null,
          quantity: sanitizedQty,
        });
      }

      return await formatCartResponse(cart.id);
    },

    updateCartItem: async (parent, { cartItemId, quantity, guestSessionToken }, context) => {
      const cart = await getOrCreateCartInstance(context, guestSessionToken);
      const cartItem = await CartItemModel.findOne({
        where: { id: cartItemId, cartId: cart.id },
      });

      if (!cartItem) {
        throw new GraphQLError('Cart item not found in your cart.', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      const sanitizedQty = parseInt(quantity, 10);
      if (sanitizedQty <= 0) {
        await cartItem.destroy();
        return await formatCartResponse(cart.id);
      }

      const itemDetails = await checkItemStockAndDetails(cartItem.productId, cartItem.variantId);
      if (sanitizedQty > itemDetails.availableStock) {
        throw new GraphQLError(
          `Only ${itemDetails.availableStock} units available in stock.`,
          { extensions: { code: 'BAD_USER_INPUT' } }
        );
      }

      cartItem.quantity = sanitizedQty;
      await cartItem.save();

      return await formatCartResponse(cart.id);
    },

    removeCartItem: async (parent, { cartItemId, guestSessionToken }, context) => {
      const cart = await getOrCreateCartInstance(context, guestSessionToken);
      const cartItem = await CartItemModel.findOne({
        where: { id: cartItemId, cartId: cart.id },
      });

      if (!cartItem) {
        throw new GraphQLError('Cart item not found in your cart.', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      await cartItem.destroy();
      return await formatCartResponse(cart.id);
    },

    clearCart: async (parent, { guestSessionToken }, context) => {
      const cart = await getOrCreateCartInstance(context, guestSessionToken);
      await CartItemModel.destroy({ where: { cartId: cart.id } });
      return await formatCartResponse(cart.id);
    },

    mergeGuestCart: async (parent, { guestSessionToken }, context) => {
      const authUser = requireAuth(context);

      if (!guestSessionToken || typeof guestSessionToken !== 'string') {
        throw new GraphQLError('Guest session token is required to merge.', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      const guestCart = await CartModel.findOne({
        where: { guestSessionToken: guestSessionToken.trim(), status: 'active' },
        include: [{ model: CartItemModel, as: 'items' }],
      });

      if (!guestCart || !guestCart.items || guestCart.items.length === 0) {
        // No items in guest cart, return current user cart directly
        const userCart = await getOrCreateCartInstance(context, null);
        return await formatCartResponse(userCart.id);
      }

      const userCart = await getOrCreateCartInstance(context, null);

      // Perform atomic merge within a database transaction
      await sequelize.transaction(async (t) => {
        for (const guestItem of guestCart.items) {
          try {
            const itemDetails = await checkItemStockAndDetails(
              guestItem.productId,
              guestItem.variantId,
              t
            );

            if (itemDetails.availableStock <= 0) continue; // Skip out of stock items

            const existingUserItem = await CartItemModel.findOne({
              where: {
                cartId: userCart.id,
                productId: guestItem.productId,
                variantId: guestItem.variantId || null,
              },
              transaction: t,
            });

            if (existingUserItem) {
              const combinedQty = Math.min(
                itemDetails.availableStock,
                existingUserItem.quantity + guestItem.quantity
              );
              existingUserItem.quantity = combinedQty;
              await existingUserItem.save({ transaction: t });
            } else {
              const validQty = Math.min(itemDetails.availableStock, guestItem.quantity);
              await CartItemModel.create({
                cartId: userCart.id,
                productId: guestItem.productId,
                variantId: guestItem.variantId || null,
                quantity: validQty,
              }, { transaction: t });
            }
          } catch (err) {
            // If item is deleted/unavailable, skip gracefully during merge
            continue;
          }
        }

        // Mark guest cart as merged
        guestCart.status = 'merged';
        await guestCart.save({ transaction: t });
      });

      return await formatCartResponse(userCart.id);
    },
  },
};

module.exports = {
  cartResolvers,
  getOrCreateCartInstance,
  formatCartResponse,
};
