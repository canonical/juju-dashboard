import { expect } from "@playwright/test";

import { test } from "../fixtures/setup";

test("Log in", async ({ page, authHelpers }) => {
  await authHelpers.login();
  await expect(page.getByRole("link", { name: "Models" })).toBeInViewport();
  await expect(
    page.getByRole("link", { name: "Controllers" }),
  ).toBeInViewport();
});
