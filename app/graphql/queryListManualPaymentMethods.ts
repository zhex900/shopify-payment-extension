import { PAYMENT_CUSTOMIZATION_NAME } from "~/constant";

//"data": {
//     "translatableResources": {
//       "nodes": [
//         {
//           "translatableContent": [
//             {
//               "key": "name",
//               "value": "Pay by invoice"
//             },
//             {
//               "key": "message",
//               "value": ""
//             },
//             {
//               "key": "before_payment_instructions",
//               "value": ""
//             }
//           ]
//         }
//       ]
//     }
//   },
interface translatableResourcesResponse {
  data: {
    translatableResources: {
      nodes: {
        translatableContent: {
          key: string;
          value: string;
        }[];
      }[];
    };
  };
}

export const queryListManualPaymentMethods = async (admin: any) => {
  const response = (await (
    await admin.graphql(
      `#graphql
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
      `,
    )
  ).json()) as translatableResourcesResponse;

  // cons;
  return response;
};
