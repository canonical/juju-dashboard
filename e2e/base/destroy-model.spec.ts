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
  let user1: User;
  let user2: User;
  let user1Model: Model;
  let sharedModel: Model;

  test.beforeAll(async ({ jujuCLI }) => {
    // Give the beforeAll enough time to create the models:
    test.setTimeout(300000);
    actions = new ActionStack(jujuCLI);

    await actions.prepare((add) => {
      user1 = add(jujuCLI.createUser(true));
      user2 = add(jujuCLI.createUser(true));

      user1Model = add(new AddModel(jujuCLI, user1, true));
      sharedModel = add(new AddModel(jujuCLI, user1, true));

      add(new GiveModelAccess(sharedModel, user2, ModelPermission.READ));
    });
  });

  test.afterAll(async () => {
    await actions.rollback();
  });

  test("Cannot destroy model without sufficient access", async ({ page }) => {
    await user2.dashboardLogin(page, urls.models.index);
    await page
      .locator("tr", { hasText: sharedModel.name })
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
    await user1.dashboardLogin(page, urls.models.index);

    // Open the destroy model dialog
    await page
      .locator("tr", { hasText: user1Model.name })
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
      page.getByText(`Destroy model ${user1Model.name}`),
    ).toBeInViewport();
    await page
      .getByRole("button", {
        name: "Destroy model",
      })
      .click();

    // Destruction in progress
    await expect(page.getByTestId("destroy-model-dialog")).not.toBeInViewport();
    await expect(
      page
        .locator("tr", { hasText: `Destroying...` })
        .and(page.locator("tr", { hasText: user1.displayName })),
    ).toBeInViewport();

    // Confirm successful destruction
    await page
      .locator("tr", { hasText: `Destroying...` })
      .and(page.locator("tr", { hasText: user1.displayName }))
      .waitFor({ state: "detached", timeout: 30000 });
    await expect(
      page
        .locator("tr", { hasText: `Destroying...` })
        .and(page.locator("tr", { hasText: user1.displayName })),
    ).not.toBeInViewport();
  });
});
