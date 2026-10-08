import { gql } from '@apollo/client';

export const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    getCurrentUser {
      id
      email
      role
      isGuestConverted
      createdAt
    }
  }
`;

export const LOGIN_USER = gql`
  mutation LoginUser($email: String!, $password: String!) {
    loginUser(email: $email, password: $password) {
      token
      user {
        id
        email
        role
      }
    }
  }
`;

export const REGISTER_USER = gql`
  mutation RegisterUser($email: String!, $password: String!) {
    registerUser(email: $email, password: $password) {
      token
      user {
        id
        email
        role
      }
    }
  }
`;

export const GOOGLE_LOGIN = gql`
  mutation GoogleLoginUser($token: String!) {
    googleLoginUser(token: $token) {
      token
      user {
        id
        email
        role
      }
    }
  }
`;
