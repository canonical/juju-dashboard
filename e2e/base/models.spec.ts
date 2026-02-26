import { expect } from "@playwright/test";

import { Label as ModelActionsLabel } from "components/ModelActions/types";
import { Label as ModelLabel } from "pages/EntityDetails/Model/types";
import { Label as EntityDetailsLabel } from "pages/EntityDetails/types";
import urls from "urls";

import { JujuEnv, test } from "../fixtures/setup";
import { ActionStack } from "../helpers/action";
import {
  AddModel,
  GiveControllerAccess,
  GiveModelAccess,
} from "../helpers/actions";
import type { User } from "../helpers/auth";
import {
  ControllerPermission,
  ModelPermission,
  type Model,
} from "../helpers/objects";

test.describe("Models", () => {
  let actions: ActionStack;
  let user1: User;
  let user2: User;
  let user1Model: Model;
  let sharedModel: Model;
  let user2Model: Model;

  test.beforeAll(async ({ jujuCLI, testOptions }) => {
    // Give the beforeAll enough time to create the models:
    test.setTimeout(300000);
    actions = new ActionStack(jujuCLI);

    await actions.prepare((add) => {
      user1 = add(jujuCLI.createUser(true));
      user2 = add(jujuCLI.createUser(true));
      if (testOptions.jujuEnv === JujuEnv.JIMM) {
        add(
          new GiveControllerAccess(
            jujuCLI.controllerInstance,
            user1,
            ControllerPermission.ADD_MODEL,
          ),
        );
        add(
          new GiveControllerAccess(
            jujuCLI.controllerInstance,
            user2,
            ControllerPermission.ADD_MODEL,
          ),
        );
      }
      user1Model = add(new AddModel(jujuCLI, user1, true));
      sharedModel = add(new AddModel(jujuCLI, user1, true));
      user2Model = add(new AddModel(jujuCLI, user2, true));

      add(new GiveModelAccess(sharedModel, user2, ModelPermission.READ));
    });
  });

  test.afterAll(async () => {
    await actions.rollback();
  });

  test("List created and shared models", async ({ page }) => {
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

  test("Cannot access model without permission", async ({ page }) => {
    await user2.dashboardLogin(page, user1Model.url);
    await expect(page.getByText(EntityDetailsLabel.NOT_FOUND)).toBeVisible();
  });

  test("model list disables access button to non-admins", async ({
    page,
    testOptions,
  }) => {
    await user2.dashboardLogin(page, urls.models.index);
    await page
      .locator("tr", { hasText: sharedModel.name })
      .getByRole("button", { name: ModelActionsLabel.TOGGLE })
      .click();
    await expect(
      // In JIMM, this element is rendered as a link.
      page.getByRole(testOptions.jujuEnv === JujuEnv.JIMM ? "link" : "button", {
        name: ModelActionsLabel.ACCESS,
      }),
    ).toHaveAttribute("aria-disabled", "true");
  });

  test("model details does not display access button to non-admins", async ({
    page,
  }) => {
    await user2.dashboardLogin(page, user1Model.url);
    await expect(
      page.getByRole("button", { name: ModelLabel.ACCESS_BUTTON }),
    ).not.toBeVisible();
  });
});
