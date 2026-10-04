const productTypeDefs = `#graphql
  type Product {
    id: ID!
    categoryId: ID!
    name: String!
    slug: String!
    shortDescription: String
    description: String
    price: Float!
    compareAtPrice: Float
    images: [String]
    stockQuantity: Int
    optionsLabel: String
    productVideoUrl: String
    features: [String]
    isActive: Boolean
    category: Category # Relational data
    createdAt: String
    updatedAt: String
  }

  # Extend Category so we can easily query all products inside a specific category
  extend type Category {
    products: [Product]
  }

  extend type Query {
    getAllProducts: [Product]
    getProductBySlug(slug: String!): Product
    getProductsByCategory(categoryId: ID!): [Product]
    getProductsByIds(ids: [ID!]!): [Product]
  }

  extend type Mutation {
    createProduct(
      categoryId: ID!
      name: String!
      slug: String!
      shortDescription: String
      description: String
      price: Float!
      compareAtPrice: Float
      images: [String]
      stockQuantity: Int
      optionsLabel: String
      productVideoUrl: String
      features: [String]
      isActive: Boolean
    ): Product

    updateProduct(
      id: ID!
      categoryId: ID
      name: String
      slug: String
      shortDescription: String
      description: String
      price: Float
      compareAtPrice: Float
      images: [String]
      stockQuantity: Int
      optionsLabel: String
      productVideoUrl: String
      features: [String]
      isActive: Boolean
    ): Product

    deleteProduct(id: ID!): Boolean
  }
`;

module.exports = productTypeDefs;
