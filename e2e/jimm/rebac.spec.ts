import { expect } from "@playwright/test";

import { test } from "../fixtures/setup";
import { ActionStack } from "../helpers/action";
import { GiveControllerAccess } from "../helpers/actions";
import { Controller, ControllerPermission } from "../helpers/objects";

test.describe("ReBAC Admin", () => {
  let actions: ActionStack;

  test.beforeAll(({ jujuCLI }) => {
    actions = new ActionStack(jujuCLI);
  });

  test.afterAll(async () => {
    await actions.rollback();
  });

  test("can be accessed", async ({ jujuCLI, page }) => {
    const user = await actions.prepare((add) => {
      const controller = new Controller("jimm", jujuCLI.identityAdmin);
      const user = add(jujuCLI.createUser());
      add(
        new GiveControllerAccess(
          controller,
          user,
          ControllerPermission.SUPERUSER,
        ),
      );
      return user;
    });
    await user.dashboardLogin(page, "/permissions/users?enable-flag=rebac");
    await expect(page.getByRole("link", { name: "Permissions" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Users" })).toBeVisible();
    await expect(
      page.locator("td", { hasText: jujuCLI.identityAdmin.dashboardUsername }),
    ).toBeVisible();
  });
});
