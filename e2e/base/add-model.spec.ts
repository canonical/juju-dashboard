import { expect } from "@playwright/test";

import { Label as ModelActionsLabel } from "components/ModelActions/types";
import { Label as AccessManagementLabel } from "pages/AddModel/AccessManagement/types";
import { Label as ConfigsConstraintsLabel } from "pages/AddModel/ConfigsConstraints/types";
import { Label as AddModelLabel } from "pages/AddModel/types";
import { ModelsError } from "store/middleware/types";
import urls from "urls";

import { JujuEnv, test } from "../fixtures/setup";
import { ActionStack } from "../helpers/action";
import { AddModel, GiveControllerAccess } from "../helpers/actions";
import type { User } from "../helpers/auth";
import { ControllerPermission, Model } from "../helpers/objects";
import { exec, execIfModelExists, generateRandomName } from "../utils";

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
      if (jujuCLI.jujuEnv === JujuEnv.JIMM) {
        add(
          new GiveControllerAccess(
            jujuCLI.controllerInstance,
            owner,
            ControllerPermission.ADD_MODEL,
          ),
        );
      }
    });
  });

  test.beforeEach(() => {
    currentModel = new Model(generateRandomName("model"), owner);
  });

  test.afterEach(async ({ jujuCLI }) => {
    // Models in this spec are created through the UI, so clean them up
    // explicitly by switching back to an admin context and reusing AddModel rollback.
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
    await page.locator('input[name="modelName"]').fill(currentModel.name);
    await expect(
      page.getByRole("button", { name: AddModelLabel.CREATE_BUTTON }),
    ).toBeEnabled();
    await page
      .getByRole("button", { name: AddModelLabel.CREATE_BUTTON })
      .click();
    await expect(page).toHaveURL(urls.models.index);

    // Reloading the page before checking fetches the updated list of models.
    await owner.reloadDashboard(page);
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
    await page.locator('input[name="modelName"]').fill(currentModel.name);
    await page.getByRole("button", { name: AddModelLabel.NEXT_BUTTON }).click();

    // Set default-space config
    const configsSection = page.getByRole("region", {
      name: ConfigsConstraintsLabel.CONFIGS_TITLE,
    });
    await configsSection
      .getByRole("searchbox", { name: "Search configurations" })
      .fill("default-space");
    await expect(
      configsSection.locator('input[aria-label="default-space"]'),
    ).toBeVisible();
    await configsSection
      .locator('input[aria-label="default-space"]')
      .fill(defaultSpace);

    // Set arch constraint
    const constraintsSection = page.getByRole("region", {
      name: ConfigsConstraintsLabel.CONSTRAINTS_TITLE,
    });
    await constraintsSection
      .getByRole("searchbox", { name: "Search constraints" })
      .fill("arch");
    await expect(
      constraintsSection.locator('select[aria-label="arch"]'),
    ).toBeVisible();
    await constraintsSection
      .locator('select[aria-label="arch"]')
      .selectOption(architecture);

    // Create the model
    await page
      .getByRole("button", { name: AddModelLabel.CREATE_BUTTON })
      .click();
    await expect(page).toHaveURL(urls.models.index);

    // Reloading the page before checking fetches the updated list of models.
    await owner.reloadDashboard(page);
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
        const { stdout } = await exec("juju model-config --format=json");
        const config = JSON.parse(stdout) as Record<
          string,
          { Source: string; Value: string }
        >;

        return {
          arch: config.arch?.Value,
          defaultSpace: config["default-space"]?.Value,
        };
      })
      .toMatchObject({ arch: architecture, defaultSpace });
  });

  test("disables commands selected during add-model", async ({
    browser,
    page,
  }) => {
    await owner.dashboardLogin(page, urls.models.addModel);

    try {
      // Fill in the mandatory details and go to the next step
      await page.locator('input[name="modelName"]').fill(currentModel.name);
      await page
        .getByRole("button", { name: AddModelLabel.NEXT_BUTTON })
        .click();

      // Disable the destroy-model command and create the model
      await page
        .locator("label.p-radio", {
          hasText: ConfigsConstraintsLabel.DISABLE_DESTROY_MODEL,
        })
        .click();
      await page
        .getByRole("button", { name: AddModelLabel.CREATE_BUTTON })
        .click();
      await expect(page).toHaveURL(urls.models.index);

      // Sometimes after model creation, the models list fails to update and displays a
      // "Unable to list or update models" error banner. In that case, reload the page to recover.
      if (
        await page
          .locator('[role="alert"]', {
            hasText: ModelsError.LIST_OR_UPDATE_MODELS,
          })
          .isVisible()
      ) {
        await owner.reloadDashboard(page);
      }

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
    } finally {
      // Enable the blocked command to aid cleanup
      await owner.cliLogin(browser);
      await execIfModelExists(
        `juju switch '${currentModel.qualifiedName}' && juju enable-command destroy-model`,
        currentModel.qualifiedName,
      );
    }
  });

  test("shares the model during add-model and downgrades the owner's access", async ({
    browser,
    page,
  }) => {
    await owner.dashboardLogin(page, urls.models.addModel);

    // Fill in the mandatory details and go to Access Management step
    await page.locator('input[name="modelName"]').fill(currentModel.name);
    await page.getByText(AddModelLabel.ACCESS_MANAGEMENT_TITLE).click();

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
    await expect(page).toHaveURL(urls.models.index);

    // Sometimes after model creation, the models list fails to update and displays a
    // "Unable to list or update models" error banner. In that case, reload the page to recover.
    if (
      await page
        .locator('[role="alert"]', {
          hasText: ModelsError.LIST_OR_UPDATE_MODELS,
        })
        .isVisible()
    ) {
      await owner.reloadDashboard(page);
    }

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
