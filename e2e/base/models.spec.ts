import { expect } from "@playwright/test";

import { test } from "../fixtures/setup";

test.describe("Models", () => {
  let ownedModel = "";
  let secondaryUserName = "";
  let sharedModel = "";
  test.beforeAll(async ({ jujuHelpers }) => {
    await jujuHelpers.jujuLogin();
    ownedModel = await jujuHelpers.addModel();
    const { modelName, userName } = await jujuHelpers.addSharedModel();
    sharedModel = modelName;
    secondaryUserName = userName;
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
        .locator("tr", { hasText: ownedModel })
        .and(page.locator("tr", { hasText: "admin" })),
    ).toBeInViewport();
    await expect(
      page
        .locator("tr", { hasText: sharedModel })
        .and(page.locator("tr", { hasText: secondaryUserName })),
    ).toBeInViewport();
  });

  test("Cannot access model without permission", async ({
    page,
    authHelpers,
    testOptions,
  }) => {
    // Skipping non-local auth tests: Only admin login supported for Candid/OIDC currently.
    test.skip(process.env.AUTH_MODE !== "local");

    await page.goto(`/models/admin/${ownedModel}`);
    await authHelpers.login(
      secondaryUserName,
      testOptions.secondaryUserPassword,
    );

    await expect(page.getByText("Model not found")).toBeVisible();
  });
});
