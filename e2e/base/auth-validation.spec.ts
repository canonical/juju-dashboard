import { expect } from "@playwright/test";

import { test } from "../fixtures/setup";

test.describe("Authentication Validation", () => {
  test("Can't bypass authentication", async ({ page }) => {
    await page.goto("/models");
    await expect(page.getByText("Log in to the dashboard")).toBeVisible();

    await page.goto("/controllers");
    await expect(page.getByText("Log in to the dashboard")).toBeVisible();
  });

  test("Needs valid credentials", async ({ authHelpers }) => {
    const errorElement = await authHelpers.loginWithError(
      "invalid-user",
      "password",
    );
    await expect(errorElement).toBeVisible();
  });

  // test("Needs re-login if cookie/local storage value corrupted", async ({
  //   page,
  //   authHelpers,
  // }) => {
  //   await authHelpers.login();
  //   localStorage.setItem("http://127.0.0.1:8081", "invalid-value");
  //   await expect(
  //     page.getByText("Controller authentication required"),
  //   ).toBeVisible();
  // });
});
