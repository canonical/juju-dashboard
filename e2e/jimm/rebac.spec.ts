import { expect } from "@playwright/test";

import { test } from "../fixtures/setup";

test("ReBAC Admin access", async ({ page, authHelpers, testOptions }) => {
  await page.goto("/models?enable-flag=rebac");
  await authHelpers.login();
  // Wait until the login flow redirects back to the dashboard.
  await page.waitForURL("**/models");
  await page.goto("/permissions/users");
  await expect(page.getByRole("link", { name: "Permissions" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Users" })).toBeVisible();
  await expect(
    page.locator("td", { hasText: testOptions.admin.name }),
  ).toBeVisible();
});
