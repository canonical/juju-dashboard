import { expect } from "@playwright/test";

import { Label as PrimaryNavLabel } from "components/PrimaryNav/types";
import { Label as LogsLabel } from "pages/EntityDetails/Model/Logs/types";
import { Label as LogsPageLabel } from "pages/Logs/types";
import { Label as PageNotFoundLabel } from "pages/PageNotFound/types";
import urls, { ModelTab } from "urls";

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
    await user.dashboardLogin(page, urls.logs);
    await expect(
      page.getByRole("heading", { name: LogsPageLabel.TITLE }),
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
      `${model.tab(ModelTab.LOGS)}&tableView=audit-logs`,
    );
    await expect(
      page.getByRole("tab", { name: LogsLabel.AUDIT_LOGS }),
    ).toHaveAttribute("aria-selected", "true");
    await expect(
      page
        .locator("tr", { hasText: user.displayName })
        .filter({ hasText: "less than a minute ago" })
        .first(),
    ).toBeVisible();
  });

  test("all logs link is not displayed for non-admins", async ({ page }) => {
    await nonAdminUser.dashboardLogin(page, urls.models.index);
    await expect(
      page
        .getByRole("banner")
        .getByRole("link", { name: PrimaryNavLabel.LOGS }),
    ).not.toBeVisible();
  });

  test("all logs page can't be accessed by non-admins", async ({ page }) => {
    await nonAdminUser.dashboardLogin(page, urls.logs);
    await expect(
      page.getByRole("heading", { name: LogsPageLabel.TITLE }),
    ).not.toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: PageNotFoundLabel.NOT_FOUND,
      }),
    ).toBeVisible();
  });

  test("model logs link is not displayed for non-admins", async ({ page }) => {
    await nonAdminUser.dashboardLogin(page, urls.models.index);
    await expect(
      page
        .getByRole("banner")
        .getByRole("link", { name: PrimaryNavLabel.LOGS }),
    ).not.toBeVisible();
  });

  test("model logs tab can't be accessed by non-admins", async ({ page }) => {
    await nonAdminUser.dashboardLogin(
      page,
      `${model.tab(ModelTab.LOGS)}&tableView=audit-logs`,
    );
    await expect(
      page.getByRole("tab", { name: LogsPageLabel.TITLE }),
    ).not.toBeVisible();
  });
});
