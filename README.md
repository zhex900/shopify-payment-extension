# Shopify Payment Extension

A Shopify embedded admin app paired with a **Payment Customization Shopify Function**. It lets merchants
show a specific **manual payment method** only to customers who have a particular **customer tag**, and
hide it from everyone else at checkout.

The classic use case: B2B customers tagged for "Pay by invoice" see that option at checkout, while retail
customers don't.

## How it works

1. The merchant installs the app (embedded in Shopify Admin). On first load, `/app/install` finds the
   `payment-customization` function and registers a `paymentCustomization` via the Admin GraphQL API.
2. In the config UI (`/app`), the merchant picks a **customer tag** and a **manual payment method**. This
   is saved as a JSON metafield (`payment-customization/function-configuration`) on the payment
   customization.
3. At checkout, the Shopify Function (`extensions/payment-customization/src/run.ts`) reads that metafield:
   - Customer **has the tag** → show only the selected payment method, hide the rest.
   - Customer **lacks the tag** (or is a guest) → hide all configured manual payment methods.

## Stack

- **App:** React Router v7, React 18, Shopify Polaris, App Bridge (`@shopify/shopify-app-react-router`)
- **Function:** TypeScript compiled to WASM (`javy`, `@shopify/shopify_function`), validated with `zod`
- **Hosting:** Vercel (serverless, scales to zero) — deploys automatically via Vercel's Git integration
- **Session storage:** Neon (serverless Postgres) via Drizzle ORM
  (`@shopify/shopify-app-session-storage-drizzle`)
- **Testing:** Vitest, Testing Library, Playwright
- **CI/CD:** GitHub Actions (lint/test) + Vercel (app deploy) + Shopify CLI (config/extension deploy)

## Project layout

- `app/` — React Router routes, Shopify auth (`shopify.server.ts`), Drizzle DB (`db.server.ts`,
  `db/schema.ts`), GraphQL helpers, UI components
- `extensions/payment-customization/` — the checkout Function
- `drizzle.config.ts` / `app/db/migrations/` — Drizzle config and generated session-table migrations
- `tests/` — Vitest unit tests and Playwright E2E tests

## Local Development

`npm run dev`

Set up a Neon database and put its pooled connection string in `DATABASE_URL` (see `.env.example`),
then apply the session-table schema with `npm run db:migrate` (or `npm run db:push`).

## Deployment

- **App:** hosted on Vercel. Pushes to `main` deploy automatically via Vercel's Git integration.
  Set `SHOPIFY_API_KEY`, `SHOPIFY_API_SECRET`, `SHOPIFY_APP_URL`, `SCOPES`, and `DATABASE_URL` in the
  Vercel project's Environment Variables. After the first deploy, set the production domain in
  `shopify.app.toml` (`application_url` + `auth.redirect_urls`).
- **Shopify config + Function:** `shopify app deploy` (run by CI on merge to `main`).

## CI/CD

- **Pull requests:** lint (tsc + ESLint + Prettier), Vitest unit tests, and function tests.
- **Merges to `main`:** Vercel deploys the app; the `to-prod` workflow runs `shopify app deploy` to
  push the app config + payment-customization Function.
