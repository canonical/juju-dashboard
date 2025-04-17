import { expect } from "@playwright/test";

import { test } from "../fixtures/setup";
import { ActionStack } from "../helpers/action";
import { AddModel } from "../helpers/actions";
import type { User } from "../helpers/auth";
import type { Model } from "../helpers/objects";

const MODEL = "model-access-control-foo";

test.describe("Model Access Control", () => {
  let actions: ActionStack;
  let user1: User;
  let user2: User;
  let model: Model;

  test.beforeAll(async ({ jujuCLI }) => {
    actions = new ActionStack(jujuCLI);

    await actions.prepare((add) => {
      user1 = add(jujuCLI.createUser());
      user2 = add(jujuCLI.createUser());

      model = add(new AddModel(user2, MODEL));
    });
  });

  test.afterAll(async () => {
    await actions.rollback();
  });

  test("Can change model permissions", async ({ page }) => {
    // Skipping non-local auth tests: Only admin login supported for Candid/OIDC currently.
    test.skip(process.env.AUTH_MODE !== "local");

    await page.goto("/models");
    await user2.dashboardLogin(page);

    const row = page.getByRole("row", { name: model.name });
    await row.getByTestId("column-updated").hover();
    await page.getByRole("button", { name: "Access" }).click();

    await expect(page.getByTestId("share-panel")).toBeInViewport();

    await page
      .getByRole("textbox", { name: "Username" })
      .fill(user1.dashboardUsername);
    await page.getByRole("button", { name: "Add user" }).click();

    await expect(page.getByTestId("toast-card")).toContainText(
      `${user1.dashboardUsername} now has access to this model`,
    );

    await page.goto(`/models/${user2.dashboardUsername}/${model.name}`);
    await user1.dashboardLogin(page);
    await expect(page.locator(".entity-info__grid-item").first()).toHaveText(
      "accessread",
    );
  });
});
