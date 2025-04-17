import { expect } from "@playwright/test";

import { test } from "../fixtures/setup";
import { ActionStack } from "../helpers/action";
import { AddModel, GrantModelAccess } from "../helpers/actions";
import type { User } from "../helpers/auth";
import { ModelGrantPermission, type Model } from "../helpers/objects";

const MODEL = "models-foo";
const SHARED_MODEL = "models-bar";

test.describe("Models", () => {
  // TODO: implement OIDC fixtures WD-21779.
  test.skip(process.env.AUTH_MODE === "oidc");

  let actions: ActionStack;
  let user1: User;
  let user2: User;
  let model: Model;
  let sharedModel: Model;

  test.beforeAll(async ({ jujuCLI }) => {
    actions = new ActionStack(jujuCLI);

    await actions.prepare((add) => {
      user1 = add(jujuCLI.createUser());
      user2 = add(jujuCLI.createUser());

      model = add(new AddModel(user1, MODEL));
      sharedModel = add(new AddModel(user2, SHARED_MODEL));

      add(new GrantModelAccess(sharedModel, user1, ModelGrantPermission.Read));
    });
  });

  test.afterAll(async () => {
    await actions.rollback();
  });

  test("List created and shared models", async ({ page }) => {
    await page.goto("/models");
    await user1.dashboardLogin(page);

    await expect(
      page
        .locator("tr", { hasText: model.name })
        .and(page.locator("tr", { hasText: user1.dashboardUsername })),
    ).toBeInViewport();
    await expect(
      page
        .locator("tr", { hasText: sharedModel.name })
        .and(page.locator("tr", { hasText: user2.dashboardUsername })),
    ).toBeInViewport();
  });

  test("Cannot access model without permission", async ({ page }) => {
    // Skipping non-local auth tests: Only admin login supported for Candid/OIDC currently.
    test.skip(process.env.AUTH_MODE !== "local");

    await page.goto(`/models/${user1.dashboardUsername}/${model.name}`);
    await user2.dashboardLogin(page);

    await expect(page.getByText("Model not found")).toBeVisible();
  });
});
