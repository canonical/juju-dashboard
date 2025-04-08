import { expect } from "@playwright/test";

import { test } from "../fixtures/setup";

test("List created models", async ({ page, authHelpers, modelHelpers }) => {
  await authHelpers.login();
  await modelHelpers.addModel("foo");

  await expect(
    page.getByRole("columnheader", { name: "RUNNING" }),
  ).toBeInViewport();
  await expect(
    page.getByTestId("column-name").filter({ hasText: "foo" }),
  ).toBeInViewport();
});

test("List shared models", async ({ page, authHelpers, modelHelpers }) => {
  await modelHelpers.addSharedModel("bar", "John-Doe");

  await page.reload();
  await authHelpers.login();
  await expect(
    page.getByTestId("column-name").filter({ hasText: "foo" }),
  ).toBeInViewport();
  await expect(
    page.getByTestId("column-name").filter({ hasText: "bar" }),
  ).toBeInViewport();
});
