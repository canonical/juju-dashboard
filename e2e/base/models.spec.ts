import { expect } from "@playwright/test";

import { test } from "../fixtures/setup";

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
