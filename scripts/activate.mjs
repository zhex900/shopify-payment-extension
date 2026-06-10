/**
 * Activates the payment customization function on the store.
 *
 * Run after installing (or reinstalling) the app — uninstalling deletes the
 * app's customizations and they are not recreated automatically.
 *
 * Usage: npm run activate
 * Requires SHOPIFY_API_KEY and SHOPIFY_API_SECRET in .env.
 */
import { readFileSync } from "node:fs";

const API_VERSION = "2025-10";
const FUNCTION_HANDLE = "payment-customization";
const TITLE = "Pay by invoice for tagged customers";

const { SHOPIFY_API_KEY, SHOPIFY_API_SECRET } = process.env;
if (!SHOPIFY_API_KEY || !SHOPIFY_API_SECRET) {
  console.error("Missing SHOPIFY_API_KEY / SHOPIFY_API_SECRET in .env");
  process.exit(1);
}

const store =
  process.env.SHOPIFY_STORE ??
  readFileSync(new URL("../shopify.app.toml", import.meta.url), "utf8").match(
    /dev_store_url\s*=\s*"([^"]+)"/,
  )?.[1];
if (!store) {
  console.error("Could not determine store. Set SHOPIFY_STORE or dev_store_url.");
  process.exit(1);
}

const tokenRes = await fetch(`https://${store}/admin/oauth/access_token`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    grant_type: "client_credentials",
    client_id: SHOPIFY_API_KEY,
    client_secret: SHOPIFY_API_SECRET,
  }),
});
if (!tokenRes.ok) {
  console.error(
    `Token request failed (${tokenRes.status}). Is the app installed on ${store}?`,
  );
  console.error(await tokenRes.text());
  process.exit(1);
}
const { access_token: accessToken } = await tokenRes.json();

async function graphql(query) {
  const res = await fetch(
    `https://${store}/admin/api/${API_VERSION}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
      body: JSON.stringify({ query }),
    },
  );
  const { data, errors } = await res.json();
  if (errors) {
    console.error(JSON.stringify(errors, null, 2));
    process.exit(1);
  }
  return data;
}

// Customizations are app-scoped, so this only returns ours.
const existing = await graphql(
  `{ paymentCustomizations(first: 10) { nodes { id title enabled } } }`,
);
const current = existing.paymentCustomizations.nodes[0];

if (current?.enabled) {
  console.log(`Already active on ${store}: ${current.title} (${current.id})`);
  process.exit(0);
}

if (current) {
  const result = await graphql(
    `mutation { paymentCustomizationUpdate(id: "${current.id}", paymentCustomization: { enabled: true }) {
      paymentCustomization { id title enabled }
      userErrors { field message }
    } }`,
  );
  const { paymentCustomization, userErrors } = result.paymentCustomizationUpdate;
  if (userErrors.length) {
    console.error(JSON.stringify(userErrors, null, 2));
    process.exit(1);
  }
  console.log(`Re-enabled on ${store}: ${paymentCustomization.title} (${paymentCustomization.id})`);
  process.exit(0);
}

const result = await graphql(
  `mutation { paymentCustomizationCreate(paymentCustomization: {
    title: "${TITLE}",
    enabled: true,
    functionHandle: "${FUNCTION_HANDLE}"
  }) {
    paymentCustomization { id title enabled }
    userErrors { field message }
  } }`,
);
const { paymentCustomization, userErrors } = result.paymentCustomizationCreate;
if (userErrors.length) {
  console.error(JSON.stringify(userErrors, null, 2));
  process.exit(1);
}
console.log(`Activated on ${store}: ${paymentCustomization.title} (${paymentCustomization.id})`);
