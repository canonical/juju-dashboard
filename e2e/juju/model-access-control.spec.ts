import { expect } from "@playwright/test";

import { test } from "../fixtures/setup";

test.describe("Model Access Control", () => {
  let modelName = "";
  let secondaryUserName = "";
  test.beforeAll(async ({ jujuHelpers }) => {
    await jujuHelpers.jujuLogin();
    modelName = await jujuHelpers.addModel();
    secondaryUserName = await jujuHelpers.addUser();
  });

  test.afterAll(async ({ jujuHelpers }) => {
    await jujuHelpers.cleanup();
  });

  test("Can change model permissions", async ({
    page,
    authHelpers,
    testOptions,
  }) => {
    // Skipping non-local auth tests: Only admin login supported for Candid/OIDC currently.
    test.skip(process.env.AUTH_MODE !== "local");

    await page.goto("/models");
    await authHelpers.login();

    await page.getByTestId("column-updated").last().hover();
    await page.getByRole("button", { name: "Access" }).click();

    await expect(page.getByTestId("share-panel")).toBeInViewport();

    await page
      .getByRole("textbox", { name: "Username" })
      .fill(secondaryUserName);
    await page.getByRole("button", { name: "Add user" }).click();

    await expect(page.getByTestId("toast-card")).toContainText(
      `${secondaryUserName} now has access to this model`,
    );

    await page.goto(`/models/admin/${modelName}`);
    await authHelpers.login(
      secondaryUserName,
      testOptions.secondaryUserPassword,
    );
    await expect(page.locator(".entity-info__grid-item").first()).toHaveText(
      "accessread",
    );
  });
});
