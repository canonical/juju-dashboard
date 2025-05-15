import { expect } from "@playwright/test";

import { TestId as OutputTestId } from "components/WebCLI/Output/types";
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
    // Skipping candid auth as web CLI websocket can't be authenticated with it.
    test.skip(process.env.AUTH_MODE === "candid");

    const { user, model } = await actions.prepare((add) => {
      const user = add(jujuCLI.createUser());
      const model = add(new AddModel(user));
      return { user, model };
    });
    await user.dashboardLogin(page, model.url);
    await page
      .getByRole("textbox", { name: WebCLIFields.COMMAND })
      .fill("help");
    await page.keyboard.down("Enter");
    await expect(page.getByTestId(OutputTestId.CODE)).toContainText(
      "Juju provides easy, intelligent application orchestration on top of Kubernetes",
    );
  });
});
