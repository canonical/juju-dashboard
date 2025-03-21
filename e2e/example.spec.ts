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
  const popupPromise = page.waitForEvent("popup");
  await page.getByRole("link", { name: "Log in to the dashboard" }).click();
  const popup = await popupPromise;
  await popup.getByRole("link", { name: "static" }).click();
  await popup.getByRole("textbox", { name: "Username" }).fill("user1");
  await popup.getByRole("textbox", { name: "Password" }).fill("password1");
  await popup.getByRole("button", { name: "Login" }).click();
  await popup.getByText("You're logged in as user1");
  await expect(page.getByText("2 models")).toBeVisible({
    timeout: 30_000,
  });
});
