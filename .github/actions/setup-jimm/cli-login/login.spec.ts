import { test, expect } from "@playwright/test";

test("complete log in flow for CLI", async ({ page }) => {
  await page.goto("/iam-hydra/oauth2/device/verify");
  const deviceCode = process.env.DEVICE_CODE;
  const username = process.env.USERNAME;
  const password = process.env.PASSWORD;
  if (!deviceCode || !username || !password) {
    throw new Error(
      `Did not receive all environment variables, got device code: "${deviceCode}", username: "${username}", password: "${password}"`,
    );
  }
  await page.getByRole("textbox", { name: "XXXXXXXX" }).fill(deviceCode);
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("textbox", { name: "Email" }).fill(username);
  await page.getByRole("textbox", { name: /Password/ }).fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByText("Sign in successful")).toBeVisible();
});
