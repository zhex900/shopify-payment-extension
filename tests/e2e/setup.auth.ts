import { expect, test as setup } from "@playwright/test";
import * as fs from "fs";

// @ts-ignore
import users from "/tmp/dev-store-test-users.json" assert { type: "json" };

import { ifFileExists, isExpired } from "./utils";

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
    if (ifFileExists(authFile)) {
      const authFileJSONString = fs.readFileSync(authFile, "utf-8");
      const authFileJSON = JSON.parse(authFileJSONString) as {
        cookies: { name: string; expires: number }[];
      };
      const cookie = authFileJSON.cookies.find(
        (cookie) => cookie.name === "_cmp_a",
      );
      if (cookie && !isExpired(cookie.expires)) {
        console.log("Already authenticated with", username);
        return;
      }
    }
    console.log("Logging in with", username, password);

    // Perform authentication steps. Replace these actions with your own.
    await page.goto("/account/login");
    // captcha must be disabled in the store

    await expect(page.getByText("Login")).toBeVisible();

    await page.getByRole("textbox", { name: "Email" }).fill(username);
    await page.getByRole("textbox", { name: "Password" }).fill(password);
    await page.getByRole("button", { name: "Sign in" }).click();

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
