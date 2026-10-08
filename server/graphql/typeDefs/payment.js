const paymentTypeDefs = `#graphql
  enum PaymentStatus {
    PENDING
    INITIATED
    SUCCESS
    FAILED
    CANCELLED
    EXPIRED
    REFUNDED
  }

  type Payment {
    id: ID!
    orderId: ID!
    merchantOrderId: String!
    provider: String!
    amount: Float!
    currency: String!
    status: PaymentStatus!
    redirectUrl: String
    providerPaymentId: String
    providerResponseCode: String
    paidAt: String
    createdAt: String!
    updatedAt: String!
  }

  type PaymentInitiationResult {
    orderNumber: String!
    paymentId: ID!
    merchantOrderId: String!
    redirectUrl: String
    paymentStatus: PaymentStatus!
    message: String
  }

  type PaymentStatusResult {
    orderNumber: String!
    paymentStatus: PaymentStatus!
    orderStatus: String!
    grandTotal: Float!
    paidAt: String
    providerPaymentId: String
    message: String
  }

  extend type Query {
    getPaymentStatus(orderNumber: String!): PaymentStatusResult!
    getOrderPayments(orderId: ID!): [Payment!]!
  }

  extend type Mutation {
    initiatePayment(orderNumber: String!): PaymentInitiationResult!
  }
`;

module.exports = paymentTypeDefs;
