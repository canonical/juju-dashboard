import { test, expect } from "@playwright/test";

test("Log in", async ({ page }) => {
  page.on("request", (request) => {
    console.log("request url: ", request.url());
  });
  page.on("response", (response) => {
    console.log("response url: ", response.url());
  });
  await page.goto("/");
  await page.getByRole("link", { name: "Log in to the dashboard" }).click();
  await page
    .getByRole("textbox", { name: "Username or email" })
    .fill("jimm-test");
  await page.getByRole("textbox", { name: "Password" }).fill("password");
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL("http://127.0.0.1:8000/");
  await expect(page.getByRole("link", { name: "Models" })).toBeVisible();
});
