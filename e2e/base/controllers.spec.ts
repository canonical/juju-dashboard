import { expect } from "@playwright/test";

import { Label as PrimaryNavLabel } from "components/PrimaryNav/types";

import { JujuEnv, test } from "../fixtures/setup";
import { ActionStack } from "../helpers/action";

test.describe("Controllers", () => {
  let actions: ActionStack;

  test.beforeEach(({ jujuCLI }) => {
    actions = new ActionStack(jujuCLI);
  });

  test.afterEach(async () => {
    await actions.rollback();
  });

  test("List Controllers", async ({ page, jujuCLI, testOptions }) => {
    const user = await actions.prepare((add) => {
      return add(jujuCLI.createUser());
    });
    await user.dashboardLogin(page, "/");
    const controllersTab = page.getByRole("link", {
      name: PrimaryNavLabel.CONTROLLERS,
    });
    await expect(controllersTab).toBeInViewport();
    await controllersTab.click();
    await expect(
      page.getByRole("gridcell").filter({
        hasText:
          // If you're a non-admin in jimm the controller is displayed as "jaas".
          testOptions.jujuEnv === JujuEnv.JIMM ? "jaas" : jujuCLI.controller,
      }),
    ).toBeInViewport();
  });
});
