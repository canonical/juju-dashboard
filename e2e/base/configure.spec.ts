import { expect } from "@playwright/test";

import { Label as AppLabel } from "pages/EntityDetails/App/types";
import { Label as ConfirmationDialogLabel } from "panels/ConfigPanel/ConfirmationDialog/types";
import { Label as ConfigPanelLabel } from "panels/ConfigPanel/types";

import { test } from "../fixtures/setup";
import { ActionStack } from "../helpers/action";
import { AddModel, DeployApplication } from "../helpers/actions";
import type { User } from "../helpers/auth";
import type { Model, Application } from "../helpers/objects";

test.describe("configure application", () => {
  let actions: ActionStack;
  let user: User;
  let model: Model;
  let application: Application;

  test.beforeAll(async ({ jujuCLI, testOptions }) => {
    // Give the test enough time to deploy the application:
    test.setTimeout(300000);
    actions = new ActionStack(jujuCLI);

    await actions.prepare((add) => {
      user = add(jujuCLI.createUser());
      model = add(new AddModel(jujuCLI, user));
      application = add(new DeployApplication(model, testOptions.provider));
    });
  });

  test.afterAll(async () => {
    await actions.rollback();
  });

  test("application can be configured", async ({ page }) => {
    await user.dashboardLogin(page, "/models?enable-flag=rebac");
    // Go to the application inside the model:
    await page.getByRole("link", { name: model.name }).click();
    await page.getByRole("link", { name: application.name }).click();
    // Open the configure panel for the corresponding application:
    await page.getByRole("button", { name: AppLabel.CONFIGURE }).click();
    const configPanel = page.getByRole("dialog", {
      name: application.name,
      exact: false,
    });
    await expect(configPanel).toBeInViewport();
    // Set the config:
    const textbox = page
      .getByRole("button", { name: application.config, exact: false })
      .getByRole("textbox");
    const changed = "new value";
    await textbox.clear();
    await textbox.fill(changed);
    await configPanel
      .getByRole("button", { name: ConfigPanelLabel.SAVE_BUTTON })
      .click();
    // Confirm the change:
    await expect(
      page.getByRole("heading", {
        name: ConfirmationDialogLabel.SAVE_CONFIRM,
      }),
    ).toBeInViewport();
    await page
      .getByRole("button", {
        name: ConfirmationDialogLabel.SAVE_CONFIRM_CONFIRM_BUTTON,
      })
      .click();
    // The panel should now close:
    await expect(configPanel).not.toBeInViewport();
    await user.reloadDashboard(page);
    // Open the configure panel again:
    await page.getByRole("button", { name: AppLabel.CONFIGURE }).click();
    await expect(
      page.getByRole("dialog", {
        name: application.name,
        exact: false,
      }),
    ).toBeInViewport();
    // Check that the config persisted:
    await expect(
      page
        .getByRole("button", { name: application.config, exact: false })
        .getByRole("textbox"),
    ).toHaveValue(changed);
  });

  test("application does not display configure button", async ({ page }) => {
    await user.dashboardLogin(page, application.url);
    await expect(
      page.getByRole("button", { name: AppLabel.CONFIGURE }),
    ).not.toBeVisible();
  });
});
