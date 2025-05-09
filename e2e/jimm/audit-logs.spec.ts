import { expect } from "@playwright/test";

import { test } from "../fixtures/setup";
import { ActionStack } from "../helpers/action";
import { GiveControllerAccess, AddModel } from "../helpers/actions";
import type { User } from "../helpers/auth";
import type { Model } from "../helpers/objects";
import { ControllerPermission } from "../helpers/objects";

test.describe("audit logs", () => {
  let actions: ActionStack;
  let user: User;
  let model: Model;

  test.beforeAll(async ({ jujuCLI }) => {
    actions = new ActionStack(jujuCLI);
    await actions.prepare((add) => {
      user = add(jujuCLI.createUser());
      model = add(new AddModel(user));
      add(
        new GiveControllerAccess(
          jujuCLI.controllerInstance,
          user,
          ControllerPermission.SUPERUSER,
        ),
      );
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
        .locator("td", { hasText: user.displayName })
        .and(page.locator("td", { hasText: "less than a minute ago" })),
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
        .locator("td", { hasText: user.displayName })
        .and(page.locator("td", { hasText: "less than a minute ago" })),
    ).toBeVisible();
  });
});
