import { expect } from "@playwright/test";

import { Label as AccordionContentLabel } from "panels/DestroyModelsPanel/AccordionContent/types";
import { Label as DestroyModelsPanelLabel } from "panels/DestroyModelsPanel/types";
import urls from "urls";

import { test, JujuEnv } from "../fixtures/setup";
import { ActionStack } from "../helpers/action";
import { AddModel, GiveModelAccess } from "../helpers/actions";
import type { User } from "../helpers/auth";
import { ModelPermission, type Model } from "../helpers/objects";

test.describe("Bulk destroy models", () => {
  let actions: ActionStack;
  let user: User;
  let modelOwner: User;
  let model1: Model;
  let model2: Model;
  let model3: Model;
  let sharedModel: Model;

  test.beforeAll(async ({ jujuCLI }) => {
    test.setTimeout(300000);
    actions = new ActionStack(jujuCLI);

    await actions.prepare((add) => {
      user = add(jujuCLI.createUser());
      modelOwner = add(jujuCLI.createUser());

      model1 = add(new AddModel(jujuCLI, user));
      model2 = add(new AddModel(jujuCLI, user));
      model3 = add(new AddModel(jujuCLI, user));

      sharedModel = add(new AddModel(jujuCLI, modelOwner));
      add(new GiveModelAccess(sharedModel, user, ModelPermission.READ));
    });
  });

  test.afterAll(async () => {
    await actions.rollback();
  });

  test("Can bulk destroy models — skip one, review and confirm the rest", async ({
    page,
  }) => {
    await user.dashboardLogin(page, urls.models.index);

    // Wait for all models to be rendered before selecting all
    await expect(page.locator("tr", { hasText: model1.name })).toBeVisible();
    await expect(page.locator("tr", { hasText: model2.name })).toBeVisible();
    await expect(page.locator("tr", { hasText: model3.name })).toBeVisible();
    await expect(
      page.locator("tr", { hasText: sharedModel.name }),
    ).toBeVisible();

    // Select all models and open the review sidebar
    await page.getByRole("checkbox", { name: /Select all/ }).check();
    await page
      .getByRole("button", { name: /Review & destroy \d+ models/ })
      .click();

    // Skip model1
    await page.getByRole("tab", { name: model1.name }).click();
    await page
      .getByRole("button", { name: AccordionContentLabel.SKIP_MODEL })
      .click();

    // Mark model2 and model3 as reviewed
    await page.getByRole("tab", { name: model2.name }).click();
    await page
      .getByRole("button", { name: AccordionContentLabel.MARK_REVIEWED })
      .click();
    await page.getByRole("tab", { name: model3.name }).click();
    await page
      .getByRole("button", { name: AccordionContentLabel.MARK_REVIEWED })
      .click();

    // Footer should show 2 reviewed and at least 2 skipped
    // (model1 manually skipped + sharedModel auto-blocked, plus controller on Juju)
    await expect(page.getByText(/2\/2 Reviewed, \d+ Skipped/)).toBeVisible();

    // Proceed to confirmation dialog
    await page
      .getByRole("button", {
        name: DestroyModelsPanelLabel.COMPLETE_REVIEW_DESTROY,
      })
      .click();

    const destroyDialog = page.getByRole("dialog", {
      name: /Destroy 2 models/,
    });
    await expect(destroyDialog).toBeVisible();

    // Type the prompt and click confirm
    await destroyDialog.getByRole("textbox").fill("destroy 2 models");
    await destroyDialog
      .getByRole("button", { name: "Destroy 2 models" })
      .click();

    // Bulk destruction in-progress toast should appear
    await expect(
      page.locator(".toast-card[data-type='information']", {
        hasText: "Destroying 2 models...",
      }),
    ).toBeVisible();

    // Confirm successful destruction
    // This check is retried as sometimes the destruction takes longer
    let retry = 3;
    while (retry-- > 0) {
      try {
        // Reloading the page before checking fetches the list of models
        // which should be updated and we won't have to wait until the next poll
        await user.reloadDashboard(page);
        await page
          .locator("tr", { hasText: model2.name })
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
        .locator("tr", { hasText: model2.name })
        .and(page.locator("tr", { hasText: user.displayName })),
    ).not.toBeVisible();
    await expect(
      page
        .locator("tr", { hasText: model3.name })
        .and(page.locator("tr", { hasText: user.displayName })),
    ).not.toBeVisible();

    // model1 (skipped) should still be present
    await expect(
      page
        .locator("tr", { hasText: model1.name })
        .and(page.locator("tr", { hasText: user.displayName })),
    ).toBeVisible();
  });

  test("Blocked models are struck through in the review sidebar", async ({
    page,
    jujuCLI,
  }) => {
    await user.dashboardLogin(page, urls.models.index);

    // Wait for all models to be rendered before selecting all
    await expect(page.locator("tr", { hasText: model1.name })).toBeVisible();
    await expect(page.locator("tr", { hasText: model2.name })).toBeVisible();
    await expect(page.locator("tr", { hasText: model3.name })).toBeVisible();
    await expect(
      page.locator("tr", { hasText: sharedModel.name }),
    ).toBeVisible();

    // Select all models visible to user
    await page.getByRole("checkbox", { name: /Select all/ }).check();
    await page
      .getByRole("button", { name: /Review & destroy \d+ models/ })
      .click();

    // In Juju, the controller model is visible and should be blocked
    if (jujuCLI.jujuEnv !== JujuEnv.JIMM) {
      await expect(
        page.locator(".accordion-title--is-skipped", {
          hasText: "controller",
        }),
      ).toBeVisible();

      // Hovering over the help icon should show the controller tooltip
      await page
        .locator(".accordion-title--is-skipped", { hasText: "controller" })
        .locator(".p-icon--help")
        .hover();
      await expect(
        page.getByRole("tooltip", {
          name: DestroyModelsPanelLabel.TOOLTIP_CONTROLLER_MODEL,
        }),
      ).toBeVisible();
    }

    // sharedModel is owned by modelOwner; user has read-only access so
    // it will appear blocked (NO_ACCESS) when user tries to bulk destroy.
    await expect(
      page.locator(".accordion-title--is-skipped", {
        hasText: sharedModel.name,
      }),
    ).toBeVisible();

    await page
      .locator(".accordion-title--is-skipped", { hasText: sharedModel.name })
      .locator(".p-icon--help")
      .hover();
    await expect(
      page.getByRole("tooltip", {
        name: DestroyModelsPanelLabel.TOOLTIP_NO_ACCESS,
      }),
    ).toBeVisible();
  });
});
