import { expect } from "@playwright/test";

import { Label as ModelActionsLabel } from "components/ModelActions/types";
import { Label as AccessManagementLabel } from "pages/AddModel/AccessManagement/types";
import { Label as ConfigsConstraintsLabel } from "pages/AddModel/ConfigsConstraints/types";
import { Label as MandatoryDetailsLabel } from "pages/AddModel/MandatoryDetails/types";
import { Label as AddModelLabel } from "pages/AddModel/types";
import urls from "urls";

import { JujuEnv, test } from "../fixtures/setup";
import { ActionStack } from "../helpers/action";
import { AddModel } from "../helpers/actions";
import type { User } from "../helpers/auth";
import { Model } from "../helpers/objects";
import { exec, generateRandomName } from "../utils";

test.describe("Add model", () => {
  let actions: ActionStack;
  let owner: User;
  let sharedUser: User;
  let currentModel: Model;

  test.beforeAll(async ({ jujuCLI }) => {
    actions = new ActionStack(jujuCLI);

    await actions.prepare((add) => {
      owner = add(jujuCLI.createUser(true));
      sharedUser = add(jujuCLI.createUser());
    });
  });

  test.beforeEach(() => {
    currentModel = new Model(generateRandomName("model"), owner);
  });

  test.afterEach(async ({ jujuCLI }) => {
    if (jujuCLI.jujuEnv === JujuEnv.JIMM) {
      await exec(`juju switch '${jujuCLI.controller}'`);
      await jujuCLI.loginIdentityCLIAdmin();
    } else {
      await jujuCLI.loginLocalCLIAdmin();
    }

    const addModel = new AddModel(jujuCLI, owner, true);
    addModel.model = currentModel;
    await addModel.rollback();
  });

  test.afterAll(async () => {
    await actions.rollback();
  });

  test("can add a model", async ({ page }) => {
    await owner.dashboardLogin(page, urls.models.addModel);
    await page
      .getByLabel(new RegExp(MandatoryDetailsLabel.MODEL_NAME))
      .fill(currentModel.name);
    await expect(
      page.getByRole("button", { name: AddModelLabel.CREATE_BUTTON }),
    ).toBeEnabled();
    await page
      .getByRole("button", { name: AddModelLabel.CREATE_BUTTON })
      .click();
    await expect(
      page
        .locator("tr", { hasText: currentModel.name })
        .and(page.locator("tr", { hasText: currentModel.owner.displayName })),
    ).toBeInViewport();
  });

  test("applies configs and constraints selected during add-model", async ({
    browser,
    page,
  }) => {
    const defaultSpace = `space-${generateRandomName("cfg")}`;
    const architecture = "amd64";

    // Fill in the mandatory details and go to the next step
    await owner.dashboardLogin(page, urls.models.addModel);
    await page
      .getByLabel(new RegExp(MandatoryDetailsLabel.MODEL_NAME))
      .fill(currentModel.name);
    await page.getByRole("button", { name: AddModelLabel.NEXT_BUTTON }).click();

    // Set default-space config
    const configsSection = page.getByRole("region", {
      name: ConfigsConstraintsLabel.CONFIGS_TITLE,
    });
    await configsSection
      .getByRole("searchbox", { name: "Search configurations" })
      .fill("default-space");
    await expect(
      configsSection.locator('input[name="default-space"]'),
    ).toBeVisible();
    await configsSection
      .locator('input[name="default-space"]')
      .fill(defaultSpace);

    // Set arch constraint
    const constraintsSection = page.getByRole("region", {
      name: ConfigsConstraintsLabel.CONSTRAINTS_TITLE,
    });
    await constraintsSection
      .getByRole("searchbox", { name: "Search constraints" })
      .fill("arch");
    await expect(
      constraintsSection.locator('select[name="arch"]'),
    ).toBeVisible();
    await constraintsSection
      .locator('select[name="arch"]')
      .selectOption(architecture);

    // Create the model
    await page
      .getByRole("button", { name: AddModelLabel.CREATE_BUTTON })
      .click();
    await expect(
      page
        .locator("tr", { hasText: currentModel.name })
        .and(page.locator("tr", { hasText: currentModel.owner.displayName })),
    ).toBeInViewport();

    // Verify that the model has the correct configs and constraints applied
    await owner.cliLogin(browser);
    await exec(`juju switch '${currentModel.qualifiedName}'`);
    await expect
      .poll(async () => {
        const { stdout } = await exec("juju model-config");

        return {
          arch: stdout.match(/^arch\s+\S+\s+(\S+)$/m)?.[1],
          defaultSpace: stdout.match(/^default-space\s+\S+\s+(\S+)$/m)?.[1],
        };
      })
      .toMatchObject({ arch: architecture, defaultSpace });
  });

  test("disables commands selected during add-model", async ({ page }) => {
    await owner.dashboardLogin(page, urls.models.addModel);

    // Fill in the mandatory details and go to the next step
    await page
      .getByLabel(new RegExp(MandatoryDetailsLabel.MODEL_NAME))
      .fill(currentModel.name);
    await page.getByRole("button", { name: AddModelLabel.NEXT_BUTTON }).click();

    // Disable the destroy-model command and create the model
    await page
      .locator("label.p-radio", {
        hasText: ConfigsConstraintsLabel.DISABLE_DESTROY_MODEL,
      })
      .click();
    await page
      .getByRole("button", { name: AddModelLabel.CREATE_BUTTON })
      .click();

    // Verify that the model was created and trigger destroy-model on it
    const modelRow = page
      .locator("tr", { hasText: currentModel.name })
      .and(page.locator("tr", { hasText: currentModel.owner.displayName }));
    await expect(modelRow).toBeInViewport();
    await modelRow
      .getByRole("button", { name: ModelActionsLabel.TOGGLE })
      .click();
    await page
      .getByRole("menuitem", { name: ModelActionsLabel.DESTROY })
      .click();

    // Destroy should fail with appropriate error message
    await expect(
      page.getByRole("dialog", {
        name: `Destroy model ${currentModel.name}`,
      }),
    ).toBeInViewport();
    await page.getByRole("button", { name: "Destroy model" }).click();
    await expect(
      page.locator('[role="status"]', {
        hasText: `Destroying model "${currentModel.name}" failed`,
      }),
    ).toBeVisible();
    await expect(modelRow).toBeInViewport();
  });

  test("shares the model during add-model and downgrades the owner's access", async ({
    browser,
    page,
  }) => {
    await owner.dashboardLogin(page, urls.models.addModel);

    // Fill in the mandatory details and go to Access Management step
    await page
      .getByLabel(new RegExp(MandatoryDetailsLabel.MODEL_NAME))
      .fill(currentModel.name);
    await page.getByText("Access Management (optional)").click();

    // Add another user to the list
    const addUsersInput = page.getByRole("combobox", {
      name: AccessManagementLabel.MULTI_SELECT_LABEL,
    });
    await addUsersInput.fill(sharedUser.cliUsername);
    await page
      .getByRole("button", { name: new RegExp(sharedUser.cliUsername, "i") })
      .click();

    // Bump the other user's access to Admin
    const sharedUserRow = page.locator("tbody tr", {
      hasText: sharedUser.cliUsername,
    });
    await sharedUserRow.getByRole("button", { name: "Read" }).click();
    await page.getByRole("option", { name: "Admin" }).click();

    // Lower the owner's access to Read and create the model
    const ownerRow = page.locator("tbody tr", { hasText: "(you)" });
    await ownerRow.getByRole("button", { name: "Admin" }).click();
    await page.getByRole("option", { name: "Read" }).click();
    await page
      .getByRole("button", { name: AddModelLabel.CREATE_BUTTON })
      .click();

    // Verify that the model was created
    const ownerModelRow = page
      .locator("tr", { hasText: currentModel.name })
      .and(page.locator("tr", { hasText: currentModel.owner.displayName }));
    await expect(ownerModelRow).toBeInViewport();

    // Verify that the owner cannot perform admin actions on the model
    await ownerModelRow
      .getByRole("button", { name: ModelActionsLabel.TOGGLE })
      .click();
    await expect(
      page.getByRole("menuitem", { name: ModelActionsLabel.ACCESS }),
    ).toHaveAttribute("aria-disabled", "true");
    await expect(
      page.getByRole("menuitem", { name: ModelActionsLabel.DESTROY }),
    ).toHaveAttribute("aria-disabled", "true");

    // Login as the other user and verify that they have admin access to the model
    const context = await browser.newContext();
    const sharedUserPage = await context.newPage();
    await sharedUser.dashboardLogin(sharedUserPage, urls.models.index);
    await expect(
      sharedUserPage.locator("tr", { hasText: currentModel.name }).and(
        sharedUserPage.locator("tr", {
          hasText: currentModel.owner.displayName,
        }),
      ),
    ).toBeInViewport();
    await context.close();
  });
});
