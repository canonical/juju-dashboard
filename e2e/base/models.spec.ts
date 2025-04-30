import { expect } from "@playwright/test";

import { test } from "../fixtures/setup";

test.describe("Models", () => {
  // TODO: implement OIDC fixtures WD-21779.
  test.skip(process.env.AUTH_MODE === "oidc");

  test.beforeAll(async ({ jujuHelpers, testOptions }) => {
    await jujuHelpers.jujuLogin();
    await jujuHelpers.addModel("foo");
    await jujuHelpers.addSharedModel("bar", testOptions.secondaryUser.name);
    await jujuHelpers.adminLogin();
  });

  test.afterAll(async ({ jujuHelpers }) => {
    await jujuHelpers.cleanup();
  });

  test("List created and shared models", async ({
    page,
    authHelpers,
    testOptions,
  }) => {
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
        .and(page.locator("tr", { hasText: testOptions.secondaryUser.name })),
    ).toBeInViewport();
  });

  test("Cannot access model without permission", async ({
    page,
    authHelpers,
    testOptions,
  }) => {
    // Skipping non-local auth tests: Only admin login supported for Candid/OIDC currently.
    test.skip(process.env.AUTH_MODE !== "local");

    const {
      secondaryUser: { name, password },
    } = testOptions;
    await page.goto("/models/admin/foo");
    await authHelpers.login(name, password);

    await expect(page.getByText("Model not found")).toBeVisible();
  });
});
