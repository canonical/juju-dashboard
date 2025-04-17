import { expect } from "@playwright/test";

import { test } from "../fixtures/setup";
import { OIDC } from "../helpers/auth/backends/oidc";

test("ReBAC Admin access", async ({ page, testOptions }) => {
  await page.goto("/models?enable-flag=rebac");
  await OIDC.dashboardLogin(page, {
    username: "test@example.com",
    password: "test",
  });
  // Wait until the login flow redirects back to the dashboard.
  await page.waitForURL("**/models");
  await page.goto("/permissions/users");
  await expect(page.getByRole("link", { name: "Permissions" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Users" })).toBeVisible();
  await expect(
    page.locator("td", { hasText: testOptions.admin.name }),
  ).toBeVisible();
});
