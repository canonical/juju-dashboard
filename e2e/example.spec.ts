import { test, expect } from "@playwright/test";

test("Log in", async ({ page }) => {
  test.setTimeout(30_000);
  page.on("request", (request) => {
    console.log("request url: ", request.url());
  });
  page.on("response", (response) => {
    console.log("response url: ", response.url());
  });
  await page.goto("/");
  await page.getByRole("textbox", { name: "Username" }).fill("admin");
  await page.getByRole("textbox", { name: "Password" }).fill("test");
  await page.getByRole("button", { name: "Log in to the dashboard" }).click();
  await expect(page.getByText("2 models")).toBeVisible({
    timeout: 30_000,
  });
});
