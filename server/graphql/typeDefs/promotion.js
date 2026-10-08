const promotionTypeDefs = `#graphql
  type Promotion {
    id: ID!
    name: String!
    description: String
    type: String!
    code: String
    discountType: String!
    discountValue: Float!
    maximumDiscount: Float
    minimumSubtotal: Float!
    startsAt: String
    endsAt: String
    usageLimit: Int
    usageCount: Int!
    perCustomerLimit: Int!
    isActive: Boolean!
    targetProductIds: JSON
    targetCategoryIds: JSON
    priority: Int!
    createdAt: String
    updatedAt: String
  }

  type PaginatedPromotions {
    items: [Promotion!]!
    total: Int!
    page: Int!
    limit: Int!
    totalPages: Int!
  }

  type AppliedPromotionSnapshot {
    promotionId: ID!
    code: String
    name: String!
    type: String!
    discountType: String!
    discountValue: Float!
    maximumDiscount: Float
    actualDiscountAmount: Float!
  }

  type ValidateCouponResult {
    isValid: Boolean!
    message: String
    code: String
    discountType: String
    discountValue: Float
    discountAmount: Float
    newSubtotal: Float
    newGrandTotal: Float
  }

  input CreatePromotionInput {
    name: String!
    description: String
    type: String
    code: String
    discountType: String!
    discountValue: Float!
    maximumDiscount: Float
    minimumSubtotal: Float
    startsAt: String
    endsAt: String
    usageLimit: Int
    perCustomerLimit: Int
    isActive: Boolean
    targetProductIds: JSON
    targetCategoryIds: JSON
    priority: Int
  }

  input UpdatePromotionInput {
    name: String
    description: String
    type: String
    code: String
    discountType: String
    discountValue: Float
    maximumDiscount: Float
    minimumSubtotal: Float
    startsAt: String
    endsAt: String
    usageLimit: Int
    perCustomerLimit: Int
    isActive: Boolean
    targetProductIds: JSON
    targetCategoryIds: JSON
    priority: Int
  }

  extend type Query {
    adminGetAllPromotions(page: Int, limit: Int, search: String, isActive: Boolean): PaginatedPromotions!
    adminGetPromotionById(id: ID!): Promotion
    validateCoupon(code: String!, guestSessionToken: String, guestEmail: String): ValidateCouponResult!
  }

  extend type Mutation {
    adminCreatePromotion(input: CreatePromotionInput!): Promotion!
    adminUpdatePromotion(id: ID!, input: UpdatePromotionInput!): Promotion!
    adminTogglePromotionActive(id: ID!): Promotion!
    adminDeletePromotion(id: ID!): Boolean!
  }
`;

module.exports = promotionTypeDefs;
