import { expect } from "@playwright/test";

import { test } from "../fixtures/auth-setup";

test("Log in", async ({ page, authHelpers }) => {
  await authHelpers.login();
  await expect(page.getByRole("link", { name: "Models" })).toBeInViewport();
  await expect(
    page.getByRole("link", { name: "Controllers" }),
  ).toBeInViewport();
});
