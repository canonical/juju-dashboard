import { act, screen } from "@testing-library/react";
import type { UserEvent } from "@testing-library/user-event";
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
import { modelStatusInfoFactory } from "testing/factories/juju/ClientV8";
import {
  modelInfoFactory,
  modelUserInfoFactory,
} from "testing/factories/juju/ModelManagerV10";
import {
  modelMigrationTargetFactory,
  rebacAllowedFactory,
  relationshipTupleFactory,
  versionElemFactory,
} from "testing/factories/juju/jimm";
import {
  controllerFactory,
  jujuStateFactory,
  modelDataFactory,
  modelListInfoFactory,
  modelMigrationTargetsStateFactory,
  rebacState,
  supportedJujuVersionsStateFactory,
} from "testing/factories/juju/juju";
import { rootStateFactory } from "testing/factories/root";
import { customWithin } from "testing/queries/within";
import { renderComponent } from "testing/utils";

import ModelActions from "./ModelActions";
import { Label } from "./types";

describe("ModelActions", () => {
  let state: RootState;
  beforeEach(() => {
    localStorage.setItem("flags", JSON.stringify(["rebac"]));
    state = rootStateFactory.build({
      general: generalStateFactory.withConfig().build({
        config: configFactory.build({
          controllerAPIEndpoint: "wss://jimm.jujucharms.com/api",
          isJuju: true,
        }),
        controllerConnections: {
          "wss://jimm.jujucharms.com/api": {
            user: authUserInfoFactory.build({
              identity: "user-eggman@external",
            }),
          },
        },
        controllerFeatures: controllerFeaturesStateFactory.build({
          "wss://jimm.jujucharms.com/api": controllerFeaturesFactory.build({
            rebac: true,
          }),
        }),
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
        rebac: {
          allowed: [
            rebacAllowedFactory.build({
              tuple: relationshipTupleFactory.build({
                object: "user-eggman@external",
                relation: JIMMRelation.ADMINISTRATOR,
                target_object: JIMMTarget.JIMM_CONTROLLER,
              }),
              allowed: true,
            }),
          ],
        },
      }),
    });
  });

  afterEach(() => {
    localStorage.removeItem("flags");
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
      screen.queryByRole("menuitem", { name: Label.ACCESS }),
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
    await userEvent.click(screen.getByRole("menuitem", { name: Label.ACCESS }));
    expect(new URLSearchParams(router.state.location.search)).toStrictEqual(
      new URLSearchParams({
        model: "test1",
        panel: "share-model",
      }),
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
    expect(
      screen.getByRole("menuitem", { name: Label.ACCESS }),
    ).toHaveAttribute("aria-disabled", "true");
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
      screen.queryByRole("menuitem", { name: Label.DESTROY }),
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
    await userEvent.click(
      screen.getByRole("menuitem", { name: Label.DESTROY }),
    );
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
    expect(
      screen.getByRole("menuitem", { name: Label.DESTROY }),
    ).toHaveAttribute("aria-disabled", "true");
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
    expect(
      screen.getByRole("menuitem", { name: Label.DESTROY }),
    ).toHaveAttribute("aria-disabled", "true");
  });

  describe("upgrade model", () => {
    let userEventWithTimers: UserEvent;

    beforeEach(() => {
      userEventWithTimers = userEvent.setup({
        advanceTimers: vi.advanceTimersByTime,
      });
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
          controllers: {
            "wss://example.com/api": [
              controllerFactory.build({
                uuid: "controller123",
                version: "1.2.3",
                name: "controller1",
              }),
              controllerFactory.build({
                uuid: "controller456",
                version: "4.6.14",
                name: "controller2",
              }),
            ],
          },
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
              model: modelStatusInfoFactory.build({
                version: "1.2.3",
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
          modelMigrationTargets: modelMigrationTargetsStateFactory.build({
            abc123: modelMigrationTargetFactory.build({
              data: ["controller123", "controller456"],
            }),
          }),
          supportedJujuVersions: supportedJujuVersionsStateFactory.build({
            data: [
              versionElemFactory.build({ version: "1.2.3" }),
              versionElemFactory.build({ version: "4.6.14" }),
            ],
          }),
        }),
      });
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("displays the loading state", async () => {
      state.juju.modelMigrationTargets = {
        abc123: modelMigrationTargetFactory.build({
          data: undefined,
        }),
      };
      state.juju.supportedJujuVersions =
        supportedJujuVersionsStateFactory.build({
          data: undefined,
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
      const upgrade = screen.getByRole("menuitem", {
        name: new RegExp(Label.UPGRADE),
      });
      expect(
        customWithin(upgrade).getSpinnerByLabel("Loading"),
      ).toBeInTheDocument();
      expect(upgrade).toHaveAttribute("aria-disabled", "true");
    });

    it("disables the upgrade option if there are no available controllers", async () => {
      vi.useFakeTimers();
      state.juju.modelMigrationTargets = {
        abc123: modelMigrationTargetFactory.build({
          data: [],
        }),
      };
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
      await userEventWithTimers.click(
        screen.getByRole("button", { name: Label.TOGGLE }),
      );
      const menuItem = screen.getByRole("menuitem", { name: Label.UPGRADE });
      expect(menuItem).toHaveAttribute("aria-disabled", "true");
      await act(async () => {
        await userEventWithTimers.hover(menuItem);
        vi.runAllTimers();
      });
      expect(menuItem).toHaveAccessibleDescription(
        "No upgrade available. Bootstrap a controller >=4.6.14 version first, to enable upgrades.",
      );
    });

    it("disables the upgrade option if it is on the latest version", async () => {
      vi.useFakeTimers();
      state.juju.modelData.abc123.model.version = "4.6.14";
      if (state.juju.modelData.abc123.info) {
        state.juju.modelData.abc123.info["controller-uuid"] = "controller456";
      } else {
        assert.fail("Model info is undefined");
      }
      state.juju.modelMigrationTargets = {
        abc123: modelMigrationTargetFactory.build({
          data: [],
        }),
      };
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
      await userEventWithTimers.click(
        screen.getByRole("button", { name: Label.TOGGLE }),
      );
      const menuItem = screen.getByRole("menuitem", { name: Label.UPGRADE });
      expect(menuItem).toHaveAttribute("aria-disabled", "true");
      await act(async () => {
        await userEventWithTimers.hover(menuItem);
        vi.runAllTimers();
      });
      expect(menuItem).toHaveAccessibleDescription(Label.UPGRADE_LATEST);
    });

    it("enables the upgrade option if there are upgrades", async () => {
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
        screen.getByRole("menuitem", { name: Label.UPGRADE }),
      ).not.toHaveAttribute("aria-disabled");
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
        screen.getByRole("menuitem", { name: Label.UPGRADE }),
      );
      expect(new URLSearchParams(router.state.location.search)).toStrictEqual(
        new URLSearchParams({
          modelName: "test1",
          panel: "upgrade-model",
          qualifier: "eggman@external",
        }),
      );
    });

    it("does not display the option for Juju", async () => {
      if (!state.general.config) {
        assert.fail("config doesn't exist");
      }
      state.general.config.isJuju = true;
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
        screen.queryByRole("menuitem", { name: Label.UPGRADE }),
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
        screen.getByRole("menuitem", { name: Label.UPGRADE }),
      ).toHaveAttribute("aria-disabled");
    });
  });
});
