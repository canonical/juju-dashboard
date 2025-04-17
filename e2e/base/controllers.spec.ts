import { expect } from "@playwright/test";

import { test } from "../fixtures/setup";
import { ActionStack } from "../helpers/action";

test.describe("Controllers", () => {
  let actions: ActionStack;

  test.beforeEach(({ jujuCLI }) => {
    actions = new ActionStack(jujuCLI);
  });

  test.afterEach(async () => {
    await actions.rollback();
  });

  test("List Controllers", async ({ page, jujuCLI }) => {
    const user = await actions.prepare((add) => {
      return add(jujuCLI.createUser());
    });

    await page.goto("/");
    await user.dashboardLogin(page);
    const controllersTab = page.getByRole("link", { name: "Controllers" });
    await expect(controllersTab).toBeInViewport();
    await controllersTab.click();
    await expect(
      page.getByRole("gridcell").filter({ hasText: jujuCLI.controller }),
    ).toBeInViewport();
  });
});
