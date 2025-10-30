import { expect } from "@playwright/test";

import { Label as AppLabel } from "pages/EntityDetails/App/types";
import { Label as ModelTabsLabel } from "pages/EntityDetails/Model/ModelTabs/types";
import { Label as SecretsTableLabel } from "pages/EntityDetails/Model/Secrets/SecretsTable/types";
import { Label as SecretsLabel } from "pages/EntityDetails/Model/Secrets/types";
import { Label as ConfirmationDialogLabel } from "panels/ConfigPanel/ConfirmationDialog/types";
import { Label as ConfigPanelLabel } from "panels/ConfigPanel/types";
import { Label as SecretFormPanelLabel } from "panels/SecretFormPanel/types";
import urls, { ModelTab } from "urls";

import { test } from "../fixtures/setup";
import { ActionStack } from "../helpers/action";
import {
  AddModel,
  DeployApplication,
  GiveModelAccess,
} from "../helpers/actions";
import type { User } from "../helpers/auth";
import { ModelPermission } from "../helpers/objects";
import type { Application, Model } from "../helpers/objects";
import { generateRandomName } from "../utils";

test.describe("secrets", () => {
  let actions: ActionStack;
  let user: User;
  let nonAdmin: User;
  let model: Model;
  let application: Application;

  test.beforeAll(async ({ jujuCLI, testOptions }) => {
    // Give the test enough time to deploy the application:
    test.setTimeout(300000);
    actions = new ActionStack(jujuCLI);

    await actions.prepare((add) => {
      user = add(jujuCLI.createUser());
      nonAdmin = add(jujuCLI.createUser());
      model = add(new AddModel(jujuCLI, user));
      add(new GiveModelAccess(model, nonAdmin, ModelPermission.READ));
      application = add(new DeployApplication(model, testOptions.provider));
    });
  });

  test.afterAll(async () => {
    await actions.rollback();
  });

  test("Can create and use a secret", async ({ page }) => {
    await user.dashboardLogin(page, urls.models.index);

    // Go to the secrets tab inside the model
    await page.getByRole("link", { name: model.name }).click();
    await page.getByRole("link", { name: ModelTabsLabel.SECRETS }).click();

    await page.getByRole("button", { name: SecretsLabel.ADD }).click();
    await expect(
      page.getByRole("dialog", {
        name: SecretFormPanelLabel.TITLE_ADD,
      }),
    ).toBeInViewport();

    // Add a secret
    const secret = generateRandomName("secret");
    await page.getByRole("textbox", { name: "Label" }).fill(secret);
    await page.getByRole("textbox", { name: "Key 1" }).fill("somekey");
    await page.locator("textarea[aria-label='Value 1']").fill("somevalue");
    await page
      .getByRole("dialog", {
        name: SecretFormPanelLabel.TITLE_ADD,
      })
      .getByRole("button", { name: SecretFormPanelLabel.SUBMIT_ADD })
      .click();

    // Verify the secret was added and copy the URI
    await expect(
      page.getByRole("dialog", {
        name: SecretFormPanelLabel.TITLE_ADD,
      }),
    ).not.toBeInViewport();
    await expect(page.locator("tr", { hasText: secret })).toBeInViewport();
    const secretID = await page
      .locator("tr", { hasText: secret })
      .locator("td.has-hover")
      .innerText();
    const secretURI = `secret:${secretID}`;

    // Go to the application inside the model
    await page.getByRole("link", { name: ModelTabsLabel.APPLICATIONS }).click();
    await page.getByRole("link", { name: application.name }).click();

    await page.getByRole("button", { name: AppLabel.CONFIGURE }).click();
    await expect(
      page.getByRole("dialog", {
        name: application.name,
        exact: false,
      }),
    ).toBeInViewport();

    // Add the URI into the configuration
    await page
      .getByRole("button", { name: application.config, exact: false })
      .locator("textarea")
      .focus();
    await page
      .getByRole("button", { name: application.config, exact: false })
      .locator("textarea")
      .fill(secretURI);
    await page
      .getByRole("button", { name: ConfigPanelLabel.SAVE_BUTTON })
      .click();

    await expect(
      page.getByText(ConfirmationDialogLabel.SAVE_CONFIRM),
    ).toBeInViewport();
    await page
      .getByRole("button", {
        name: ConfirmationDialogLabel.SAVE_CONFIRM_CONFIRM_BUTTON,
      })
      .click();

    await page
      .getByRole("button", {
        name: ConfirmationDialogLabel.GRANT_CONFIRM_BUTTON,
      })
      .click();

    await expect(
      page.getByRole("dialog", {
        name: application.name,
        exact: false,
      }),
    ).not.toBeInViewport();

    // Reload the page and verify the secret was saved
    await user.reloadDashboard(page);
    await page.getByRole("button", { name: AppLabel.CONFIGURE }).click();
    await expect(
      page.getByRole("dialog", {
        name: application.name,
        exact: false,
      }),
    ).toBeInViewport();
    await page
      .getByRole("button", { name: application.config, exact: false })
      .locator("textarea")
      .scrollIntoViewIfNeeded();
    await expect(
      page
        .getByRole("button", { name: application.config, exact: false })
        .locator("textarea"),
    ).toHaveText(secretURI);
  });

  test("secrets do not display controls to non-admins", async ({ page }) => {
    await nonAdmin.dashboardLogin(page, model.tab(ModelTab.SECRETS));
    await expect(
      page.getByRole("button", { name: SecretsLabel.ADD }),
    ).not.toBeVisible();
    await expect(
      page
        .getByRole("table")
        .getByRole("button", { name: SecretsTableLabel.ACTION_MENU }),
    ).not.toBeVisible();
  });
});
