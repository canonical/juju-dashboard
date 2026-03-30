import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { JIMMRelation, JIMMTarget } from "juju/jimm/JIMMV4";
import type { RootState } from "store/store";
import {
  configFactory,
  generalStateFactory,
  authUserInfoFactory,
  controllerFeaturesFactory,
  controllerFeaturesStateFactory,
} from "testing/factories/general";
import {
  modelInfoFactory,
  modelUserInfoFactory,
} from "testing/factories/juju/ModelManagerV10";
import { rebacAllowedFactory } from "testing/factories/juju/jimm";
import {
  jujuStateFactory,
  modelDataFactory,
  modelListInfoFactory,
  rebacState,
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
            qualifier: "user-admin@external",
            wsControllerURL: "wss://jimm.jujucharms.com/api",
          }),
        },
        modelData: {
          abc123: modelDataFactory.build({
            info: modelInfoFactory.build({
              "is-controller": false,
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
        qualifier="eggman@external"
        modelUUID="abc123"
        modelName="test-model"
      />,
    );
    expect(
      screen.getByRole("button", { name: Label.TOGGLE }),
    ).toBeInTheDocument();
  });

  it("shows option to manage access if user has permission", async () => {
    renderComponent(
      <ModelActions
        qualifier="eggman@external"
        modelUUID="abc123"
        modelName="test1"
      />,
      {
        state,
      },
    );

    await userEvent.click(screen.getByRole("button", { name: Label.TOGGLE }));
    expect(
      screen.queryByRole("button", { name: Label.ACCESS }),
    ).toBeInTheDocument();
  });

  it("shows the panel to share model if user has permission", async () => {
    const { router } = renderComponent(
      <ModelActions
        qualifier="eggman@external"
        modelUUID="abc123"
        modelName="test1"
      />,
      { state },
    );

    await userEvent.click(screen.getByRole("button", { name: Label.TOGGLE }));
    await userEvent.click(screen.getByRole("button", { name: Label.ACCESS }));
    expect(router.state.location.search).toEqual(
      "?model=test1&panel=share-model",
    );
  });

  it("disables the option to manage access if the user does not have permission", async () => {
    renderComponent(
      <ModelActions
        qualifier="eggman@external"
        modelUUID="abc123"
        modelName="test-model"
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: Label.TOGGLE }));
    expect(screen.getByRole("link", { name: Label.ACCESS })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });

  it("shows option to destroy a model if user has permission", async () => {
    renderComponent(
      <ModelActions
        qualifier="eggman@external"
        modelUUID="abc123"
        modelName="test1"
      />,
      {
        state,
      },
    );

    await userEvent.click(screen.getByRole("button", { name: Label.TOGGLE }));
    expect(
      screen.queryByRole("button", { name: Label.DESTROY }),
    ).toBeInTheDocument();
  });

  it("shows the modal to destroy model if user has permission", async () => {
    renderComponent(
      <ModelActions
        qualifier="eggman@external"
        modelUUID="abc123"
        modelName="test1"
      />,
      {
        state,
      },
    );

    await userEvent.click(screen.getByRole("button", { name: Label.TOGGLE }));
    await userEvent.click(screen.getByRole("button", { name: Label.DESTROY }));
    expect(
      screen.getByRole("dialog", { name: "Destroy model test1" }),
    ).toBeInTheDocument();
  });

  it("disables the option to destroy a model if the user does not have permission", async () => {
    state.juju.modelData.abc123.info = modelInfoFactory.build({
      "is-controller": false,
      uuid: "abc123",
      name: "test1",
      "controller-uuid": "controller123",
      users: [
        modelUserInfoFactory.build({
          user: "eggman@external",
          access: "read",
        }),
      ],
    });
    renderComponent(
      <ModelActions
        qualifier="eggman@external"
        modelUUID="abc123"
        modelName="test1"
      />,
      {
        state,
      },
    );

    await userEvent.click(screen.getByRole("button", { name: Label.TOGGLE }));
    expect(screen.getByRole("button", { name: Label.DESTROY })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });

  it("disables the option to destroy a model if the model is a controller model", async () => {
    const controllerModelState = rootStateFactory.build({
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
            qualifier: "user-eggman@external",
            wsControllerURL: "wss://jimm.jujucharms.com/api",
          }),
        },
        modelData: {
          abc123: modelDataFactory.build({
            info: modelInfoFactory.build({
              "is-controller": true,
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
      <ModelActions
        qualifier="eggman@external"
        modelUUID="abc123"
        modelName="test-model"
      />,
      { state: controllerModelState },
    );

    await userEvent.click(screen.getByRole("button", { name: Label.TOGGLE }));
    expect(screen.getByRole("button", { name: Label.DESTROY })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });

  describe("upgrade model", () => {
    beforeEach(() => {
      state = rootStateFactory.build({
        general: generalStateFactory.build({
          config: configFactory.build({
            isJuju: false,
            controllerAPIEndpoint: "wss://example.com/api",
          }),
          controllerConnections: {
            "wss://example.com/api": {
              user: authUserInfoFactory.build(),
            },
          },
          controllerFeatures: controllerFeaturesStateFactory.build({
            "wss://example.com/api": controllerFeaturesFactory.build({
              rebac: true,
            }),
          }),
        }),
        juju: jujuStateFactory.build({
          modelData: {
            abc123: modelDataFactory.build({
              info: modelInfoFactory.build({
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
            }),
          },
          rebac: rebacState.build({
            allowed: [
              rebacAllowedFactory.build({
                tuple: {
                  object: "user-eggman@external",
                  relation: JIMMRelation.ADMINISTRATOR,
                  target_object: JIMMTarget.JIMM_CONTROLLER,
                },
                allowed: true,
                loading: false,
                loaded: true,
              }),
            ],
          }),
        }),
      });
    });

    it("displays the upgrade model option", async () => {
      renderComponent(
        <ModelActions
          qualifier="eggman@external"
          modelUUID="abc123"
          modelName="test1"
        />,
        {
          state,
        },
      );
      await userEvent.click(screen.getByRole("button", { name: Label.TOGGLE }));
      expect(
        screen.getByRole("button", { name: Label.UPGRADE }),
      ).toBeInTheDocument();
    });

    it("opens the upgrade model panel", async () => {
      const { router } = renderComponent(
        <ModelActions
          qualifier="eggman@external"
          modelUUID="abc123"
          modelName="test1"
        />,
        {
          state,
        },
      );
      await userEvent.click(screen.getByRole("button", { name: Label.TOGGLE }));
      await userEvent.click(
        screen.getByRole("button", { name: Label.UPGRADE }),
      );
      expect(router.state.location.search).toEqual(
        "?modelName=test1&panel=upgrade-model&qualifier=eggman%40external",
      );
    });

    it("does not display the option for Juju", async () => {
      if (state.general.config) {
        state.general.config.isJuju = true;
      }
      renderComponent(
        <ModelActions
          qualifier="eggman@external"
          modelUUID="abc123"
          modelName="test1"
        />,
        {
          state,
        },
      );
      await userEvent.click(screen.getByRole("button", { name: Label.TOGGLE }));
      expect(
        screen.queryByRole("button", { name: Label.UPGRADE }),
      ).not.toBeInTheDocument();
    });

    it("disables the option if the user is not a JIMM admin", async () => {
      state.juju.rebac.allowed = [];
      renderComponent(
        <ModelActions
          qualifier="eggman@external"
          modelUUID="abc123"
          modelName="test1"
        />,
        {
          state,
        },
      );
      await userEvent.click(screen.getByRole("button", { name: Label.TOGGLE }));
      expect(
        screen.getByRole("button", { name: Label.UPGRADE }),
      ).toHaveAttribute("aria-disabled");
    });
  });
});
