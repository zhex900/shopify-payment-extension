import { sessionsTable } from "./storage";
import { appUrlParameter } from "./ssm";
import toml from "toml";
import fs from "node:fs";

const shopifyAppConfig = toml.parse(
  fs.readFileSync(`${__dirname}/../../../shopify.app.toml`, "utf-8"),
);

const shopifyApiKey = new sst.Secret("ApiKey", shopifyAppConfig.client_id);
const shopifyApiSecret = new sst.Secret(
  "ApiSecret",
  process.env.SHOPIFY_API_SECRET,
);

export const remix = new sst.aws.Remix("ShopifyApp", {
  link: [sessionsTable, shopifyApiKey, shopifyApiSecret],
  permissions: [
    // read parameter from ssm
    {
      actions: ["ssm:GetParameter"],
      resources: [appUrlParameter.arn],
    },
  ],
  environment: {
    SHOPIFY_APP_URL_PARAMETER_NAME: appUrlParameter.name,
    SHOPIFY_APP_URL: process.env.SHOPIFY_APP_URL || "",
    SHOP_CUSTOM_DOMAIN: process.env.SHOP_CUSTOM_DOMAIN || "",
    SHOPIFY_SCOPES: shopifyAppConfig.access_scopes.scopes || "",
    SESSIONS_TABLE_NAME: sessionsTable.name,
    REGION: "ap-southeast-2",
  },
});
