import { gql } from '@apollo/client';

export const VALIDATE_COUPON = gql`
  query ValidateCoupon($code: String!, $guestSessionToken: String) {
    validateCoupon(code: $code, guestSessionToken: $guestSessionToken) {
      isValid
      code
      name
      discountType
      discountValue
      discountAmount
      minimumSubtotal
      maximumDiscount
      message
    }
  }
`;

export const ADMIN_GET_ALL_PROMOTIONS = gql`
  query AdminGetAllPromotions($filter: PromotionFilterInput, $pagination: PromotionPaginationInput) {
    adminGetAllPromotions(filter: $filter, pagination: $pagination) {
      promotions {
        id
        code
        name
        description
        type
        discountType
        discountValue
        minimumSubtotal
        maximumDiscount
        startsAt
        endsAt
        usageLimit
        perCustomerLimit
        usageCount
        isActive
        targetProductIds
        targetCategoryIds
        createdAt
        updatedAt
      }
      totalCount
      page
      limit
      totalPages
    }
  }
`;

export const ADMIN_GET_PROMOTION_BY_ID = gql`
  query AdminGetPromotionById($id: ID!) {
    adminGetPromotionById(id: $id) {
      id
      code
      name
      description
      type
      discountType
      discountValue
      minimumSubtotal
      maximumDiscount
      startsAt
      endsAt
      usageLimit
      perCustomerLimit
      usageCount
      isActive
      targetProductIds
      targetCategoryIds
      createdAt
      updatedAt
    }
  }
`;

export const ADMIN_CREATE_PROMOTION = gql`
  mutation AdminCreatePromotion($input: CreatePromotionInput!) {
    adminCreatePromotion(input: $input) {
      id
      code
      name
      description
      type
      discountType
      discountValue
      minimumSubtotal
      maximumDiscount
      startsAt
      endsAt
      usageLimit
      perCustomerLimit
      usageCount
      isActive
      targetProductIds
      targetCategoryIds
      createdAt
    }
  }
`;

export const ADMIN_UPDATE_PROMOTION = gql`
  mutation AdminUpdatePromotion($id: ID!, $input: UpdatePromotionInput!) {
    adminUpdatePromotion(id: $id, input: $input) {
      id
      code
      name
      description
      type
      discountType
      discountValue
      minimumSubtotal
      maximumDiscount
      startsAt
      endsAt
      usageLimit
      perCustomerLimit
      usageCount
      isActive
      targetProductIds
      targetCategoryIds
      updatedAt
    }
  }
`;

export const ADMIN_TOGGLE_PROMOTION_ACTIVE = gql`
  mutation AdminTogglePromotionActive($id: ID!, $isActive: Boolean!) {
    adminTogglePromotionActive(id: $id, isActive: $isActive) {
      id
      isActive
      updatedAt
    }
  }
`;

export const ADMIN_DELETE_PROMOTION = gql`
  mutation AdminDeletePromotion($id: ID!) {
    adminDeletePromotion(id: $id) {
      success
      message
    }
  }
`;
