import { expect } from "@playwright/test";

import { test } from "../fixtures/setup";
import { ActionStack } from "../helpers/action";
import { AddModel, GiveControllerAccess } from "../helpers/actions";
import type { User } from "../helpers/auth";
import { ControllerPermission } from "../helpers/objects";
import { exec } from "../utils/exec";

test.describe("cross model queries", () => {
  const appName = "nginx";
  let actions: ActionStack;
  let user: User;

  test.beforeAll(async ({ jujuCLI }) => {
    actions = new ActionStack(jujuCLI);
    await actions.prepare((add) => {
      user = add(jujuCLI.createUser());
      add(new AddModel(user));
      add(
        new GiveControllerAccess(
          jujuCLI.controllerInstance,
          user,
          ControllerPermission.SUPERUSER,
        ),
      );
    });
    await user.cliLogin();
    // TODO: use the deployApplication helper from #1962.
    await exec(`juju deploy '${appName}'`);
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
      page.getByRole("code").last().getByText(appName, { exact: false }),
    ).toBeVisible();
  });
});
