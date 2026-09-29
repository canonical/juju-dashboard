import { expect } from "@playwright/test";

import { Label as ModelActionsLabel } from "components/ModelActions/types";
import urls from "urls";

import { test } from "../fixtures/setup";
import { ActionStack } from "../helpers/action";
import { AddModel, GiveModelAccess } from "../helpers/actions";
import type { User } from "../helpers/auth";
import { ModelPermission, type Model } from "../helpers/objects";
import { modelRow, waitForModelsDestroyed } from "../utils";

test.describe("Destroy Model", () => {
  let actions: ActionStack;
  let user: User;
  let nonAdminUser: User;
  let model: Model;

  test.beforeAll(async ({ jujuCLI }) => {
    // Give the beforeAll enough time to create the models:
    test.setTimeout(300000);
    actions = new ActionStack(jujuCLI);

    await actions.prepare((add) => {
      user = add(jujuCLI.createUser());
      nonAdminUser = add(jujuCLI.createUser());
      model = add(new AddModel(jujuCLI, user));
      add(new GiveModelAccess(model, nonAdminUser, ModelPermission.READ));
    });
  });

  test.afterAll(async () => {
    await actions.rollback();
  });

  test("Cannot destroy model without sufficient access", async ({ page }) => {
    await nonAdminUser.dashboardLogin(page, urls.models.index);
    await page
      .locator("tr", { hasText: model.name })
      .getByRole("button", { name: ModelActionsLabel.TOGGLE })
      .click();
    await expect(
      page.getByRole("menuitem", {
        name: ModelActionsLabel.DESTROY,
      }),
    ).toHaveAttribute("aria-disabled", "true");
  });

  test("Can destroy model with sufficient level of access", async ({
    page,
  }) => {
    await user.dashboardLogin(page, urls.models.index);

    // Open the destroy model dialog
    await page
      .locator("tr", { hasText: model.name })
      .getByRole("button", { name: ModelActionsLabel.TOGGLE })
      .click();
    await page
      .getByRole("menuitem", {
        name: ModelActionsLabel.DESTROY,
      })
      .click();

    // Confirm destroy
    const destroyDialog = page.getByRole("dialog", {
      name: `Destroy model ${model.name}`,
    });
    await expect(destroyDialog).toBeInViewport();
    await destroyDialog
      .getByRole("button", {
        name: "Destroy model",
      })
      .click();

    // Destruction in progress
    await expect(
      page.getByRole("dialog", { name: `Destroy model ${model.name}` }),
    ).not.toBeInViewport();
    await expect(
      page.locator("tr", { hasText: "Destroying model..." }),
    ).toBeInViewport();

    // Confirm successful destruction — retried as destruction can take time.
    await waitForModelsDestroyed(page, user, [
      { modelName: model.name, ownerDisplayName: user.displayName },
    ]);

    await expect(
      modelRow(page, model.name, user.displayName),
    ).not.toBeInViewport();
  });
});
