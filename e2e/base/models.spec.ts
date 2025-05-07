import { expect } from "@playwright/test";

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

    await actions.prepare((add) => {
      user1 = add(jujuCLI.createUser());
      user2 = add(jujuCLI.createUser());

      user1Model = add(new AddModel(user1));
      sharedModel = add(new AddModel(user1));
      user2Model = add(new AddModel(user2));

      add(new GiveModelAccess(sharedModel, user2, ModelPermission.READ));
    });
  });

  test.afterAll(async () => {
    await actions.rollback();
  });

  test("List created and shared models", async ({ page }) => {
    await user2.dashboardLogin(page, "/models");
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

  test("Cannot access model without permission", async ({ page }) => {
    await user2.dashboardLogin(
      page,
      `/models/${user1.dashboardUsername}/${user1Model.name}`,
    );
    await expect(page.getByText("Model not found")).toBeVisible();
  });
});
