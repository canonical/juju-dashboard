import { expect } from "@playwright/test";

import { Label as ModelActionsLabel } from "components/ModelActions/types";
import { Label as AccessManagementLabel } from "pages/AddModel/AccessManagement/types";
import { Label as ConfigsConstraintsLabel } from "pages/AddModel/ConfigsConstraints/types";
import { Label as AddModelLabel } from "pages/AddModel/types";
import urls from "urls";

import { JujuEnv, test } from "../fixtures/setup";
import { ActionStack } from "../helpers/action";
import type { User } from "../helpers/auth";
import { Model } from "../helpers/objects";
import { exec, execIfModelExists, generateRandomName } from "../utils";

test.describe("Add model", () => {
  let actions: ActionStack;
  let owner: User;
  let sharedUser: User;
  let currentModel: Model | null = null;

  test.beforeAll(async ({ jujuCLI }) => {
    actions = new ActionStack(jujuCLI);

    await actions.prepare((add) => {
      owner = add(jujuCLI.createUser(true));
      sharedUser = add(jujuCLI.createUser());
    });
  });

  test.afterEach(async ({ jujuCLI }) => {
    if (!currentModel) {
      return;
    }

    if (jujuCLI.jujuEnv === JujuEnv.JIMM) {
      await exec(`juju switch '${jujuCLI.controller}'`);
      await jujuCLI.loginIdentityCLIAdmin();
    } else {
      await jujuCLI.loginLocalCLIAdmin();
    }

    await execIfModelExists(
      `juju destroy-model ${currentModel.qualifiedName} --force --no-prompt --no-wait --destroy-storage --timeout 0`,
      currentModel.qualifiedName,
    );
    currentModel = null;
  });

  test.afterAll(async () => {
    await actions.rollback();
  });

  test("can add a model", async ({ page }) => {
    currentModel = new Model(generateRandomName("model"), owner);

    await owner.dashboardLogin(page, urls.models.addModel);
    await page.locator('input[name="modelName"]').fill(currentModel.name);
    await expect(
      page.getByRole("button", { name: AddModelLabel.CREATE_BUTTON }),
    ).toBeEnabled();
    await page
      .getByRole("button", { name: AddModelLabel.CREATE_BUTTON })
      .click();
    await expect(page).toHaveURL(/\/models(?:\?.*)?$/);

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
    currentModel = new Model(generateRandomName("model"), owner);
    const model = currentModel;
    const defaultSpace = `space-${generateRandomName("cfg")}`;
    const architecture = "amd64";

    await owner.dashboardLogin(page, urls.models.addModel);
    await page.locator('input[name="modelName"]').fill(model.name);
    await expect(
      page.getByRole("button", { name: AddModelLabel.CREATE_BUTTON }),
    ).toBeEnabled();
    await page.getByRole("button", { name: AddModelLabel.NEXT_BUTTON }).click();

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

    await page
      .getByRole("button", { name: AddModelLabel.CREATE_BUTTON })
      .click();
    await expect(page).toHaveURL(/\/models(?:\?.*)?$/);
    await expect(
      page
        .locator("tr", { hasText: model.name })
        .and(page.locator("tr", { hasText: model.owner.displayName })),
    ).toBeInViewport();

    await owner.cliLogin(browser);
    await exec(`juju switch '${model.qualifiedName}'`);
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
    currentModel = new Model(generateRandomName("model"), owner);

    await owner.dashboardLogin(page, urls.models.addModel);
    await page.locator('input[name="modelName"]').fill(currentModel.name);
    await expect(
      page.getByRole("button", { name: AddModelLabel.CREATE_BUTTON }),
    ).toBeEnabled();
    await page.getByRole("button", { name: AddModelLabel.NEXT_BUTTON }).click();
    await page
      .locator("label.p-radio", {
        hasText: ConfigsConstraintsLabel.DISABLE_DESTROY_MODEL,
      })
      .click();

    await page
      .getByRole("button", { name: AddModelLabel.CREATE_BUTTON })
      .click();
    await expect(page).toHaveURL(/\/models(?:\?.*)?$/);

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
    currentModel = new Model(generateRandomName("model"), owner);

    await owner.dashboardLogin(page, urls.models.addModel);
    await page.locator('input[name="modelName"]').fill(currentModel.name);
    await expect(
      page.getByRole("button", { name: AddModelLabel.CREATE_BUTTON }),
    ).toBeEnabled();
    await page.getByRole("button", { name: AddModelLabel.NEXT_BUTTON }).click();
    await page.getByRole("button", { name: AddModelLabel.NEXT_BUTTON }).click();

    const addUsersInput = page.getByRole("combobox", {
      name: AccessManagementLabel.MULTI_SELECT_LABEL,
    });
    await addUsersInput.fill(sharedUser.cliUsername);
    await page
      .getByRole("button", { name: new RegExp(sharedUser.cliUsername, "i") })
      .click();

    const sharedUserRow = page.locator("tbody tr", {
      hasText: sharedUser.cliUsername,
    });
    await sharedUserRow.getByRole("button", { name: "Read" }).click();
    await page.getByRole("option", { name: "Admin" }).click();

    const ownerRow = page.locator("tbody tr", { hasText: "(you)" });
    await ownerRow.getByRole("button", { name: "Admin" }).click();
    await page.getByRole("option", { name: "Read" }).click();

    await page
      .getByRole("button", { name: AddModelLabel.CREATE_BUTTON })
      .click();
    await expect(page).toHaveURL(/\/models(?:\?.*)?$/);

    const ownerModelRow = page
      .locator("tr", { hasText: currentModel.name })
      .and(page.locator("tr", { hasText: currentModel.owner.displayName }));
    await expect(ownerModelRow).toBeInViewport();
    await ownerModelRow
      .getByRole("button", { name: ModelActionsLabel.TOGGLE })
      .click();

    await expect(
      page.getByRole("menuitem", { name: ModelActionsLabel.ACCESS }),
    ).toHaveAttribute("aria-disabled", "true");
    await expect(
      page.getByRole("menuitem", { name: ModelActionsLabel.DESTROY }),
    ).toHaveAttribute("aria-disabled", "true");

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
