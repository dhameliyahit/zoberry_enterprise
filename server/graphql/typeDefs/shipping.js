const shippingTypeDefs = `#graphql
  type ShippingMethod {
    id: ID!
    code: String!
    name: String!
    description: String
    basePrice: Float!
    actualPrice: Float!
    freeThreshold: Float
    isFree: Boolean!
    estimatedDays: String
    isActive: Boolean!
    priority: Int
  }

  type TaxRule {
    id: ID!
    name: String!
    ratePercent: Float!
    isInclusive: Boolean!
    isActive: Boolean!
    country: String!
    state: String
  }

  input CreateShippingMethodInput {
    code: String!
    name: String!
    description: String
    price: Float!
    freeThreshold: Float
    estimatedDays: String
    isActive: Boolean
    priority: Int
  }

  input UpdateShippingMethodInput {
    name: String
    description: String
    price: Float
    freeThreshold: Float
    estimatedDays: String
    isActive: Boolean
    priority: Int
  }

  input CreateTaxRuleInput {
    name: String!
    ratePercent: Float!
    isInclusive: Boolean
    isActive: Boolean
    country: String
    state: String
  }

  input UpdateTaxRuleInput {
    name: String
    ratePercent: Float
    isInclusive: Boolean
    isActive: Boolean
    state: String
  }

  extend type Query {
    getAvailableShippingMethods(subtotal: Float, postalCode: String): [ShippingMethod!]!
    adminGetAllShippingMethods: [ShippingMethod!]!
    getTaxRules: [TaxRule!]!
  }

  extend type Mutation {
    adminCreateShippingMethod(input: CreateShippingMethodInput!): ShippingMethod!
    adminUpdateShippingMethod(id: ID!, input: UpdateShippingMethodInput!): ShippingMethod!
    adminToggleShippingMethodActive(id: ID!, isActive: Boolean!): ShippingMethod!
    adminDeleteShippingMethod(id: ID!): Boolean!

    adminCreateTaxRule(input: CreateTaxRuleInput!): TaxRule!
    adminUpdateTaxRule(id: ID!, input: UpdateTaxRuleInput!): TaxRule!
    adminToggleTaxRuleActive(id: ID!, isActive: Boolean!): TaxRule!
  }
`;

module.exports = shippingTypeDefs;
