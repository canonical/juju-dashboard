import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { RootState } from "store/store";
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
  let state: RootState;
  beforeEach(() => {
    state = rootStateFactory.build({
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
  });

  it("displays the actions menu", () => {
    renderComponent(
      <ModelActions
        activeUser="eggman@external"
        modelUUID="model123"
        modelName="test-model"
      />,
    );
    expect(
      screen.getByRole("button", { name: "Toggle menu" }),
    ).toBeInTheDocument();
  });

  it("shows option to manage access if user has permission", async () => {
    renderComponent(
      <ModelActions
        activeUser="eggman@external"
        modelUUID="model123"
        modelName="test1"
      />,
      { state },
    );

    await userEvent.click(screen.getByRole("button", { name: "Toggle menu" }));
    expect(
      screen.queryByRole("button", { name: Label.ACCESS }),
    ).toBeInTheDocument();
  });

  it("shows the panel to share model if user has permission", async () => {
    const { router } = renderComponent(
      <ModelActions
        activeUser="eggman@external"
        modelUUID="model123"
        modelName="test1"
      />,
      { state },
    );

    await userEvent.click(screen.getByRole("button", { name: "Toggle menu" }));
    await userEvent.click(screen.getByRole("button", { name: Label.ACCESS }));
    expect(router.state.location.search).toEqual(
      "?model=test1&panel=share-model",
    );
  });

  it("disables the option to manage access if the user does not have permission", async () => {
    renderComponent(
      <ModelActions
        activeUser="eggman@external"
        modelUUID="model123"
        modelName="test-model"
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Toggle menu" }));
    expect(screen.getByRole("link", { name: Label.ACCESS })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });
});
