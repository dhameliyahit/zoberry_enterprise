import { gql } from '@apollo/client';

export const GET_MY_CART = gql`
  query GetMyCart($guestSessionToken: String) {
    getMyCart(guestSessionToken: $guestSessionToken) {
      id
      userId
      guestSessionToken
      currency
      status
      itemCount
      subtotal
      discountAmount
      shippingAmount
      taxAmount
      grandTotal
      items {
        id
        cartId
        productId
        variantId
        quantity
        unitPrice
        lineTotal
        isAvailable
        availableStock
        product {
          id
          name
          slug
          images
          price
          compareAtPrice
          stockQuantity
          optionsLabel
        }
        variant {
          id
          sku
          title
          price
          compareAtPrice
          stockQuantity
          options
        }
      }
    }
  }
`;

export const ADD_TO_CART = gql`
  mutation AddToCart(
    $productId: ID!
    $variantId: ID
    $quantity: Int
    $guestSessionToken: String
  ) {
    addToCart(
      productId: $productId
      variantId: $variantId
      quantity: $quantity
      guestSessionToken: $guestSessionToken
    ) {
      id
      itemCount
      subtotal
      shippingAmount
      taxAmount
      grandTotal
      items {
        id
        productId
        variantId
        quantity
        unitPrice
        lineTotal
        isAvailable
        availableStock
        product {
          id
          name
          slug
          images
        }
        variant {
          id
          title
        }
      }
    }
  }
`;

export const UPDATE_CART_ITEM = gql`
  mutation UpdateCartItem(
    $cartItemId: ID!
    $quantity: Int!
    $guestSessionToken: String
  ) {
    updateCartItem(
      cartItemId: $cartItemId
      quantity: $quantity
      guestSessionToken: $guestSessionToken
    ) {
      id
      itemCount
      subtotal
      shippingAmount
      taxAmount
      grandTotal
      items {
        id
        productId
        variantId
        quantity
        unitPrice
        lineTotal
        isAvailable
        availableStock
        product {
          id
          name
          slug
          images
        }
        variant {
          id
          title
        }
      }
    }
  }
`;

export const REMOVE_CART_ITEM = gql`
  mutation RemoveCartItem($cartItemId: ID!, $guestSessionToken: String) {
    removeCartItem(
      cartItemId: $cartItemId
      guestSessionToken: $guestSessionToken
    ) {
      id
      itemCount
      subtotal
      shippingAmount
      taxAmount
      grandTotal
      items {
        id
        productId
        variantId
        quantity
        unitPrice
        lineTotal
      }
    }
  }
`;

export const CLEAR_CART = gql`
  mutation ClearCart($guestSessionToken: String) {
    clearCart(guestSessionToken: $guestSessionToken) {
      id
      itemCount
      subtotal
      grandTotal
      items {
        id
      }
    }
  }
`;

export const MERGE_GUEST_CART = gql`
  mutation MergeGuestCart($guestSessionToken: String!) {
    mergeGuestCart(guestSessionToken: $guestSessionToken) {
      id
      itemCount
      subtotal
      grandTotal
      items {
        id
        productId
        variantId
        quantity
        unitPrice
        lineTotal
        product {
          id
          name
          slug
          images
        }
      }
    }
  }
`;
