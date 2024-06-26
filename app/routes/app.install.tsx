import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  useActionData,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import { TitleBar } from "@shopify/app-bridge-react";
import {
  BlockStack,
  Box,
  Button,
  Card,
  InlineStack,
  Layout,
  Page,
  Text,
} from "@shopify/polaris";

import { PAYMENT_CUSTOMIZATION_NAME } from "~/constant";
import { queryPaymentCustomizationsConfiguration } from "~/graphql/queryPaymentCustomizations";
import { authenticate } from "~/shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  const { isInstalled } = await queryPaymentCustomizationsConfiguration(
    admin.graphql,
  );

  return {
    isInstalled,
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  // find the function id
  const response = await admin.graphql(
    `#graphql
    query {
      shopifyFunctions(first: 250) {
        nodes {
          app {
            title
          }
          apiType
          title
          id
        }
      }
    }
    `,
  );
  const responseJson = await response.json();

  const paymentFunctionId = responseJson.data.shopifyFunctions.nodes.find(
    (node: any) => node.title === "payment-customization",
  )?.id;

  const result = await admin.graphql(
    `#graphql
    mutation {
      paymentCustomizationCreate(paymentCustomization: {
        title: "${PAYMENT_CUSTOMIZATION_NAME}",
        enabled: true,
        functionId: "${paymentFunctionId}",
      }) {
        paymentCustomization {
          id
        }
        userErrors {
          message
        }
      }
    }`,
  );
  const resultJson = await result.json();

  return json(resultJson.data.paymentCustomizationCreate);
};
// check if the payment extension is installed

export default function Index() {
  const nav = useNavigation();
  const actionData = useActionData<typeof action>();
  const submit = useSubmit();
  const data = useLoaderData<typeof loader>();
  const isLoading =
    ["loading", "submitting"].includes(nav.state) && nav.formMethod === "POST";

  const install = () => submit({}, { replace: true, method: "POST" });

  return (
    <Page>
      <TitleBar title="Payment Customisation"></TitleBar>
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="500">
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd">
                    Installation
                  </Text>
                </BlockStack>

                {data.isInstalled && (
                  <Text as="p">Payment extension is installed</Text>
                )}
                <InlineStack gap="300">
                  <Button
                    loading={isLoading}
                    onClick={install}
                    disabled={data.isInstalled}
                  >
                    Install payment extension
                  </Button>
                </InlineStack>
                {actionData && (
                  <InlineStack gap="300">
                    <Box
                      padding="400"
                      background="bg-surface-active"
                      borderWidth="025"
                      borderRadius="200"
                      borderColor="border"
                      overflowX="scroll"
                    >
                      <pre style={{ margin: 0 }}>
                        <code>{JSON.stringify(actionData, null, 2)}</code>
                      </pre>
                    </Box>
                  </InlineStack>
                )}
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
