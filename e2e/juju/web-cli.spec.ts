import { expect } from "@playwright/test";

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
    // Skipping candid auth as web CLI websocket can't be authenticated with it.
    test.skip(process.env.AUTH_MODE === "candid");

    const { user, model } = await actions.prepare((add) => {
      const user = add(jujuCLI.createUser());
      const model = add(new AddModel(user));
      return { user, model };
    });

    await page.goto(`/models/${user.dashboardUsername}/${model.name}`);
    await user.dashboardLogin(page);
    await page.getByRole("textbox", { name: "command" }).fill("help");
    await page.keyboard.down("Enter");
    await expect(page.getByTestId("output-code")).toContainText(
      "Juju provides easy, intelligent application orchestration on top of Kubernetes",
    );
  });
});
