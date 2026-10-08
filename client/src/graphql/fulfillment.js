import { gql } from '@apollo/client';

export const GET_MY_ORDER_SHIPMENTS = gql`
  query GetMyOrderShipments($orderId: ID!) {
    getMyOrderShipments(orderId: $orderId) {
      id
      orderId
      provider
      providerShipmentId
      awbNumber
      trackingNumber
      status
      shippingMethodCode
      shippingAddressSnapshot
      packageDetails
      estimatedDeliveryAt
      shippedAt
      deliveredAt
      cancelledAt
      cancelledReason
      notes
      createdAt
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
`;

export const GET_SHIPMENT_TRACKING = gql`
  query GetShipmentTracking($awbNumber: String!) {
    getShipmentTracking(awbNumber: $awbNumber) {
      provider
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
      }
    }
  }
`;

export const CHECK_POSTAL_SERVICEABILITY = gql`
  query CheckPostalServiceability($postalCode: String!, $shippingMethodCode: String) {
    checkPostalServiceability(postalCode: $postalCode, shippingMethodCode: $shippingMethodCode) {
      serviceable
      provider
      postalCode
      country
      state
      estimatedDays
      availableMethods
    }
  }
`;

export const ADMIN_GET_ALL_SHIPMENTS = gql`
  query AdminGetAllShipments($status: String, $page: Int, $limit: Int) {
    adminGetAllShipments(status: $status, page: $page, limit: $limit) {
      id
      orderId
      provider
      providerShipmentId
      awbNumber
      trackingNumber
      status
      shippingMethodCode
      shippingAddressSnapshot
      packageDetails
      estimatedDeliveryAt
      shippedAt
      deliveredAt
      cancelledAt
      cancelledReason
      notes
      createdAt
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
`;

export const ADMIN_GET_ORDER_SHIPMENTS = gql`
  query AdminGetOrderShipments($orderId: ID!) {
    adminGetOrderShipments(orderId: $orderId) {
      id
      orderId
      provider
      providerShipmentId
      awbNumber
      trackingNumber
      status
      shippingMethodCode
      packageDetails
      estimatedDeliveryAt
      shippedAt
      deliveredAt
      cancelledAt
      notes
      createdAt
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
`;

export const ADMIN_CREATE_SHIPMENT = gql`
  mutation AdminCreateShipment($input: CreateShipmentInput!) {
    adminCreateShipment(input: $input) {
      id
      orderId
      provider
      providerShipmentId
      awbNumber
      trackingNumber
      status
      estimatedDeliveryAt
      createdAt
      trackingEvents {
        id
        status
        location
        description
        eventTime
      }
    }
  }
`;

export const ADMIN_UPDATE_SHIPMENT_STATUS = gql`
  mutation AdminUpdateShipmentStatus($input: UpdateShipmentStatusInput!) {
    adminUpdateShipmentStatus(input: $input) {
      id
      status
      shippedAt
      deliveredAt
      cancelledAt
      trackingEvents {
        id
        status
        location
        description
        eventTime
      }
    }
  }
`;

export const ADMIN_CANCEL_SHIPMENT = gql`
  mutation AdminCancelShipment($shipmentId: ID!, $reason: String) {
    adminCancelShipment(shipmentId: $shipmentId, reason: $reason) {
      id
      status
      cancelledAt
      cancelledReason
    }
  }
`;

export const ADMIN_ADD_TRACKING_EVENT = gql`
  mutation AdminAddTrackingEvent(
    $shipmentId: ID!
    $status: String!
    $location: String
    $description: String
  ) {
    adminAddTrackingEvent(
      shipmentId: $shipmentId
      status: $status
      location: $location
      description: $description
    ) {
      id
      status
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
`;
