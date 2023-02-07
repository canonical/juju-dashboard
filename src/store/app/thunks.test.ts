import { actions as appActions } from "store/app";
import { actions as generalActions } from "store/general";
import { actions as jujuActions } from "store/juju";
import { rootStateFactory } from "testing/factories";
import {
  credentialFactory,
  generalStateFactory,
  configFactory,
} from "testing/factories/general";

import { ControllerArgs } from "./actions";
import { logOut, connectAndStartPolling, connectAndListModels } from "./thunks";

describe("thunks", () => {
  it("logOut", async () => {
    const action = logOut();
    const dispatch = jest.fn();
    const getState = jest.fn(() =>
      rootStateFactory.build({
        general: generalStateFactory.build({
          config: configFactory.build({
            identityProviderAvailable: true,
          }),
        }),
      })
    );
    await action(dispatch, getState, null);
    expect(dispatch).toHaveBeenCalledWith(jujuActions.clearModelData());
    expect(dispatch).toHaveBeenCalledWith(jujuActions.clearControllerData());
    const dispatchedThunk = await dispatch.mock.calls[3][0](
      dispatch,
      getState,
      null
    );
    expect(dispatchedThunk.type).toBe("app/connectAndStartPolling/fulfilled");
  });

  it("connectAndStartPolling", async () => {
    const action = connectAndStartPolling();
    const dispatch = jest.fn();
    const getState = jest.fn(() => rootStateFactory.build());
    await action(dispatch, getState, null);
    const dispatchedThunk = await dispatch.mock.calls[1][0](
      dispatch,
      getState,
      null
    );
    expect(dispatchedThunk.type).toBe("app/connectAndListModels/fulfilled");
  });

  it("connectAndStartPolling with additional controllers", async () => {
    const additionalController: ControllerArgs = [
      "wss://additional.test.com",
      { user: "additional", password: "additional123" },
      true,
    ];
    localStorage.setItem(
      "additionalControllers",
      JSON.stringify([additionalController])
    );
    const action = connectAndStartPolling();
    const dispatch = jest.fn();
    const getState = jest.fn(() => rootStateFactory.build());
    await action(dispatch, getState, null);
    // expect(dispatch).toHaveBeenCalledWith(
    //   connectAndListModels([additionalController])
    // );
    expect(dispatch).toHaveBeenCalledWith(
      generalActions.storeUserPass({
        wsControllerURL: additionalController[0],
        credential: additionalController[1],
      })
    );
    expect(dispatch).toHaveBeenCalledWith(
      jujuActions.updateControllerList({
        wsControllerURL: additionalController[0],
        controllers: [{ additionalController: true }],
      })
    );
    localStorage.removeItem("additionalControllers");
  });

  it("connectAndListModels", async () => {
    const additionalController: ControllerArgs = [
      "wss://additional.test.com",
      { user: "additional", password: "additional123" },
      true,
    ];
    const dispatch = jest.fn();
    const getState = jest.fn(() =>
      rootStateFactory.build({
        general: generalStateFactory.build({
          config: configFactory.build({
            isJuju: true,
          }),
          controllerConnections: {
            "wss://example.com": {
              user: {
                "display-name": "eggman",
                identity: "user-eggman@external",
                "controller-access": "",
                "model-access": "",
              },
            },
          },
          credentials: {
            "wss://example.com": credentialFactory.build(),
          },
        }),
        juju: {
          controllers: {
            "wss://example.com": [
              {
                path: "/",
                uuid: "uuid123",
                version: "1",
              },
            ],
          },
        },
      })
    );
    const action = connectAndListModels([additionalController]);
    await action(dispatch, getState, null);
    expect(dispatch).toHaveBeenCalledWith(
      appActions.connectAndPollControllers({
        controllers: [
          ["wss://controller.example.com", undefined, false],
          additionalController,
        ],
        isJuju: true,
      })
    );
  });
});
