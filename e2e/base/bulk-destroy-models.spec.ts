import { expect } from "@playwright/test";

import { Label as AccordionContentLabel } from "panels/DestroyModelsPanel/AccordionContent/types";
import { Label as DestroyModelsPanelLabel } from "panels/DestroyModelsPanel/types";
import urls from "urls";

import { test } from "../fixtures/setup";
import { ActionStack } from "../helpers/action";
import { AddModel, GiveModelAccess } from "../helpers/actions";
import type { User } from "../helpers/auth";
import { ModelPermission, type Model } from "../helpers/objects";
import { expandAccordionTab, modelRow, waitForModelsDestroyed } from "../utils";

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

  test("Can bulk destroy models", async ({ page }) => {
    await user.dashboardLogin(page, urls.models.index);

    // Wait until at least the 4 known model rows are present before selecting
    // all. The exact count may be higher if a controller row is also rendered.
    // tr index 0 is the header row, so nth(4) is the 4th data row.
    await expect(page.locator("tr").nth(4)).toBeVisible();

    // Select all models and open the review sidebar
    await page.getByRole("checkbox", { name: /Select all/ }).check();
    await page
      .getByRole("button", { name: /Review & destroy \d+ models/ })
      .click();

    // sharedModel is owned by modelOwner; user has read-only access so it
    // should appear blocked (struck through) with a NO_ACCESS tooltip.
    await expect(
      page.locator(".accordion-title--is-skipped", {
        hasText: sharedModel.name,
      }),
    ).toBeVisible();
    // Skip model1.
    const model1Tab = page.getByRole("tab", { name: model1.name });
    await expect(model1Tab).toBeVisible();
    await expandAccordionTab(model1Tab);
    const model1Section = page.locator(".p-accordion__group", {
      has: model1Tab,
    });
    await model1Section
      .getByRole("button", { name: AccordionContentLabel.SKIP_MODEL })
      .click();

    // Mark model2 as reviewed — open its accordion first if needed
    const model2Tab = page.getByRole("tab", { name: model2.name });
    await expect(model2Tab).toBeVisible();
    await expandAccordionTab(model2Tab);
    const model2Section = page.locator(".p-accordion__group", {
      has: model2Tab,
    });
    await model2Section
      .getByRole("button", { name: AccordionContentLabel.MARK_REVIEWED })
      .click();

    // Mark model3 as reviewed — open its accordion first if needed
    const model3Tab = page.getByRole("tab", { name: model3.name });
    await expect(model3Tab).toBeVisible();
    await expandAccordionTab(model3Tab);
    const model3Section = page.locator(".p-accordion__group", {
      has: model3Tab,
    });
    await model3Section
      .getByRole("button", { name: AccordionContentLabel.MARK_REVIEWED })
      .click();

    // Verify the NO_ACCESS tooltip on sharedModel. We check this after completing model1/2/3
    // interactions to avoid hover state conflicts with other accordion actions.
    await page
      .locator(".accordion-title--is-skipped", { hasText: sharedModel.name })
      .locator(".p-icon--help")
      .hover();
    await expect(
      page.getByRole("tooltip", {
        name: DestroyModelsPanelLabel.TOOLTIP_NO_ACCESS,
      }),
    ).toBeVisible();

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
    await expect(destroyDialog).toBeInViewport();

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

    // Confirm successful destruction — retried as destruction can take time.
    await waitForModelsDestroyed(page, user, [
      { modelName: model2.name, ownerDisplayName: user.displayName },
      { modelName: model3.name, ownerDisplayName: user.displayName },
    ]);

    await expect(
      modelRow(page, model2.name, user.displayName),
    ).not.toBeInViewport();
    await expect(
      modelRow(page, model3.name, user.displayName),
    ).not.toBeInViewport();

    // model1 was skipped — it must still be present after the bulk destroy.
    await expect(page.locator("tr", { hasText: model1.name })).toBeInViewport();
  });
});
