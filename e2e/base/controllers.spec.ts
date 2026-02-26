import { expect } from "@playwright/test";

import { Label as PrimaryNavLabel } from "components/PrimaryNav/types";

import { JujuEnv, test } from "../fixtures/setup";
import { ActionStack } from "../helpers/action";
import { GiveControllerAccess } from "../helpers/actions";
import { ControllerPermission } from "../helpers/objects";

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
      const newUser = add(jujuCLI.createUser());
      // JIMM users need access to the controller to be able to see it.
      if (testOptions.jujuEnv === JujuEnv.JIMM) {
        add(
          new GiveControllerAccess(
            jujuCLI.controllerInstance,
            newUser,
            ControllerPermission.ADD_MODEL,
          ),
        );
      }
      return newUser;
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
