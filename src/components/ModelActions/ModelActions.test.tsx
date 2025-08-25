import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  configFactory,
  generalStateFactory,
  authUserInfoFactory,
} from "testing/factories/general";
import { modelUserInfoFactory } from "testing/factories/juju/ModelManagerV9";
import {
  modelDataInfoFactory,
  jujuStateFactory,
  modelDataFactory,
  modelListInfoFactory,
} from "testing/factories/juju/juju";
import { rootStateFactory } from "testing/factories/root";
import { renderComponent } from "testing/utils";

import ModelActions from "./ModelActions";
import { Label } from "./types";

describe("ModelActions", () => {
  it("displays the actions menu", () => {
    renderComponent(
      <ModelActions activeUser="eggman@external" modelName="test-model" />,
    );
    expect(
      screen.getByRole("button", { name: "Toggle menu" }),
    ).toBeInTheDocument();
  });

  it("shows option to manage access if user has permission", async () => {
    const state = rootStateFactory.build({
      general: generalStateFactory.withConfig().build({
        config: configFactory.build({
          isJuju: true,
        }),
        controllerConnections: {
          "wss://jimm.jujucharms.com/api": {
            user: authUserInfoFactory.build({
              identity: "user-eggman@external",
            }),
          },
        },
      }),
      juju: jujuStateFactory.build({
        models: {
          abc123: modelListInfoFactory.build({
            uuid: "abc123",
            name: "test1",
            ownerTag: "user-eggman@external",
            wsControllerURL: "wss://jimm.jujucharms.com/api",
          }),
        },
        modelData: {
          abc123: modelDataFactory.build({
            info: modelDataInfoFactory.build({
              uuid: "abc123",
              name: "test1",
              "controller-uuid": "controller123",
              users: [
                modelUserInfoFactory.build({
                  user: "eggman@external",
                  access: "admin",
                }),
              ],
            }),
            uuid: "abc123",
          }),
        },
      }),
    });
    renderComponent(
      <ModelActions activeUser="eggman@external" modelName="test1" />,
      { state },
    );

    await userEvent.click(screen.getByRole("button", { name: "Toggle menu" }));
    expect(
      screen.queryByRole("button", { name: Label.ACCESS }),
    ).toBeInTheDocument();
  });

  it("disables the option to manage access if the user does not have permission", async () => {
    renderComponent(
      <ModelActions activeUser="eggman@external" modelName="test-model" />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Toggle menu" }));
    expect(screen.getByRole("link", { name: Label.ACCESS })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });
});
