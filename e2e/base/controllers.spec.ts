import { expect } from "@playwright/test";

import { test } from "../fixtures/setup";

test("List Controllers", async ({ page, authHelpers }) => {
  await authHelpers.login();
  const controllersTab = page.getByRole("link", { name: "Controllers" });
  await expect(controllersTab).toBeInViewport();
  await controllersTab.click();
  if (process.env.CONTROLLER_NAME) {
    await expect(
      page
        .getByRole("gridcell")
        .filter({ hasText: process.env.CONTROLLER_NAME }),
    ).toBeInViewport();
  } else {
    throw new Error("No controller found");
  }
});
