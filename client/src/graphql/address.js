import { gql } from '@apollo/client';

export const GET_MY_ADDRESSES = gql`
  query GetMyAddresses {
    getMyAddresses {
      id
      userId
      fullName
      phone
      addressLine1
      addressLine2
      landmark
      city
      state
      postalCode
      country
      addressType
      isDefaultShipping
      isDefaultBilling
      createdAt
    }
  }
`;

export const CREATE_ADDRESS = gql`
  mutation CreateAddress($input: CreateAddressInput!) {
    createAddress(input: $input) {
      id
      userId
      fullName
      phone
      addressLine1
      addressLine2
      landmark
      city
      state
      postalCode
      country
      addressType
      isDefaultShipping
      isDefaultBilling
    }
  }
`;

export const UPDATE_ADDRESS = gql`
  mutation UpdateAddress($id: ID!, $input: UpdateAddressInput!) {
    updateAddress(id: $id, input: $input) {
      id
      fullName
      phone
      addressLine1
      addressLine2
      landmark
      city
      state
      postalCode
      country
      addressType
      isDefaultShipping
      isDefaultBilling
    }
  }
`;

export const DELETE_ADDRESS = gql`
  mutation DeleteAddress($id: ID!) {
    deleteAddress(id: $id)
  }
`;

export const SET_DEFAULT_SHIPPING_ADDRESS = gql`
  mutation SetDefaultShippingAddress($id: ID!) {
    setDefaultShippingAddress(id: $id) {
      id
      isDefaultShipping
    }
  }
`;
