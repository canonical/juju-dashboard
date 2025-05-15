import { expect } from "@playwright/test";

import { OIDCAuthLabel } from "auth/types";
import { Label as LogInLabel } from "components/LogIn/types";
import { Label as APILabel } from "juju/types";

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
    await expect(page.getByText(LogInLabel.LOGIN_TO_DASHBOARD)).toBeVisible();

    await page.goto("/controllers");
    await expect(page.getByText(LogInLabel.LOGIN_TO_DASHBOARD)).toBeVisible();
  });

  test("Needs valid credentials", async ({ page, jujuCLI }) => {
    const fakeUser = jujuCLI.fakeUser("invalid-user", "password");
    await fakeUser.dashboardLogin(page, "/", true);

    let expectedText: string = APILabel.CONTROLLER_LOGIN_ERROR;
    if (process.env.AUTH_MODE === "candid") {
      expectedText = LogInLabel.LOADING;
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
    await user.dashboardLogin(page, "/");

    if (process.env.AUTH_MODE === "candid") {
      await page.evaluate(() => window.localStorage.clear());
      await expect(
        page.getByText(LogInLabel.AUTH_REQUIRED).first(),
      ).toBeVisible();
      await expect(
        page.getByText(LogInLabel.AUTHENTICATE).first(),
      ).toBeVisible();
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
      await expect(page.getByText(OIDCAuthLabel.WHOAMI).first()).toBeVisible();
      await expect(
        page.getByText(LogInLabel.LOGIN_TO_DASHBOARD).first(),
      ).toBeVisible();
    }
  });
});
