import path from "node:path";

import { LATEST_API_VERSION as apiVersion } from "@shopify/shopify-api";
import { MemorySessionStorage } from "@shopify/shopify-app-session-storage-memory";
import dotenv from "dotenv";
import { vi } from "vitest";

dotenv.config({
  path: path.resolve(__dirname, "../test-utilities/test.env"),
});

if (
  process.env.SHOPIFY_API_KEY === undefined ||
  process.env.SHOPIFY_API_SECRET === undefined ||
  process.env.SHOPIFY_APP_URL === undefined ||
  process.env.SCOPES === undefined
) {
  throw new Error("Test environment variables not set");
}

const apiKey = process.env.SHOPIFY_API_KEY;
const apiSecretKey = process.env.SHOPIFY_API_SECRET;
const appUrl = process.env.SHOPIFY_APP_URL;
const scopes = process.env.SCOPES;

const testConfig = function testConfig(overrides = {}) {
  // assignment to avoid hoisting
  return {
    apiKey,
    apiSecretKey,
    scopes: scopes.split(","),
    apiVersion,
    appUrl,
    sessionStorage: new MemorySessionStorage(),
    ...overrides,
  };
};

vi.stubGlobal(
  "shopify",
  vi.fn(() => ({
    config: vi.fn(),
    toast: vi.fn(),
  })),
);

vi.mock("@shopify/shopify-app-remix/server", async () => {
  const shopify = (await vi.importActual(
    "@shopify/shopify-app-remix/server",
  )) as {
    shopifyApp: (config: any) => any;
    boundary: {
      error: any;
      headers: any;
    };
  };

  return {
    ...shopify,
    shopifyApp: () => shopify.shopifyApp(testConfig()),
    boundary: {
      error: shopify.boundary.error,
      headers: shopify.boundary.headers,
    },
  };
});
