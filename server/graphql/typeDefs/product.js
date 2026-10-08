const productTypeDefs = `#graphql
  scalar JSON

  type Product {
    id: ID!
    categoryId: ID!
    name: String!
    slug: String!
    shortDescription: String
    description: String
    price: Float!
    costPrice: Float
    compareAtPrice: Float
    images: [String]
    stockQuantity: Int
    hasVariants: Boolean
    optionsLabel: String
    productVideoUrl: String
    features: [String]
    isActive: Boolean
    category: Category
    variants: [ProductVariant]
    createdAt: String
    updatedAt: String
  }

  input ProductFilterInput {
    categoryId: ID
    categorySlug: String
    search: String
    isActive: Boolean
    minPrice: Float
    maxPrice: Float
    inStock: Boolean
  }

  enum ProductSortBy {
    FEATURED
    PRICE_LOW
    PRICE_HIGH
    NEWEST
    NAME_ASC
    NAME_DESC
  }

  type PaginatedProducts {
    items: [Product!]!
    total: Int!
    page: Int!
    limit: Int!
    totalPages: Int!
    hasMore: Boolean!
  }

  # Extend Category so we can easily query all products inside a specific category
  extend type Category {
    products: [Product]
  }

  extend type Query {
    getProducts(filter: ProductFilterInput, page: Int, limit: Int, sortBy: ProductSortBy): PaginatedProducts!
    getAllProducts(limit: Int, offset: Int): [Product]
    getProductBySlug(slug: String!): Product
    getProductById(id: ID!): Product
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
      costPrice: Float
      compareAtPrice: Float
      images: [String]
      stockQuantity: Int
      hasVariants: Boolean
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
      costPrice: Float
      compareAtPrice: Float
      images: [String]
      stockQuantity: Int
      hasVariants: Boolean
      optionsLabel: String
      productVideoUrl: String
      features: [String]
      isActive: Boolean
    ): Product

    deleteProduct(id: ID!): Boolean
  }
`;

module.exports = productTypeDefs;
