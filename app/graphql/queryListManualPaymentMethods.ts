import type { AdminGraphqlClient } from "~/shopify.server";

interface translatableResourcesResponse {
  data: {
    translatableResources: {
      nodes: {
        translatableContent: {
          key: "name" | "message" | "payment_instructions";
          value: string;
        }[];
      }[];
    };
  };
}

export const queryListManualPaymentMethods = async (
  graphql: AdminGraphqlClient,
) => {
  const response = (await (
    await graphql(`
      #graphql
      query {
        translatableResources(first: 100, resourceType: PAYMENT_GATEWAY) {
          nodes {
            translatableContent {
              key
              value
            }
          }
        }
      }
    `)
  ).json()) as translatableResourcesResponse;

  return response.data.translatableResources.nodes.map(
    ({ translatableContent }) => {
      return translatableContent.find((t) => t.key === "name")?.value;
    },
  );
};
