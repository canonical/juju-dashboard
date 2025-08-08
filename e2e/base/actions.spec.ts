import { expect } from "@playwright/test";

import {
  Label as AppLabel,
  TestId as AppTestId,
} from "pages/EntityDetails/App/types";
import { Label as ConfirmationDialogLabel } from "panels/ActionsPanel/ConfirmationDialog/types";
import { TestId as ActionsPanelTestId } from "panels/ActionsPanel/types";
import urls from "urls";

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
    // Give the test enough time to deploy the application:
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
    await page.route("**/*", async (route, request) => {
      if (["media", "font", "image"].includes(request.resourceType())) {
        await route.abort();
      } else {
        await route.continue();
      }
    });
    page.on("console", (msg) => {
      const type = msg.type();
      const text = msg.text();
      console.log(`BROWSER ${type.toUpperCase()}`, text);
    });
    console.time("Run charm actions");
    console.log("Run charm actions start", new Date());
    console.log("log in");
    await user.dashboardLogin(page, urls.models.index);

    // Go to the application inside the model
    console.log("go to model");
    await page.getByRole("link", { name: model.name }).click();
    console.log("wait for model page to load");
    await page.waitForURL(`**/${model.name}`);

    console.log("go to app");
    await page.getByRole("link", { name: application.name }).click();
    console.log("wait for app page to load");
    await page.waitForURL(`**/${application.name}`);

    console.log("Click on checkbox");
    // Open the actions panel for the corresponding application
    await page
      .getByRole("checkbox", { name: `Select unit ${application.name}/0` })
      .click({
        // The actual checkbox is hidden so force click on it.
        force: true,
      });

    console.log("click on action button");
    await page.getByTestId(AppTestId.RUN_ACTION_BUTTON).click();

    console.log("wait for action panel");
    await expect(page.getByTestId(ActionsPanelTestId.PANEL)).toBeInViewport();

    console.log("Run the action");
    // Run the action
    await page
      .locator("label.p-radio.radio-input-box__label", {
        hasText: application.action,
      })
      .click();
    await page
      .getByTestId(ActionsPanelTestId.PANEL)
      .getByRole("button", { name: AppLabel.RUN_ACTION })
      .click();

    await expect(page.getByText(`Run ${application.action}?`)).toBeInViewport();
    await page.getByText(ConfirmationDialogLabel.CONFIRM_BUTTON).click();

    await expect(
      page.getByTestId(ActionsPanelTestId.PANEL),
    ).not.toBeInViewport();

    // Go to the action logs and verify that the action was executed
    await page.getByTestId(AppTestId.SHOW_LOGS).click();
    await expect(
      page
        .locator("tr", { hasText: application.name })
        .and(page.locator("tr", { hasText: `1/${application.action}` })),
    ).toBeInViewport();
    console.log("Run charm actions end", new Date());
    console.timeEnd("Run charm actions");
  });

  test("actions controls aren't displayed to non-admins", async ({
    jujuCLI,
    page,
  }) => {
    console.time("actions controls aren't displayed to non-admins");
    console.log(
      "actions controls aren't displayed to non-admins start",
      new Date(),
    );
    await actions.prepare((add) => {
      const nonAdmin = add(jujuCLI.createUser());
      add(new GiveModelAccess(model, nonAdmin, ModelPermission.READ));
    });
    await user.dashboardLogin(page, application.url);
    await expect(
      page.getByTestId(AppTestId.UNITS_TABLE).getByRole("checkbox"),
    ).not.toBeVisible();
    await expect(
      page.getByRole("button", { name: AppLabel.RUN_ACTION }),
    ).not.toBeVisible();
    console.log(
      "actions controls aren't displayed to non-admins end",
      new Date(),
    );
    console.timeEnd("actions controls aren't displayed to non-admins");
  });
});
