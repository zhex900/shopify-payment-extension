import { PAYMENT_CUSTOMIZATION_NAME } from "~/constant";
import type { AdminGraphqlClient } from "~/shopify.server";

interface PaymentCustomizationsResponse {
  data: {
    paymentCustomizations: {
      edges: Array<{
        node: {
          title: string;
          id: string;
          metafields: {
            nodes: Array<{
              id: string;
              namespace: string;
              key: string;
              value: string;
            }>;
          };
        };
      }>;
    };
  };
}

const query = `
  #graphql
  query {
    paymentCustomizations(first: 25) {
      edges {
        node {
          title
          id
          metafields(first: 100) {
            nodes {
              id
              namespace
              key
              value
            }
          }
        }
      }
    }
  }
`;

export const queryPaymentCustomizationsConfiguration = async (
  graphql: AdminGraphqlClient,
) => {
  const paymentCustomizations = (await (
    await graphql(query)
  ).json()) as PaymentCustomizationsResponse;

  const paymentCustomizationNode =
    paymentCustomizations.data.paymentCustomizations.edges.find(
      (edge: any) => edge.node.title === PAYMENT_CUSTOMIZATION_NAME,
    );
  if (!paymentCustomizationNode) {
    return { isInstalled: false };
  }

  const configurationJSON = paymentCustomizationNode.node.metafields.nodes.find(
    (node) => {
      return node.key === "function-configuration";
    },
  );

  return {
    isInstalled: true,
    paymentCustomizationId: paymentCustomizationNode.node.id,
    configuration: (configurationJSON?.value
      ? JSON.parse(configurationJSON?.value)
      : undefined) as
      | {
          tag: string;
          paymentMethod: string;
        }
      | undefined,
  };
};
