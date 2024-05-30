import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  useActionData,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import { useAppBridge } from "@shopify/app-bridge-react";
import {
  BlockStack,
  Box,
  Button,
  ButtonGroup,
  Card,
  InlineGrid,
  InlineStack,
  Page,
  Text,
} from "@shopify/polaris";
import { PaymentFilledIcon, ProductFilledIcon } from "@shopify/polaris-icons";
import { useEffect, useState } from "react";

import { AutocompleteField } from "~/components/autocomplete-field";
import {
  queryListCustomerTags,
  queryListManualPaymentMethods,
  queryPaymentCustomizationsConfiguration,
} from "~/graphql";
import { authenticate } from "~/shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const graphql = admin.graphql;

  const { isInstalled, paymentCustomizationId, configuration } =
    await queryPaymentCustomizationsConfiguration(graphql);

  if (!isInstalled || !paymentCustomizationId) {
    const url = new URL(request.url);
    throw redirect(`/app/install?${url.searchParams.toString()}`);
  }

  const customerTags = await queryListCustomerTags(graphql);
  const paymentMethods = await queryListManualPaymentMethods(graphql);
  console.log({
    customerTags,
    paymentMethods,
    configuration,
    paymentCustomizationId,
  });
  return {
    customerTags,
    paymentMethods,
    configuration,
    paymentCustomizationId,
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  console.log("save", JSON.stringify(data, null, 2));
  const response = await admin.graphql(
    `#graphql
    mutation save($metafield: MetafieldsSetInput!) {
      metafieldsSet(metafields: [$metafield]) {
        metafields {
          id
        }
        userErrors {
          message
        }
      }
    }
    `,
    {
      variables: {
        metafield: {
          ownerId: data.paymentCustomizationId,
          namespace: "payment-customization",
          key: "function-configuration",
          value: JSON.stringify({
            tag: data.tagValue,
            paymentMethod: data.paymentMethodValue,
            paymentMethods: JSON.parse(data.paymentMethods as string),
          }),
          type: "json",
        },
      },
    },
  );
  const responseJson = await response.json();

  console.log(JSON.stringify(responseJson, null, 2));
  return json("ok");
};

export default function Index() {
  const nav = useNavigation();
  const {
    customerTags,
    paymentMethods,
    configuration,
    paymentCustomizationId,
  } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const submit = useSubmit();
  const shopify = useAppBridge();
  const isLoading =
    ["loading", "submitting"].includes(nav.state) && nav.formMethod === "POST";

  useEffect(() => {
    if (actionData === "ok" && !isLoading) {
      shopify.toast.show("Configuration saved");
    }
  }, [actionData, shopify, isLoading]);
  const [tagValue, setTagValue] = useState(configuration?.tag || "");
  const [paymentMethodValue, setPaymentMethodValue] = useState(
    configuration?.paymentMethod || "",
  );

  const saveHandler = () =>
    submit(
      {
        tagValue,
        paymentMethodValue,
        paymentCustomizationId,
        paymentMethods: JSON.stringify(paymentMethods),
      },
      { replace: true, method: "POST" },
    );

  return (
    <Page fullWidth title="Payment Customisation">
      <BlockStack gap={{ xs: "800", sm: "400" }}>
        <InlineGrid columns={{ xs: "1fr", md: "2fr 5fr" }} gap="400">
          <Box
            as="section"
            paddingInlineStart={{ xs: "400", sm: "0" }}
            paddingInlineEnd={{ xs: "400", sm: "0" }}
          >
            <BlockStack gap="400">
              <Text as="h3" variant="headingMd">
                Configuration
              </Text>
              <Text as="p" variant="bodyMd">
                The selected manual payment method will only be available to
                customers with the selected tag. All other manual payment
                methods will be hidden.
              </Text>
            </BlockStack>
          </Box>
          <Card roundedAbove="sm">
            <BlockStack gap="400">
              <AutocompleteField
                icon={ProductFilledIcon}
                label="Customer tag"
                options={customerTags}
                inputValue={tagValue}
                setInputValue={setTagValue}
                placeholder="Select a customer tag"
              />
              <AutocompleteField
                icon={PaymentFilledIcon}
                label="Manual payment method"
                options={paymentMethods}
                inputValue={paymentMethodValue}
                setInputValue={setPaymentMethodValue}
                placeholder="Select a manual payment method"
              />
              <InlineStack align="end">
                <ButtonGroup>
                  <Button
                    disabled={
                      tagValue === configuration?.tag &&
                      paymentMethodValue === configuration?.paymentMethod
                    }
                    onClick={() => {
                      setTagValue(configuration?.tag || "");
                      setPaymentMethodValue(configuration?.paymentMethod || "");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    disabled={
                      tagValue === configuration?.tag &&
                      paymentMethodValue === configuration?.paymentMethod
                    }
                    variant="primary"
                    onClick={saveHandler}
                    loading={isLoading}
                  >
                    Save
                  </Button>
                </ButtonGroup>
              </InlineStack>
            </BlockStack>
          </Card>
        </InlineGrid>
      </BlockStack>
    </Page>
  );
}
