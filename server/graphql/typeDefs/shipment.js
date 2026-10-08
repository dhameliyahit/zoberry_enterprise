const shipmentTypeDefs = `#graphql
  type ShipmentTrackingEvent {
    id: ID!
    shipmentId: ID!
    status: String!
    location: String
    description: String
    eventTime: String!
    source: String!
    rawPayload: JSON
    createdAt: String!
  }

  type ShipmentPackageDetails {
    weightKg: Float
    lengthCm: Float
    widthCm: Float
    heightCm: Float
    packageType: String
  }

  type Shipment {
    id: ID!
    orderId: ID!
    provider: String!
    providerShipmentId: String
    awbNumber: String
    trackingNumber: String
    status: String!
    shippingMethodCode: String
    shippingAddressSnapshot: JSON!
    packageDetails: JSON
    estimatedDeliveryAt: String
    shippedAt: String
    deliveredAt: String
    cancelledAt: String
    cancelledReason: String
    notes: String
    trackingEvents: [ShipmentTrackingEvent!]
    createdAt: String!
    updatedAt: String!
  }

  type ServiceabilityResult {
    serviceable: Boolean!
    provider: String!
    postalCode: String!
    country: String!
    state: String
    estimatedDays: String
    availableMethods: [String!]!
  }

  input PackageDetailsInput {
    weightKg: Float
    lengthCm: Float
    widthCm: Float
    heightCm: Float
    packageType: String
  }

  input CreateShipmentInput {
    orderId: ID!
    provider: String
    packageDetails: PackageDetailsInput
    notes: String
    idempotencyKey: String
  }

  input UpdateShipmentStatusInput {
    shipmentId: ID!
    nextStatus: String!
    location: String
    description: String
  }

  type PublicTrackingEvent {
    id: ID!
    status: String!
    location: String
    description: String
    eventTime: String!
  }

  type PublicShipmentTracking {
    provider: String!
    awbNumber: String!
    trackingNumber: String
    status: String!
    shippingMethodCode: String
    estimatedDeliveryAt: String
    shippedAt: String
    deliveredAt: String
    trackingEvents: [PublicTrackingEvent!]!
  }

  extend type Query {
    getMyOrderShipments(orderId: ID!): [Shipment!]!
    getShipmentTracking(awbNumber: String!): PublicShipmentTracking
    checkPostalServiceability(postalCode: String!, shippingMethodCode: String): ServiceabilityResult!
    adminGetOrderShipments(orderId: ID!): [Shipment!]!
    adminGetShipmentById(id: ID!): Shipment
    adminGetAllShipments(status: String, page: Int, limit: Int): [Shipment!]!
  }

  extend type Mutation {
    adminCreateShipment(input: CreateShipmentInput!): Shipment!
    adminUpdateShipmentStatus(input: UpdateShipmentStatusInput!): Shipment!
    adminCancelShipment(shipmentId: ID!, reason: String): Shipment!
    adminAddTrackingEvent(
      shipmentId: ID!
      status: String!
      location: String
      description: String
    ): Shipment!
  }
`;

module.exports = shipmentTypeDefs;
