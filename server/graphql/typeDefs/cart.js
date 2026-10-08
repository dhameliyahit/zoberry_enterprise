const cartTypeDefs = `#graphql
  type CartItem {
    id: ID!
    cartId: ID!
    productId: ID!
    variantId: ID
    quantity: Int!
    unitPrice: Float!
    lineTotal: Float!
    product: Product!
    variant: ProductVariant
    isAvailable: Boolean!
    availableStock: Int!
    createdAt: String
    updatedAt: String
  }

  type Cart {
    id: ID!
    userId: ID
    guestSessionToken: String
    currency: String!
    status: String!
    items: [CartItem!]!
    itemCount: Int!
    subtotal: Float!
    discountAmount: Float!
    shippingAmount: Float!
    taxAmount: Float!
    grandTotal: Float!
    createdAt: String
    updatedAt: String
  }

  extend type Query {
    getMyCart(guestSessionToken: String): Cart!
    getGuestCart(guestSessionToken: String!): Cart
  }

  extend type Mutation {
    addToCart(
      productId: ID!
      variantId: ID
      quantity: Int
      guestSessionToken: String
    ): Cart!

    updateCartItem(
      cartItemId: ID!
      quantity: Int!
      guestSessionToken: String
    ): Cart!

    removeCartItem(
      cartItemId: ID!
      guestSessionToken: String
    ): Cart!

    clearCart(guestSessionToken: String): Cart!

    mergeGuestCart(guestSessionToken: String!): Cart!
  }
`;

module.exports = cartTypeDefs;
