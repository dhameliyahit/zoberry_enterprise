const variantTypeDefs = `#graphql
  type ProductVariant {
    id: ID!
    productId: ID!
    sku: String!
    title: String!
    price: Float!
    compareAtPrice: Float
    costPrice: Float
    stockQuantity: Int!
    options: JSON
    isActive: Boolean!
    createdAt: String
    updatedAt: String
  }

  input CreateProductVariantInput {
    productId: ID!
    sku: String!
    title: String!
    price: Float!
    compareAtPrice: Float
    costPrice: Float
    stockQuantity: Int!
    options: JSON
    isActive: Boolean
  }

  input UpdateProductVariantInput {
    id: ID!
    sku: String
    title: String
    price: Float
    compareAtPrice: Float
    costPrice: Float
    stockQuantity: Int
    options: JSON
    isActive: Boolean
  }

  extend type Mutation {
    createProductVariant(input: CreateProductVariantInput!): ProductVariant!
    updateProductVariant(input: UpdateProductVariantInput!): ProductVariant!
    deleteProductVariant(id: ID!): Boolean!
  }
`;

module.exports = variantTypeDefs;
