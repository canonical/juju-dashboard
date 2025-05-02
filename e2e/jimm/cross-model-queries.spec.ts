import { expect } from "@playwright/test";

import { test } from "../fixtures/setup";
import { ActionStack } from "../helpers/action";
import {
  AddModel,
  GiveControllerAccess,
  DeployApplication,
} from "../helpers/actions";
import type { User } from "../helpers/auth";
import type { Application } from "../helpers/objects";
import { ControllerPermission } from "../helpers/objects";

test.describe("cross model queries", () => {
  let actions: ActionStack;
  let user: User;
  let app: Application;

  test.beforeAll(async ({ jujuCLI, testOptions }) => {
    actions = new ActionStack(jujuCLI);
    await actions.prepare((add) => {
      user = add(jujuCLI.createUser());
      const model = add(new AddModel(user));
      add(
        new GiveControllerAccess(
          jujuCLI.controllerInstance,
          user,
          ControllerPermission.SUPERUSER,
        ),
      );
      app = add(new DeployApplication(model, testOptions.provider));
    });
  });

  test.afterAll(async () => {
    await actions.rollback();
  });

  test("results are displayed ", async ({ page }) => {
    await user.dashboardLogin(page, "/search");
    await expect(
      page.getByRole("heading", { name: "Advanced search" }),
    ).toBeVisible();
    await page
      .getByRole("textbox", { name: "Search query" })
      .fill(".applications");
    await page.keyboard.down("Enter");
    await expect(
      page.getByRole("code").last().getByText(app.name, { exact: false }),
    ).toBeVisible();
  });
});
