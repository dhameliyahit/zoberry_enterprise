import { gql } from '@apollo/client';

export const GET_PRODUCTS = gql`
  query GetProducts(
    $filter: ProductFilterInput
    $page: Int
    $limit: Int
    $sortBy: ProductSortBy
  ) {
    getProducts(filter: $filter, page: $page, limit: $limit, sortBy: $sortBy) {
      items {
        id
        name
        slug
        shortDescription
        price
        compareAtPrice
        images
        stockQuantity
        hasVariants
        optionsLabel
        isActive
        category {
          id
          name
          slug
        }
        variants {
          id
          sku
          title
          price
          compareAtPrice
          stockQuantity
          options
          isActive
        }
      }
      total
      page
      limit
      totalPages
      hasMore
    }
  }
`;

export const GET_ALL_PRODUCTS = gql`
  query GetAllProducts($limit: Int, $offset: Int) {
    getAllProducts(limit: $limit, offset: $offset) {
      id
      name
      slug
      shortDescription
      price
      compareAtPrice
      images
      stockQuantity
      hasVariants
      optionsLabel
      isActive
      category {
        id
        name
        slug
      }
      variants {
        id
        sku
        title
        price
        compareAtPrice
        stockQuantity
        options
        isActive
      }
    }
  }
`;

export const GET_PRODUCT_BY_SLUG = gql`
  query GetProductBySlug($slug: String!) {
    getProductBySlug(slug: $slug) {
      id
      categoryId
      name
      slug
      shortDescription
      description
      price
      costPrice
      compareAtPrice
      images
      stockQuantity
      hasVariants
      optionsLabel
      productVideoUrl
      features
      isActive
      category {
        id
        name
        slug
      }
      variants {
        id
        sku
        title
        price
        compareAtPrice
        costPrice
        stockQuantity
        options
        isActive
      }
      createdAt
    }
  }
`;

export const GET_ALL_CATEGORIES = gql`
  query GetAllCategories {
    getAllCategories {
      id
      name
      slug
      description
      imageUrl
      icon
      isActive
      productCount
    }
  }
`;
