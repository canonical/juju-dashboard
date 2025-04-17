import { expect } from "@playwright/test";

import { test } from "../fixtures/setup";
import { ActionStack } from "../helpers/action";

test.describe("Authentication Validation", () => {
  let actions: ActionStack;

  test.beforeEach(({ jujuCLI }) => {
    actions = new ActionStack(jujuCLI);
  });

  test.afterEach(async () => {
    await actions.rollback();
  });

  test("Can't bypass authentication", async ({ page }) => {
    await page.goto("/models");
    await expect(page.getByText("Log in to the dashboard")).toBeVisible();

    await page.goto("/controllers");
    await expect(page.getByText("Log in to the dashboard")).toBeVisible();
  });

  test("Needs valid credentials", async ({ page, jujuCLI }) => {
    await page.goto("/");

    const fakeUser = jujuCLI.fakeUser("invalid-user", "password");
    await fakeUser.dashboardLogin(page);

    let expectedText = "Could not log into controller";
    if (process.env.AUTH_MODE === "candid") {
      expectedText = "Connecting";
    } else if (process.env.AUTH_MODE === "oidc") {
      expectedText = "incorrect username or password";
    }
    await expect(page.getByText(expectedText)).toBeVisible();
  });

  test("Needs re-login if cookie/local storage value is corrupted", async ({
    page,
    jujuCLI,
    context,
  }) => {
    // Skipping local auth as session is managed in Redux state, not persistent storage.
    test.skip(process.env.AUTH_MODE === "local");

    const user = await actions.prepare((add) => {
      return add(jujuCLI.createUser());
    });

    await page.goto("/");
    await user.dashboardLogin(page);

    if (process.env.AUTH_MODE === "candid") {
      await page.evaluate(() => window.localStorage.clear());
      await expect(
        page.getByText("Controller authentication required").first(),
      ).toBeVisible();
      await expect(page.getByText("Authenticate").first()).toBeVisible();
    } else {
      await context.addCookies([
        {
          name: "jimm-browser-session",
          value: "random",
          path: "/",
          domain: "test-jimm.local",
          httpOnly: true,
          secure: true,
          sameSite: "None",
        },
      ]);
      await page.goto("/");
      await expect(
        page.getByText("Unable to check authentication status.").first(),
      ).toBeVisible();
      await expect(
        page.getByText("Log in to the dashboard").first(),
      ).toBeVisible();
    }
  });
});
