import { expect } from "@playwright/test";

import { test } from "../fixtures/setup";

test("List Controllers", async ({ page, authHelpers }) => {
  await authHelpers.login();
  const controllersTab = page.getByRole("link", { name: "Controllers" });
  await expect(controllersTab).toBeInViewport();
  await controllersTab.click();
  await expect(
    page.getByText("Model status across controllers"),
  ).toBeInViewport();
  await expect(
    page.getByRole("columnheader", { name: "DEFAULT" }),
  ).toBeInViewport();
});
