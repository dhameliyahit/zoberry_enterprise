const wishlistTypeDefs = `#graphql
  type WishlistItem {
    id: ID!
    userId: ID!
    productId: ID!
    product: Product!
    createdAt: String
    updatedAt: String
  }

  extend type Query {
    getMyWishlist: [Product!]!
    getMyWishlistItems: [WishlistItem!]!
    isInWishlist(productId: ID!): Boolean!
  }

  extend type Mutation {
    addToWishlist(productId: ID!): Boolean!
    removeFromWishlist(productId: ID!): Boolean!
    toggleWishlist(productId: ID!): Boolean!
  }
`;

module.exports = wishlistTypeDefs;
