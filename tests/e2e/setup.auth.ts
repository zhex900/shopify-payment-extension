import { expect, test as setup } from "@playwright/test";

// @ts-ignore
import users from "/tmp/dev-store-test-users.json" assert { type: "json" };

const auth = ({
  username,
  password,
  role,
}: {
  username: string;
  password: string;
  role: string;
}) => {
  const authFile = `tests/e2e/.auth/${role}.json`;

  setup(`authenticate-${role}`, async ({ page }) => {
    console.log("Logging in with", username, password);
    // Perform authentication steps. Replace these actions with your own.
    await page.goto("/account/login");

    await expect(page.getByText("Login")).toBeVisible();

    await page.getByRole("textbox", { name: "Email" }).fill(username);
    await page.getByRole("textbox", { name: "Password" }).fill(password);

    // wait for captcha to load
    await page
      .frameLocator("iframe[title=reCAPTCHA]")
      .locator("div")
      .first()
      .focus();
    await page.getByRole("button", { name: "Sign in" }).click();

    // wait for 4 seconds
    await page.waitForTimeout(4000);

    await page.waitForURL((url) => {
      if (url.pathname === "/challenge") {
        console.log("challenge");
        return true;
      }
      return url.pathname === "/account";
    });

    await page.waitForURL("/account");
    await page.goto("/collections/books");
    await page.context().storageState({ path: authFile });
  });
};

users.forEach(auth);
