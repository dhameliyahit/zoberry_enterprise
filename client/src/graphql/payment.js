import { gql } from '@apollo/client';

export const INITIATE_PAYMENT = gql`
  mutation InitiatePayment($orderNumber: String!) {
    initiatePayment(orderNumber: $orderNumber) {
      orderNumber
      paymentId
      merchantOrderId
      redirectUrl
      paymentStatus
      message
    }
  }
`;

export const GET_PAYMENT_STATUS = gql`
  query GetPaymentStatus($orderNumber: String!) {
    getPaymentStatus(orderNumber: $orderNumber) {
      orderNumber
      paymentStatus
      orderStatus
      grandTotal
      paidAt
      providerPaymentId
      message
    }
  }
`;
