const categoryTypeDefs = `#graphql
  type Category {
    id: ID!
    name: String!
    slug: String!
    imageUrl: String!
    createdAt: String
    updatedAt: String
  }

  extend type Query {
    getAllCategories: [Category]
    getCategoryBySlug(slug: String!): Category
    getCategoryById(id: ID!): Category
  }

  extend type Mutation {
    createCategory(name: String!, slug: String!, imageUrl: String!): Category
    updateCategory(id: ID!, name: String, slug: String, imageUrl: String): Category
    deleteCategory(id: ID!): Boolean
  }
`;

module.exports = categoryTypeDefs;
