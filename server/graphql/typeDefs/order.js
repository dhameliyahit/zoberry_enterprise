const orderTypeDefs = `#graphql
  type OrderItem {
    id: ID!
    orderId: ID!
    productId: ID!
    variantId: ID
    productName: String!
    variantTitle: String
    sku: String
    quantity: Int!
    unitPrice: Float!
    lineTotal: Float!
    productImage: String
    metadata: JSON
    createdAt: String
    updatedAt: String
  }

  type Order {
    id: ID!
    orderNumber: String!
    userId: ID
    guestEmail: String
    guestPhone: String
    status: String!
    paymentStatus: String!
    fulfillmentStatus: String!
    currency: String!
    subtotal: Float!
    discountAmount: Float!
    shippingAmount: Float!
    taxAmount: Float!
    grandTotal: Float!
    shippingAddressSnapshot: JSON!
    billingAddressSnapshot: JSON
    couponCode: String
    discountSnapshot: JSON
    idempotencyKey: String
    notes: String
    cancelledReason: String
    shippedAt: String
    deliveredAt: String
    items: [OrderItem!]!
    createdAt: String
    updatedAt: String
  }

  type CheckoutPreview {
    items: [CartItem!]!
    itemCount: Int!
    subtotal: Float!
    discountAmount: Float!
    couponCode: String
    appliedCoupon: AppliedPromotionSnapshot
    shippingAmount: Float!
    taxAmount: Float!
    grandTotal: Float!
    isReadyForCheckout: Boolean!
    validationErrors: [String!]
  }

  input GuestShippingAddressInput {
    fullName: String!
    phone: String!
    addressLine1: String!
    addressLine2: String
    landmark: String
    city: String!
    state: String!
    postalCode: String!
    country: String
  }

  input CreateOrderInput {
    shippingAddressId: ID
    guestShippingAddress: GuestShippingAddressInput
    guestEmail: String
    guestPhone: String
    guestSessionToken: String
    couponCode: String
    idempotencyKey: String!
    notes: String
  }

  extend type Query {
    getMyOrders: [Order!]!
    getMyOrder(id: ID!): Order
    getOrderByNumber(orderNumber: String!): Order
    previewCheckout(guestSessionToken: String, couponCode: String): CheckoutPreview!
    adminGetAllOrders(status: String, page: Int, limit: Int): [Order!]!
    adminGetOrderById(id: ID!): Order
  }

  extend type Mutation {
    createOrderFromCart(input: CreateOrderInput!): Order!
    cancelOrder(orderId: ID!, reason: String): Order!
    adminUpdateOrderStatus(orderId: ID!, status: String!, notes: String): Order!
    adminUpdatePaymentStatus(orderId: ID!, paymentStatus: String!): Order!
  }
`;

module.exports = orderTypeDefs;
