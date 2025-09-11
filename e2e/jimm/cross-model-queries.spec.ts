import { expect } from "@playwright/test";

import { Label as SearchFormLabel } from "pages/AdvancedSearch/SearchForm/types";
import { Label as AdvancedSearchLabel } from "pages/AdvancedSearch/types";

import { test } from "../fixtures/setup";
import { ActionStack } from "../helpers/action";
import {
  AddModel,
  GiveControllerAccess,
  DeployApplication,
} from "../helpers/actions";
import type { User } from "../helpers/auth";
import type { Application } from "../helpers/objects";
import { ControllerPermission } from "../helpers/objects";

test.describe("cross model queries", () => {
  let actions: ActionStack;
  let user: User;
  let app: Application;

  test.beforeAll(async ({ jujuCLI, testOptions }) => {
    // Give the beforeAll enough time to finish the setup:
    test.setTimeout(300000);
    actions = new ActionStack(jujuCLI);
    await actions.prepare((add) => {
      user = add(jujuCLI.createUser());
      const model = add(new AddModel(jujuCLI, user));
      add(
        new GiveControllerAccess(
          jujuCLI.controllerInstance,
          user,
          ControllerPermission.SUPERUSER,
        ),
      );
      app = add(new DeployApplication(model, testOptions.provider));
    });
  });

  test.afterAll(async () => {
    await actions.rollback();
  });

  test("results are displayed ", async ({ page }) => {
    await page.waitForTimeout(10000);
    await user.dashboardLogin(page, "/search");
    await expect(
      page.getByRole("heading", { name: AdvancedSearchLabel.TITLE }),
    ).toBeVisible();
    await page
      .getByRole("textbox", { name: SearchFormLabel.FIELD_QUERY })
      .fill(".applications");
    await page.keyboard.down("Enter");
    await expect(
      page.getByRole("code").last().getByText(app.name, { exact: false }),
    ).toBeVisible();
  });
});
