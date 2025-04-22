import { expect } from "@playwright/test";

import { test } from "../fixtures/setup";

test.describe("Model Access Control", () => {
  test.beforeAll(async ({ jujuHelpers }) => {
    await jujuHelpers.jujuLogin();
    await jujuHelpers.addModel("foo");
    await jujuHelpers.addUser("John-Doe");
  });

  test.afterAll(async ({ jujuHelpers }) => {
    await jujuHelpers.cleanup();
  });

  test("Can change model permissions", async ({ page, authHelpers }) => {
    // Skipping non-local auth tests: Only admin login supported for Candid/OIDC currently.
    test.skip(process.env.AUTH_MODE !== "local");

    await page.goto("/models");
    await authHelpers.login();

    await page.getByTestId("column-updated").last().hover();
    await page.getByRole("button", { name: "Access" }).click();

    await expect(page.getByTestId("share-panel")).toBeInViewport();

    await page.getByRole("textbox", { name: "Username" }).fill("John-Doe");
    await page.getByRole("button", { name: "Add user" }).click();

    await expect(page.getByTestId("toast-card")).toContainText(
      "John-Doe now has access to this model",
    );

    await page.goto("/models/admin/foo");
    await authHelpers.login("John-Doe", "password2");
    await expect(page.locator(".entity-info__grid-item").first()).toHaveText(
      "accessread",
    );
  });
});
