import "@shopify/shopify-app-remix/adapters/node";

import { SSM } from "@aws-sdk/client-ssm";
import { restResources } from "@shopify/shopify-api/rest/admin/2024-04";
import {
  ApiVersion,
  AppDistribution,
  DeliveryMethod,
  shopifyApp,
} from "@shopify/shopify-app-remix/server";
import { DynamoDBSessionStorage } from "@shopify/shopify-app-session-storage-dynamodb";
import { Resource } from "sst";

const ssm = new SSM({
  region: process.env.REGION,
});

let appUrl = process.env.SHOPIFY_APP_URL;

if (!appUrl) {
  if (!process.env.SHOPIFY_APP_URL_PARAMETER_NAME) {
    throw new Error("SHOPIFY_APP_URL_PARAMETER_NAME is required");
  }
  appUrl = (
    await ssm.getParameter({
      Name: process.env.SHOPIFY_APP_URL_PARAMETER_NAME,
    })
  )?.Parameter?.Value;
}

if (!appUrl) {
  throw new Error("SHOPIFY_APP_URL is required");
}

const shopify = shopifyApp({
  apiKey: Resource.ApiKey.value,
  apiSecretKey: Resource.ApiSecret.value,
  appUrl,
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
export type AdminMain = Awaited<ReturnType<typeof authenticate.admin>>;

export type AdminApiContext = AdminMain["admin"];
export type AdminApiSession = AdminMain["session"];

export type AdminGraphqlClient = AdminApiContext["graphql"];
export type AdminRestClient = AdminApiContext["rest"];
