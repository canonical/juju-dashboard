import { expect } from "@playwright/test";

import { Label as AccessColumnLabel } from "components/ModelTableList/AccessColumn/types";
import { Label as ModelLabel } from "pages/EntityDetails/Model/types";
import { Label as EntityDetailsLabel } from "pages/EntityDetails/types";
import urls from "urls";

import { test } from "../fixtures/setup";
import { ActionStack } from "../helpers/action";
import { AddModel, GiveModelAccess } from "../helpers/actions";
import type { User } from "../helpers/auth";
import { ModelPermission, type Model } from "../helpers/objects";

test.describe("Models", () => {
  let actions: ActionStack;
  let user1: User;
  let user2: User;
  let user1Model: Model;
  let sharedModel: Model;
  let user2Model: Model;

  test.beforeAll(async ({ jujuCLI }) => {
    actions = new ActionStack(jujuCLI);
  });

  test.afterAll(async () => {
    await actions.rollback();
  });

  test("List created and shared models", async ({ jujuCLI, page }) => {
    await actions.prepare((add) => {
      user1 = add(jujuCLI.createUser());
      user2 = add(jujuCLI.createUser());

      user1Model = add(new AddModel(user1));
      sharedModel = add(new AddModel(user1));
      user2Model = add(new AddModel(user2));

      add(new GiveModelAccess(sharedModel, user2, ModelPermission.READ));
    });
    await user2.dashboardLogin(page, urls.models.index);
    await expect(
      page
        .locator("tr", { hasText: sharedModel.name })
        .and(page.locator("tr", { hasText: user1.displayName })),
    ).toBeInViewport();
    await expect(
      page
        .locator("tr", { hasText: user2Model.name })
        .and(page.locator("tr", { hasText: user2.displayName })),
    ).toBeInViewport();
  });
});
