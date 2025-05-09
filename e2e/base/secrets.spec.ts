import { expect } from "@playwright/test";

import { test } from "../fixtures/setup";
import { ActionStack } from "../helpers/action";
import { AddModel, DeployApplication } from "../helpers/actions";
import type { User } from "../helpers/auth";
import type { Model, Application } from "../helpers/objects";
import { generateRandomName } from "../utils";

test.describe("Secrets", () => {
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

  test("Can create and use a secret", async ({ page }) => {
    await user.dashboardLogin(page, "/models?enable-flag=rebac");

    // Go to the secrets tab inside the model
    await page.getByRole("link", { name: model.name }).click();
    await page.getByRole("link", { name: "Secrets" }).click();

    await page.getByRole("button", { name: "Add secret" }).click();
    await expect(page.getByTestId("secret-form-panel")).toBeInViewport();

    // Add a secret
    const secret = generateRandomName("secret");
    await page.getByRole("textbox", { name: "Label" }).fill(secret);
    await page.getByRole("textbox", { name: "Key 1" }).fill("somekey");
    await page.locator("textarea[aria-label='Value 1']").fill("somevalue");
    await page.getByText("Add a secret").scrollIntoViewIfNeeded();
    await page
      .getByTestId("secret-form-panel")
      .getByRole("button", { name: "Add secret" })
      .click();

    // Verify the secret was added and copy the URI
    await expect(page.getByTestId("secret-form-panel")).not.toBeInViewport();
    await expect(page.locator("tr", { hasText: secret })).toBeInViewport();
    const secretURI = await page
      .locator("tr", { hasText: secret })
      .locator("td.has-hover")
      .innerText();

    // Go to the application inside the model
    await page.getByRole("link", { name: "Applications" }).click();
    await page.getByRole("link", { name: application.name }).click();

    await page.getByRole("button", { name: "Configure" }).click();
    await expect(page.getByTestId("config-panel")).toBeInViewport();

    // Add the URI into the configuration
    await page.getByTestId(application.config).locator("textarea").focus();
    await page
      .getByTestId(application.config)
      .locator("textarea")
      .fill(secretURI);
    await page.getByRole("button", { name: "Save and apply" }).click();

    await expect(
      page.getByText("Are you sure you wish to apply these changes?"),
    ).toBeInViewport();
    await page.getByRole("button", { name: "Yes, apply changes" }).click();

    if (await page.getByText("Grant secrets?").isVisible())
      await page.getByRole("button", { name: "Yes" }).click();

    await expect(page.getByTestId("config-panel")).not.toBeInViewport();

    // Reload the page and verify the secret was saved
    await page.reload();
    if (await page.getByText("Log in to the dashboard").isVisible())
      await user.dashboardLogin(page);
    await page.getByRole("button", { name: "Configure" }).click();
    await expect(page.getByTestId("config-panel")).toBeInViewport();
    await page
      .getByTestId(application.config)
      .locator("textarea")
      .scrollIntoViewIfNeeded();
    await expect(
      page.getByTestId(application.config).locator("textarea"),
    ).toHaveText(secretURI);
  });
});
