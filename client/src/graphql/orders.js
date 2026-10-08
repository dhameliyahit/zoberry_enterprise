import { gql } from '@apollo/client';

export const PREVIEW_CHECKOUT = gql`
  query PreviewCheckout(
    $guestSessionToken: String
    $couponCode: String
    $shippingMethodCode: String
    $shippingAddressId: ID
    $postalCode: String
  ) {
    previewCheckout(
      guestSessionToken: $guestSessionToken
      couponCode: $couponCode
      shippingMethodCode: $shippingMethodCode
      shippingAddressId: $shippingAddressId
      postalCode: $postalCode
    ) {
      itemCount
      subtotal
      discountAmount
      couponCode
      appliedCoupon {
        promotionId
        code
        name
        type
        discountType
        discountValue
        maximumDiscount
        actualDiscountAmount
      }
      shippingAmount
      shippingMethod
      taxAmount
      grandTotal
      isReadyForCheckout
      validationErrors
      availableShippingMethods {
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
      shippingSnapshot {
        code
        name
        basePrice
        actualShippingFee
        freeThreshold
        isFree
        estimatedDays
      }
      taxSnapshot {
        name
        ratePercent
        isInclusive
        taxAmount
      }
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
      couponCode
      discountAmount
      shippingAmount
      shippingMethod
      shippingSnapshot
      taxAmount
      taxSnapshot
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
      shippingMethod
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
      discountAmount
      couponCode
      shippingAmount
      shippingMethod
      shippingSnapshot
      taxAmount
      taxSnapshot
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
      shipments {
        id
        provider
        providerShipmentId
        awbNumber
        trackingNumber
        status
        shippingMethodCode
        estimatedDeliveryAt
        shippedAt
        deliveredAt
        trackingEvents {
          id
          status
          location
          description
          eventTime
          source
        }
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
      discountAmount
      couponCode
      shippingAmount
      shippingMethod
      shippingSnapshot
      taxAmount
      taxSnapshot
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
      shipments {
        id
        provider
        providerShipmentId
        awbNumber
        trackingNumber
        status
        shippingMethodCode
        estimatedDeliveryAt
        shippedAt
        deliveredAt
        trackingEvents {
          id
          status
          location
          description
          eventTime
          source
        }
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
