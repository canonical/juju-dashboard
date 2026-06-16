import { expect } from "@playwright/test";

import { Label as PrimaryNavLabel } from "components/PrimaryNav/types";

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
    await user.dashboardLogin(page, "/");
    const controllersTab = page.getByRole("link", {
      name: PrimaryNavLabel.CONTROLLERS,
    });
    await expect(controllersTab).toBeInViewport();
    await controllersTab.click();
    // 1 row is the summary row, then one row for each controller.
    await expect(page.getByRole("row")).toHaveCount(2);
  });
});
