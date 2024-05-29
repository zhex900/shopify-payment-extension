import type { AdminGraphqlClient } from "~/shopify.server";

interface CustomerTagsResponse {
  data: {
    customers: {
      edges: Array<{
        node: {
          tags: string[];
        };
      }>;
      pageInfo: {
        hasNextPage: boolean;
        endCursor: string;
      };
    };
  };
}

const fetchCustomerTags =
  (graphql: AdminGraphqlClient) =>
  async (cursor: string | null = null): Promise<CustomerTagsResponse> => {
    const query = `
    query ($cursor: String) {
      customers(first: 100, after: $cursor) {
        edges {
          node {
            tags
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `;

    const response = await graphql(query, { variables: { cursor } });

    // if (!response.ok) {
    //   throw new Error(`HTTP error! status: ${response.status}`);
    // }

    return response.json() as Promise<CustomerTagsResponse>;
  };

export const queryListCustomerTags = async (graphql: AdminGraphqlClient) => {
  let allTags: string[] = [];
  let cursor: string | null = null;
  let hasNextPage = true;

  while (hasNextPage) {
    const response = await fetchCustomerTags(graphql)(cursor);
    const { edges, pageInfo } = response.data.customers;

    edges.forEach((edge) => {
      allTags = [...allTags, ...edge.node.tags];
    });

    hasNextPage = pageInfo.hasNextPage;
    cursor = pageInfo.endCursor;
  }

  // Get unique tags
  return Array.from(new Set(allTags));
};
