import { gql } from '@apollo/client';

export const GET_AVAILABLE_SHIPPING_METHODS = gql`
  query GetAvailableShippingMethods($subtotal: Float, $postalCode: String) {
    getAvailableShippingMethods(subtotal: $subtotal, postalCode: $postalCode) {
      id
      code
      name
      description
      basePrice
      actualPrice
      freeThreshold
      isFree
      estimatedDays
      isActive
    }
  }
`;

export const GET_TAX_RULES = gql`
  query GetTaxRules {
    getTaxRules {
      id
      name
      ratePercent
      isInclusive
      isActive
      country
      state
      createdAt
    }
  }
`;

export const ADMIN_GET_ALL_SHIPPING_METHODS = gql`
  query AdminGetAllShippingMethods {
    adminGetAllShippingMethods {
      id
      code
      name
      description
      price
      freeThreshold
      estimatedDays
      isActive
      priority
      createdAt
      updatedAt
    }
  }
`;

export const ADMIN_CREATE_SHIPPING_METHOD = gql`
  mutation AdminCreateShippingMethod($input: ShippingMethodInput!) {
    adminCreateShippingMethod(input: $input) {
      id
      code
      name
      description
      price
      freeThreshold
      estimatedDays
      isActive
      priority
    }
  }
`;

export const ADMIN_UPDATE_SHIPPING_METHOD = gql`
  mutation AdminUpdateShippingMethod($id: ID!, $input: ShippingMethodInput!) {
    adminUpdateShippingMethod(id: $id, input: $input) {
      id
      code
      name
      description
      price
      freeThreshold
      estimatedDays
      isActive
      priority
    }
  }
`;

export const ADMIN_TOGGLE_SHIPPING_METHOD_ACTIVE = gql`
  mutation AdminToggleShippingMethodActive($id: ID!) {
    adminToggleShippingMethodActive(id: $id) {
      id
      code
      isActive
    }
  }
`;

export const ADMIN_CREATE_TAX_RULE = gql`
  mutation AdminCreateTaxRule($input: TaxRuleInput!) {
    adminCreateTaxRule(input: $input) {
      id
      name
      ratePercent
      isInclusive
      isActive
      country
      state
    }
  }
`;

export const ADMIN_UPDATE_TAX_RULE = gql`
  mutation AdminUpdateTaxRule($id: ID!, $input: TaxRuleInput!) {
    adminUpdateTaxRule(id: $id, input: $input) {
      id
      name
      ratePercent
      isInclusive
      isActive
      country
      state
    }
  }
`;

export const ADMIN_TOGGLE_TAX_RULE_ACTIVE = gql`
  mutation AdminToggleTaxRuleActive($id: ID!) {
    adminToggleTaxRuleActive(id: $id) {
      id
      name
      isActive
    }
  }
`;
