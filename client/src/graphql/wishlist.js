import { gql } from '@apollo/client';

export const GET_MY_WISHLIST = gql`
  query GetMyWishlist {
    getMyWishlist {
      id
      name
      slug
      shortDescription
      price
      compareAtPrice
      images
      stockQuantity
      optionsLabel
      isActive
      category {
        id
        name
        slug
      }
    }
  }
`;

export const ADD_TO_WISHLIST = gql`
  mutation AddToWishlist($productId: ID!) {
    addToWishlist(productId: $productId)
  }
`;

export const REMOVE_FROM_WISHLIST = gql`
  mutation RemoveFromWishlist($productId: ID!) {
    removeFromWishlist(productId: $productId)
  }
`;

export const TOGGLE_WISHLIST = gql`
  mutation ToggleWishlist($productId: ID!) {
    toggleWishlist(productId: $productId)
  }
`;

export const IS_IN_WISHLIST = gql`
  query IsInWishlist($productId: ID!) {
    isInWishlist(productId: $productId)
  }
`;
