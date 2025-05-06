import { expect } from "@playwright/test";

import { test } from "../fixtures/setup";
import { ActionStack } from "../helpers/action";
import { AddModel, GrantModelAccess } from "../helpers/actions";
import type { User } from "../helpers/auth";
import { ModelGrantPermission, type Model } from "../helpers/objects";

const MODEL1 = "models-foo1";
const MODEL2 = "models-foo2";
const SHARED_MODEL = "models-bar";

test.describe("Models", () => {
  // TODO: implement OIDC fixtures WD-21779.
  // Skipping non-local auth tests: Only admin login supported for Candid/OIDC currently.
  test.skip(process.env.AUTH_MODE !== "local");

  let actions: ActionStack;
  let user1: User;
  let user2: User;
  let user1Model: Model;
  let user1Model2: Model;
  let user2Model: Model;

  test.beforeAll(async ({ jujuCLI }) => {
    actions = new ActionStack(jujuCLI);

    await actions.prepare((add) => {
      user1 = add(jujuCLI.createUser());
      user2 = add(jujuCLI.createUser());

      user1Model = add(new AddModel(user1, MODEL1));
      user1Model2 = add(new AddModel(user1, MODEL2));
      user2Model = add(new AddModel(user2, SHARED_MODEL));

      add(new GrantModelAccess(user1Model, user2, ModelGrantPermission.Read));
    });
  });

  test.afterAll(async () => {
    await actions.rollback();
  });

  test("List created and shared models", async ({ page }) => {
    await page.goto("/models");
    await user2.dashboardLogin(page);

    await expect(
      page
        .locator("tr", { hasText: user1Model.name })
        .and(page.locator("tr", { hasText: user1.dashboardUsername })),
    ).toBeInViewport();
    await expect(
      page
        .locator("tr", { hasText: user2Model.name })
        .and(page.locator("tr", { hasText: user2.dashboardUsername })),
    ).toBeInViewport();
  });

  test("Cannot access model without permission", async ({ page }) => {
    await page.goto(`/models/${user1.dashboardUsername}/${user1Model2.name}`);
    await user2.dashboardLogin(page);

    await expect(page.getByText("Model not found")).toBeVisible();
  });
});
