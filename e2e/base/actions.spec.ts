import { expect } from "@playwright/test";

import { test } from "../fixtures/setup";
import { ActionStack } from "../helpers/action";
import {
  AddModel,
  DeployApplication,
  GiveModelAccess,
} from "../helpers/actions";
import type { User } from "../helpers/auth";
import type { Model, Application } from "../helpers/objects";
import { ModelPermission } from "../helpers/objects";

test.describe("Actions", () => {
  let actions: ActionStack;
  let user: User;
  let model: Model;
  let application: Application;

  test.beforeAll(async ({ jujuCLI, testOptions }) => {
    test.setTimeout(300000);
    actions = new ActionStack(jujuCLI);

    await actions.prepare((add) => {
      user = add(jujuCLI.createUser());
      model = add(new AddModel(user));
      application = add(new DeployApplication(model, testOptions.provider));
    });
  });

  test.afterAll(async () => {
    await actions.rollback();
  });

  test("Run charm actions", async ({ page }) => {
    await user.dashboardLogin(page, "/models?enable-flag=rebac");

    // Go to the application inside the model
    await page.getByRole("link", { name: model.name }).click();
    await page.getByRole("link", { name: application.name }).click();

    // Open the actions panel for the corresponding application
    await page
      .locator(`label[for="table-checkbox-${application.name}/0"]`)
      .click();
    await page.getByTestId("run-action-button").click();

    await expect(page.getByTestId("actions-panel")).toBeInViewport();

    // Run the action
    await page
      .locator("label.p-radio.radio-input-box__label", {
        hasText: application.action,
      })
      .click();
    await page
      .getByTestId("actions-panel")
      .getByRole("button", { name: "Run action" })
      .click();

    await expect(page.getByText(`Run ${application.action}?`)).toBeInViewport();
    await page.getByText("Confirm").click();

    await expect(page.getByTestId("actions-panel")).not.toBeInViewport();

    // Go to the action logs
    if (process.env.AUTH_MODE === "oidc") {
      await page.getByRole("link", { name: "Logs" }).click();
    } else {
      await page.getByTestId("show-logs").click();
    }

    await expect(
      page
        .locator("tr", { hasText: application.name })
        .and(page.locator("tr", { hasText: `1/${application.action}` })),
    ).toBeInViewport();
  });

  test("actions controls aren't displayed to non-admins", async ({
    jujuCLI,
    page,
  }) => {
    await actions.prepare((add) => {
      const nonAdmin = add(jujuCLI.createUser());
      add(new GiveModelAccess(model, nonAdmin, ModelPermission.READ));
    });
    await user.dashboardLogin(
      page,
      `/models/${model.owner.dashboardUsername}/${model.name}/app/${application.name}?enable-flag=rebac`,
    );
    await expect(page.getByRole("checkbox")).not.toBeVisible();
    await expect(
      page.getByRole("button", { name: "Run action" }),
    ).not.toBeVisible();
  });
});
