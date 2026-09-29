import type { Locator, Page } from "@playwright/test";

import type { User } from "../helpers/auth";

/**
 * Returns a locator for a model row in the models table, matched by both model
 * name and owner display name.
 */
export function modelRow(
  page: Page,
  modelName: string,
  ownerDisplayName: string,
): Locator {
  return page
    .locator("tr", { hasText: modelName })
    .and(page.locator("tr", { hasText: ownerDisplayName }));
}

/**
 * Retries reloading the dashboard until the given model rows detach from the
 * DOM. Rows are identified by model name and owner display name.
 *
 * @param page - The Playwright page object.
 * @param user - The logged-in user, used to reload the dashboard.
 * @param models - One or more `{ modelName, ownerDisplayName }` pairs.
 * @param retries - Number of reload attempts before giving up. Defaults to 3.
 */
export async function waitForModelsDestroyed(
  page: Page,
  user: User,
  models: { modelName: string; ownerDisplayName: string }[],
  retries = 3,
): Promise<void> {
  const locators = models.map(({ modelName, ownerDisplayName }) =>
    modelRow(page, modelName, ownerDisplayName),
  );
  while (retries-- > 0) {
    try {
      await user.reloadDashboard(page);
      for (const locator of locators) {
        await locator.waitFor({ state: "detached", timeout: 30000 });
      }
      return;
    } catch (error) {
      if (retries === 0) {
        throw error;
      }
    }
  }
}
