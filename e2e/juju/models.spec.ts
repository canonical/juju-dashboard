import { expect } from "@playwright/test";

import { test } from "../fixtures/setup";

test("List Models", async ({ page, authHelpers, modelHelpers }) => {
  await authHelpers.login();
  await modelHelpers.addModel("foo");

  await expect(
    page.getByRole("columnheader", { name: "RUNNING" }),
  ).toBeInViewport();
  await expect(page.getByText("foo")).toBeInViewport();
});
