import { expect } from "@playwright/test";

import { Label as AccessLabel } from "components/ModelActions/types";
import urls from "urls";

import { test } from "../fixtures/setup";
import { ActionStack } from "../helpers/action";
import { AddModel, GiveModelAccess } from "../helpers/actions";
import type { User } from "../helpers/auth";
import { ModelPermission, type Model } from "../helpers/objects";

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
      model = add(new AddModel(jujuCLI, user));
      nonAdminUser = add(jujuCLI.createUser());
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
      .getByRole("button", { name: "Toggle menu" })
      .click();
    await expect(
      page.getByRole("button", {
        name: AccessLabel.DESTROY,
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
      .getByRole("button", { name: "Toggle menu" })
      .click();
    await page
      .getByRole("button", {
        name: AccessLabel.DESTROY,
      })
      .click();

    // Confirm destroy
    await expect(page.getByTestId("destroy-model-dialog")).toBeInViewport();
    await expect(
      page.getByText(`Destroy model ${model.name}`),
    ).toBeInViewport();
    await page
      .getByRole("button", {
        name: "Destroy model",
      })
      .click();

    // Destruction in progress
    await expect(page.getByTestId("destroy-model-dialog")).not.toBeInViewport();
    await expect(
      page.locator("tr", { hasText: `Destroying...` }),
    ).toBeInViewport();

    // Confirm successful destruction
    // This check is retried as sometimes the destruction takes longer
    let retry = 3;
    while (retry-- > 0) {
      try {
        // Reloading the page before checking refetches the list of models
        // which should be updated and we won't have to wait until the next poll
        await user.reloadDashboard(page);
        await page
          .locator("tr", { hasText: model.name })
          .and(page.locator("tr", { hasText: user.displayName }))
          .waitFor({ state: "detached", timeout: 30000 });
        break;
      } catch (error) {
        if (retry === 0) {
          throw error;
        }
      }
    }

    await expect(
      page
        .locator("tr", { hasText: model.name })
        .and(page.locator("tr", { hasText: user.displayName })),
    ).not.toBeInViewport();
  });
});
