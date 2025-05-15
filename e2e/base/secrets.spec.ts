import { expect } from "@playwright/test";

import { ModelTab } from "urls";

import { test } from "../fixtures/setup";
import { ActionStack } from "../helpers/action";
import { AddModel, GiveModelAccess } from "../helpers/actions";
import type { User } from "../helpers/auth";
import type { Model } from "../helpers/objects";
import { ModelPermission } from "../helpers/objects";

test.describe("secrets", () => {
  let actions: ActionStack;
  let user: User;
  let nonAdmin: User;
  let model: Model;

  test.beforeAll(async ({ jujuCLI }) => {
    actions = new ActionStack(jujuCLI);

    await actions.prepare((add) => {
      user = add(jujuCLI.createUser());
      nonAdmin = add(jujuCLI.createUser());
      model = add(new AddModel(user));
      add(new GiveModelAccess(model, nonAdmin, ModelPermission.READ));
    });
  });

  test.afterAll(async () => {
    await actions.rollback();
  });

  test("secrets do not display controls", async ({ page }) => {
    await nonAdmin.dashboardLogin(page, model.tab(ModelTab.SECRETS));
    // Go to the application inside the model:
    await page.getByRole("link", { name: model.name }).hover();
    await expect(
      page.getByRole("button", { name: "Access" }),
    ).not.toBeVisible();
  });
});
