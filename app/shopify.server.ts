import "@shopify/shopify-app-remix/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  DeliveryMethod,
  shopifyApp,
} from "@shopify/shopify-app-remix/server";
import { restResources } from "@shopify/shopify-api/rest/admin/2024-04";
import { Resource } from "sst";
import { DynamoDBSessionStorage } from "@shopify/shopify-app-session-storage-dynamodb";
import { SSM } from "@aws-sdk/client-ssm";

const ssm = new SSM({
  region: process.env.REGION,
});

console.log("Resource.ApiKey.value", Resource.ApiKey.value);
console.log("Resource.ApiSecret.value", Resource.ApiSecret.value);

// read from ssm parameter
const appUrl = (
  await ssm.getParameter({
    Name: "/shopify-payment-extension/jakehe/app-url",
  })
)?.Parameter?.Value;

console.log("---->appUrl", appUrl);

const shopify = shopifyApp({
  apiKey: Resource.ApiKey.value,
  apiSecretKey: Resource.ApiSecret.value,
  appUrl: process.env.SHOPIFY_APP_URL || appUrl || "",
  apiVersion: ApiVersion.April24,
  scopes: process.env.SCOPES?.split(","),
  authPathPrefix: "/auth",
  sessionStorage: new DynamoDBSessionStorage({
    sessionTableName: process.env.SESSIONS_TABLE_NAME!,
    shopIndexName: "shopIndexName",
    config: {
      region: process.env.REGION,
    },
  }),
  distribution: AppDistribution.AppStore,
  restResources,
  webhooks: {
    APP_UNINSTALLED: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks",
    },
  },
  hooks: {
    afterAuth: async ({ session }) => {
      await shopify.registerWebhooks({ session });
    },
  },
  future: {
    v3_webhookAdminContext: true,
    v3_authenticatePublic: true,
    v3_lineItemBilling: true,
    unstable_newEmbeddedAuthStrategy: true,
  },
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
});

export default shopify;
export const apiVersion = ApiVersion.April24;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;
