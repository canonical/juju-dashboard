import { expect } from "@playwright/test";

import { test } from "../fixtures/setup";

test("List Controllers", async ({ page, authHelpers, testOptions }) => {
  await page.goto("/");
  await authHelpers.login();
  const controllersTab = page.getByRole("link", { name: "Controllers" });
  await expect(controllersTab).toBeInViewport();
  await controllersTab.click();
  await expect(
    page.getByRole("gridcell").filter({ hasText: testOptions.controllerName }),
  ).toBeInViewport();
});
