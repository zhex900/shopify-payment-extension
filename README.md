# Shopify Payment Extension

A **Payment Customization Shopify Function** that shows **Pay by invoice** at checkout only for customers with the **`pay by invoice`** customer tag. Everyone else (including guests) does not see that option.

There is **no admin app UI** — behavior is hardcoded in the function. Merchants enable the customization in Shopify Admin after deploy.

## Behavior

| Customer | Checkout payment methods |
|---|---|
| Has `pay by invoice` tag | **Pay by invoice** only (other managed manual methods hidden) |
| No tag / guest | Pay by invoice hidden (along with other managed manual methods) |

Managed manual methods are defined in `extensions/payment-customization/src/run.ts` (`MANAGED_MANUAL_PAYMENT_METHODS`). Update that list if your store uses different manual payment method names.

## Project layout

- `extensions/payment-customization/` — the checkout function (TypeScript → WASM)
- `tests/e2e/` — Playwright checkout tests against the dev store

## Local development

```bash
npm install
npm run dev
```

Use the Shopify CLI preview to test checkout on your dev store (`standbox.myshopify.com` in `shopify.app.toml`).

After installing (or reinstalling) the app on a store, activate the customization:

```bash
npm run activate
```

Uninstalling the app deletes its payment customization, so re-run this after every reinstall. The script authenticates as the app (client credentials grant using `.env` keys) and creates/enables the customization via `paymentCustomizationCreate`. It is idempotent — safe to run any time.

## Deploy

```bash
npm run deploy
```

CI runs `shopify app deploy` on merge to `main` (requires `SHOPIFY_CLI_PARTNERS_TOKEN`).

## Tests

```bash
npm run test:function   # unit tests for the function
npm run test:e2e        # Playwright checkout tests
```
