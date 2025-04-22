import { expect } from "@playwright/test";

import { test } from "../fixtures/setup";

test.describe("Models", () => {
  test.beforeAll(async ({ jujuHelpers }) => {
    await jujuHelpers.jujuLogin();
    await jujuHelpers.addModel("foo");
    await jujuHelpers.addSharedModel("bar", "John-Doe");
    await jujuHelpers.adminLogin();
  });

  test.afterAll(async ({ jujuHelpers }) => {
    await jujuHelpers.cleanup();
  });

  test("List created and shared models", async ({ page, authHelpers }) => {
    await page.goto("/models");
    await authHelpers.login();

    await expect(
      page
        .locator("tr", { hasText: "foo" })
        .and(page.locator("tr", { hasText: "admin" })),
    ).toBeInViewport();
    await expect(
      page
        .locator("tr", { hasText: "bar" })
        .and(page.locator("tr", { hasText: "John-Doe" })),
    ).toBeInViewport();
  });

  test("Cannot access model without permission", async ({
    page,
    authHelpers,
  }) => {
    test.skip(process.env.AUTH_MODE !== "local");
    await page.goto("/models/admin/foo");
    await authHelpers.login("John-Doe", "password2");

    await expect(page.getByText("Model not found")).toBeVisible();
  });
});
