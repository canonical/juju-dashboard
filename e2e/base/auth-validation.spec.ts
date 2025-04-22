import { expect } from "@playwright/test";

import { test } from "../fixtures/setup";

test.describe("Authentication Validation", () => {
  test("Can't bypass authentication", async ({ page }) => {
    await page.goto("/models");
    await expect(page.getByText("Log in to the dashboard")).toBeVisible();

    await page.goto("/controllers");
    await expect(page.getByText("Log in to the dashboard")).toBeVisible();
  });

  test("Needs valid credentials", async ({ page, authHelpers }) => {
    await page.goto("/");
    const popup = await authHelpers.login("invalid-user", "password");
    if (process.env.AUTH_MODE === "candid" && popup) {
      await expect(
        popup.getByText(`authentication failed for user "invalid-user"`),
      ).toBeVisible();
    } else {
      await expect(
        page.getByText("Could not log into controller"),
      ).toBeVisible();
    }
  });

  test("Needs re-login if cookie/local storage value is corrupted", async ({
    page,
    context,
    authHelpers,
  }) => {
    // Skipping local auth as session is managed in Redux state, not persistent storage.
    test.skip(process.env.AUTH_MODE === "local");
    await page.goto("/");
    await authHelpers.login();

    if (process.env.AUTH_MODE === "candid") {
      await page.evaluate(() => window.localStorage.clear());
      await expect(
        page.getByText("Controller authentication required").first(),
      ).toBeVisible();
      await expect(page.getByText("Authenticate").first()).toBeVisible();
    } else {
      await context.addCookies([
        {
          name: "jimm-browser-session",
          value: "random",
          path: "/",
          domain: "localhost",
        },
      ]);
      await expect(
        page.getByText("Authentication error.").first(),
      ).toBeVisible();
      await expect(
        page.getByText("Log in to the dashboard").first(),
      ).toBeVisible();
    }
  });
});
