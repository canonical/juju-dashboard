import { expect } from "@playwright/test";

import { Label as PrimaryNavLabel } from "components/PrimaryNav/types";
import urls, { rebacURLS } from "urls";

import { test } from "../fixtures/setup";
import { ActionStack } from "../helpers/action";
import { GiveControllerAccess } from "../helpers/actions";
import type { User } from "../helpers/auth";
import { ControllerPermission } from "../helpers/objects";

test.describe("ReBAC Admin", () => {
  let actions: ActionStack;
  let nonAdminUser: User;

  test.beforeAll(async ({ jujuCLI }) => {
    actions = new ActionStack(jujuCLI);
    await actions.prepare((add) => {
      nonAdminUser = add(jujuCLI.createUser());
    });
  });

  test.afterAll(async () => {
    await actions.rollback();
  });

  test("can be accessed", async ({ jujuCLI, page }) => {
    const user = await actions.prepare((add) => {
      const user = add(jujuCLI.createUser());
      add(
        new GiveControllerAccess(
          jujuCLI.controllerInstance,
          user,
          ControllerPermission.SUPERUSER,
        ),
      );
      return user;
    });
    await user.dashboardLogin(page, rebacURLS.users.index);
    await expect(
      page.getByRole("link", { name: PrimaryNavLabel.PERMISSIONS }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Users" })).toBeVisible();
    await expect(
      page.locator("td", { hasText: jujuCLI.identityAdmin.dashboardUsername }),
    ).toBeVisible();
  });

  test("link is not displayed for non-admins", async ({ page }) => {
    await nonAdminUser.dashboardLogin(page, urls.models.index);
    await expect(
      page
        .getByRole("banner")
        .getByRole("link", { name: PrimaryNavLabel.PERMISSIONS }),
    ).not.toBeVisible();
  });

  test("can't be accessed by non-admins", async ({ page }) => {
    await nonAdminUser.dashboardLogin(page, rebacURLS.users.index);
    await expect(
      page.getByRole("heading", {
        name: "Hmm, we can't seem to find that page...",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Users" }),
    ).not.toBeVisible();
  });
});
