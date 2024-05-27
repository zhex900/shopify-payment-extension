import { PAYMENT_CUSTOMIZATION_NAME } from "~/constant";

export const queryIsPaymentCustomizationsInstalled = async (admin: any) => {
  const paymentCustomizations = await (
    await admin.graphql(
      `#graphql
      query {
        paymentCustomizations(first:25) {
          edges{
            node {
              title
              id
            }
          }
        }
      }
      `,
    )
  ).json();

  return !!paymentCustomizations.data.paymentCustomizations.edges.find(
    (edge: any) => edge.node.title === PAYMENT_CUSTOMIZATION_NAME,
  );
};
