import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

const checkout = async (page: Page) => {
  await page.goto("/products/test-shirt");
  await page.getByRole("button", { name: "Add to cart" }).click();
  await page.waitForRequest("**/cart?section_id=cart-drawer");
  await page.goto("/cart");
  await page.getByRole("button", { name: "Check out" }).click();
  await page.waitForURL("**/checkouts/**");
  await page.getByText("Choose a payment method").focus();
  return await page.getByLabel("Payment").innerText();
};

test.describe("b2b customer with pay by invoice tag", () => {
  test.use({ storageState: "tests/e2e/.auth/b2b.json" });
  test("Checkout pay by invoice", async ({ page }) => {
    const paymentOptions = await checkout(page);
    expect(paymentOptions).toContain("Pay by invoice");
    expect(paymentOptions).not.toContain("Cash on Delivery");
    await page.getByText("Pay by invoice").click();
  });
});

test.describe("retail customer without pay by invoice tag", () => {
  test.use({ storageState: "tests/e2e/.auth/retail.json" });
  test("Checkout should not pay by invoice option", async ({ page }) => {
    const paymentOptions = await checkout(page);
    expect(paymentOptions).not.toContain("Pay by invoice");
    expect(paymentOptions).not.toContain("Cash on Delivery");
  });
});

test.describe("guest customer", () => {
  test("Checkout should not pay by invoice option", async ({ page }) => {
    const paymentOptions = await checkout(page);
    expect(paymentOptions).not.toContain("Pay by invoice");
    expect(paymentOptions).not.toContain("Cash on Delivery");
  });
});
