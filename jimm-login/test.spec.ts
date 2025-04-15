import { test, expect } from "@playwright/test";

test("dashboard loads", async ({ page }) => {
  test.setTimeout(30_000);
  page.on("request", (request) => {
    console.log("request url: ", request.url());
  });
  page.on("response", (response) => {
    console.log("response url: ", response.url());
  });
  await page.goto("/iam-hydra/oauth2/device/verify");
  console.log("Enter code:", process.env.DEVICE_CODE);
  if (!process.env.DEVICE_CODE) {
    test.fail(true, "Did not receive device code");
  }
  await page
    .getByRole("textbox", { name: "XXXXXXXX" })
    .fill(process.env.DEVICE_CODE as string);
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("textbox", { name: "Email" }).fill("test@example.com");
  await page.getByRole("textbox", { name: /Password/ }).fill("test");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByText("Sign in successful")).toBeVisible({
    timeout: 30_000,
  });
});
