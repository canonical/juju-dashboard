import { expect } from "@playwright/test";

import { Label as OutputLabel } from "components/WebCLI/Output/types";
import { Fields as WebCLIFields } from "components/WebCLI/types";

import { test } from "../fixtures/setup";
import { ActionStack } from "../helpers/action";
import { AddModel } from "../helpers/actions";

test.describe("Web CLI", () => {
  let actions: ActionStack;

  test.beforeAll(({ jujuCLI }) => {
    actions = new ActionStack(jujuCLI);
  });

  test.afterAll(async () => {
    await actions.rollback();
  });

  test("Web CLI", async ({ page, jujuCLI }) => {
    const { user, model } = await actions.prepare((add) => {
      const newUser = add(jujuCLI.createUser());
      const newModel = add(new AddModel(jujuCLI, newUser));
      return { user: newUser, model: newModel };
    });
    await user.dashboardLogin(page, model.url);
    await page
      .getByRole("textbox", { name: WebCLIFields.COMMAND })
      .fill("help");
    await page.keyboard.down("Enter");
    await expect(
      page.getByRole("code", {
        name: OutputLabel.OUTPUT,
      }),
    ).toContainText(
      "Juju provides easy, intelligent application orchestration on top of Kubernetes",
    );
  });
});
