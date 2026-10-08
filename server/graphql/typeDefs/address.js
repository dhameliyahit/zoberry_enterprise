const addressTypeDefs = `#graphql
  type Address {
    id: ID!
    userId: ID!
    fullName: String!
    phone: String!
    addressLine1: String!
    addressLine2: String
    landmark: String
    city: String!
    state: String!
    postalCode: String!
    country: String!
    addressType: String!
    isDefaultShipping: Boolean!
    isDefaultBilling: Boolean!
    createdAt: String
    updatedAt: String
  }

  input CreateAddressInput {
    fullName: String!
    phone: String!
    addressLine1: String!
    addressLine2: String
    landmark: String
    city: String!
    state: String!
    postalCode: String!
    country: String
    addressType: String
    isDefaultShipping: Boolean
    isDefaultBilling: Boolean
  }

  input UpdateAddressInput {
    fullName: String
    phone: String
    addressLine1: String
    addressLine2: String
    landmark: String
    city: String
    state: String
    postalCode: String
    country: String
    addressType: String
    isDefaultShipping: Boolean
    isDefaultBilling: Boolean
  }

  extend type Query {
    getMyAddresses: [Address!]!
    getAddressById(id: ID!): Address
  }

  extend type Mutation {
    createAddress(input: CreateAddressInput!): Address!
    updateAddress(id: ID!, input: UpdateAddressInput!): Address!
    deleteAddress(id: ID!): Boolean!
    setDefaultShippingAddress(id: ID!): Address!
  }
`;

module.exports = addressTypeDefs;
