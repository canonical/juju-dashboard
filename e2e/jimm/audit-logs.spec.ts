import { expect } from "@playwright/test";

import { test } from "../fixtures/setup";
import { ActionStack } from "../helpers/action";
import {
  GiveControllerAccess,
  AddModel,
  GiveModelAccess,
} from "../helpers/actions";
import type { User } from "../helpers/auth";
import type { Model } from "../helpers/objects";
import { ControllerPermission, ModelPermission } from "../helpers/objects";

test.describe("audit logs", () => {
  let actions: ActionStack;
  let user: User;
  let nonAdminUser: User;
  let model: Model;

  test.beforeAll(async ({ jujuCLI }) => {
    actions = new ActionStack(jujuCLI);
    await actions.prepare((add) => {
      user = add(jujuCLI.createUser());
      nonAdminUser = add(jujuCLI.createUser());
      model = add(new AddModel(user));
      add(
        new GiveControllerAccess(
          jujuCLI.controllerInstance,
          user,
          ControllerPermission.SUPERUSER,
        ),
      );
      add(new GiveModelAccess(model, nonAdminUser, ModelPermission.READ));
    });
  });

  test.afterAll(async () => {
    await actions.rollback();
  });

  test("all logs page", async ({ page }) => {
    await user.dashboardLogin(page, "/logs?enable-flag=rebac");
    await expect(
      page.getByRole("heading", { name: "Audit logs" }),
    ).toBeVisible();
    await expect(
      page
        .locator("tr", { hasText: user.displayName })
        .filter({ hasText: "less than a minute ago" })
        .first(),
    ).toBeVisible();
  });

  test("model logs tab", async ({ page }) => {
    await user.dashboardLogin(
      page,
      `/models/${model.owner.dashboardUsername}/${model.name}?activeView=logs&tableView=audit-logs&enable-flag=rebac`,
    );
    await expect(page.getByRole("tab", { name: "Audit logs" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(
      page
        .locator("tr", { hasText: user.displayName })
        .filter({ hasText: "less than a minute ago" })
        .first(),
    ).toBeVisible();
  });

  test("all logs link is not displayed for non-admins", async ({ page }) => {
    await nonAdminUser.dashboardLogin(page, "/models?enable-flag=rebac");
    await expect(
      page.getByRole("banner").getByRole("link", { name: "Logs" }),
    ).not.toBeVisible();
  });

  test("all logs page can't be accessed by non-admins", async ({ page }) => {
    await nonAdminUser.dashboardLogin(page, "/logs?enable-flag=rebac");
    await expect(
      page.getByRole("heading", { name: "Audit logs" }),
    ).not.toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: "Hmm, we can't seem to find that page...",
      }),
    ).toBeVisible();
  });

  test("model logs link is not displayed for non-admins", async ({ page }) => {
    await nonAdminUser.dashboardLogin(page, "/models?enable-flag=rebac");
    await expect(
      page.getByRole("banner").getByRole("link", { name: "Logs" }),
    ).not.toBeVisible();
  });

  test("model logs tab can't be accessed by non-admins", async ({ page }) => {
    await nonAdminUser.dashboardLogin(
      page,
      `/models/${model.owner.dashboardUsername}/${model.name}?activeView=logs&tableView=audit-logs&enable-flag=rebac`,
    );
    await expect(
      page.getByRole("tab", { name: "Audit logs" }),
    ).not.toBeVisible();
  });
});
