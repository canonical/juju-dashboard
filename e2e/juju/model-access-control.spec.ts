import { expect } from "@playwright/test";

import { Label as AccessButtonLabel } from "components/ModelTableList/AccessButton/types";
import { TestId as StatusGroupTestId } from "components/ModelTableList/StatusGroup/types";
import {
  Label as ShareModelLabel,
  TestId as ShareModelTestId,
} from "panels/ShareModelPanel/types";
import { Label as ShareModelPanelLabel } from "panels/ShareModelPanel/types";
import urls from "urls";

import { test } from "../fixtures/setup";
import { ActionStack } from "../helpers/action";
import { AddModel } from "../helpers/actions";
import type { User } from "../helpers/auth";
import type { Model } from "../helpers/objects";

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

      model = add(new AddModel(user2));
    });
  });

  test.afterAll(async () => {
    await actions.rollback();
  });

  test("Can change model permissions", async ({ browser, page }) => {
    await user2.dashboardLogin(page, urls.models.index);
    const row = page.getByRole("row", { name: model.name });
    await row.getByTestId(StatusGroupTestId.COLUMN_UPDATED).hover();
    await page
      .getByRole("button", { name: AccessButtonLabel.ACCESS_BUTTON })
      .click();

    await expect(page.getByTestId(ShareModelTestId.PANEL)).toBeInViewport();

    await page
      .getByRole("textbox", { name: ShareModelPanelLabel.FIELD_USERNAME })
      .fill(user1.cliUsername);
    await page
      .getByRole("button", { name: ShareModelLabel.ADD_BUTTON })
      .click();

    await expect(page.getByTestId("toast-card").last()).toContainText(
      `${user1.cliUsername} now has access to this model`,
    );
    // Create a fresh context so that the second user can log in. This saves
    // logging out and clearing the IDP session for Candid.
    const context = await browser.newContext();
    // Create a new page inside context.
    const page2 = await context.newPage();
    await user1.dashboardLogin(page2, model.url);
    await expect(page2.locator(".entity-info__grid-item").first()).toHaveText(
      "accessread",
    );
    await context.close();
  });
});
