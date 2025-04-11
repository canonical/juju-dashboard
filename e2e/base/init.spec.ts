import { test, expect } from "@playwright/test";

test("dashboard loads", async ({ page }) => {
  test.setTimeout(30_000);
  page.on("request", (request) => {
    console.log("request url: ", request.url());
  });
  page.on("response", (response) => {
    console.log("response url: ", response.url());
  });
  await page.goto("/");
  await page.getByRole("link", { name: "Log in to the dashboard" }).click();
  await page.getByRole("button", { name: /Sign in with Generic/ }).click();
  await page
    .getByRole("textbox", { name: "email address" })
    .fill("admin@example.com");
  await page.getByRole("textbox", { name: "Password" }).fill("password");
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page.getByText("1 model")).toBeVisible({
    timeout: 30_000,
  });
});
