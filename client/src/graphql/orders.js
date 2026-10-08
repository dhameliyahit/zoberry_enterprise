import { gql } from '@apollo/client';

export const PREVIEW_CHECKOUT = gql`
  query PreviewCheckout($guestSessionToken: String) {
    previewCheckout(guestSessionToken: $guestSessionToken) {
      itemCount
      subtotal
      discountAmount
      shippingAmount
      taxAmount
      grandTotal
      isReadyForCheckout
      validationErrors
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

export const CREATE_ORDER_FROM_CART = gql`
  mutation CreateOrderFromCart($input: CreateOrderInput!) {
    createOrderFromCart(input: $input) {
      id
      orderNumber
      userId
      guestEmail
      guestPhone
      status
      paymentStatus
      fulfillmentStatus
      currency
      subtotal
      discountAmount
      shippingAmount
      taxAmount
      grandTotal
      shippingAddressSnapshot
      billingAddressSnapshot
      notes
      createdAt
      items {
        id
        productId
        variantId
        productName
        variantTitle
        sku
        quantity
        unitPrice
        lineTotal
        productImage
      }
    }
  }
`;

export const GET_MY_ORDERS = gql`
  query GetMyOrders {
    getMyOrders {
      id
      orderNumber
      status
      paymentStatus
      fulfillmentStatus
      currency
      subtotal
      shippingAmount
      taxAmount
      grandTotal
      createdAt
      items {
        id
        productId
        productName
        variantTitle
        quantity
        unitPrice
        lineTotal
        productImage
      }
    }
  }
`;

export const GET_MY_ORDER = gql`
  query GetMyOrder($id: ID!) {
    getMyOrder(id: $id) {
      id
      orderNumber
      status
      paymentStatus
      fulfillmentStatus
      currency
      subtotal
      shippingAmount
      taxAmount
      grandTotal
      shippingAddressSnapshot
      notes
      createdAt
      items {
        id
        productId
        variantId
        productName
        variantTitle
        sku
        quantity
        unitPrice
        lineTotal
        productImage
      }
    }
  }
`;

export const GET_ORDER_BY_NUMBER = gql`
  query GetOrderByNumber($orderNumber: String!) {
    getOrderByNumber(orderNumber: $orderNumber) {
      id
      orderNumber
      userId
      guestEmail
      guestPhone
      status
      paymentStatus
      fulfillmentStatus
      currency
      subtotal
      shippingAmount
      taxAmount
      grandTotal
      shippingAddressSnapshot
      notes
      createdAt
      items {
        id
        productId
        variantId
        productName
        variantTitle
        sku
        quantity
        unitPrice
        lineTotal
        productImage
      }
    }
  }
`;

export const CANCEL_ORDER = gql`
  mutation CancelOrder($orderId: ID!, $reason: String) {
    cancelOrder(orderId: $orderId, reason: $reason) {
      id
      orderNumber
      status
      cancelledReason
    }
  }
`;
