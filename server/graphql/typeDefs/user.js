const userTypeDefs = `#graphql
  type User {
    id: ID!
    email: String!
    role: String!
    isGuestConverted: Boolean
    createdAt: String
    updatedAt: String
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    getCurrentUser: User
    getUserById(id: ID!): User
    getAllUsers: [User]
  }

  type Mutation {
    registerUser(email: String!, password: String): AuthPayload
    loginUser(email: String!, password: String!): AuthPayload
    googleLoginUser(token: String!): AuthPayload
    updateUser(id: ID, email: String): User
    deleteUser(id: ID!): Boolean
  }
`;

module.exports = userTypeDefs;
