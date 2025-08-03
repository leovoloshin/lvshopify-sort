import { gql } from '@apollo/client';

export const GET_COLLECTIONS = gql`
  query {
    collections(first: 250) {
      edges {
        node {
          id
          title
          handle
          sortOrder
        }
      }
    }
  }
`;

export const GET_COLLECTION_PRODUCTS = gql`
  query($id: ID!) {
    collection(id: $id) {
      products(first: 250, sortKey: MANUAL) {
        edges {
          node {
            id
            title
            images(first: 1) {
              edges {
                node { src }
              }
            }
            variants(first: 12) {
              edges {
                node {
                  id
                  title
                  inventoryQuantity
                }
              }
            }
          }
        }
      }
    }
  }
`;

export const REORDER_PRODUCTS = gql`
  mutation collectionReorderProducts($id: ID!, $moves: [MoveInput!]!) {
    collectionReorderProducts(id: $id, moves: $moves) {
      job { id }
      userErrors { field message }
    }
  }
`;