import { expect } from "@playwright/test";

import { test } from "../fixtures/setup";

test("Web CLI", async ({ page, authHelpers }) => {
  // Skipping candid auth as web CLI websocket can't be authenticated with it.
  test.skip(process.env.AUTH_MODE === "candid");

  await page.goto("/models/admin/controller");
  await authHelpers.login();
  await page.getByRole("textbox", { name: "command" }).fill("help");
  await page.keyboard.down("Enter");
  await expect(page.getByTestId("output-code")).toContainText(
    "Juju provides easy, intelligent application orchestration on top of Kubernetes",
  );
});
