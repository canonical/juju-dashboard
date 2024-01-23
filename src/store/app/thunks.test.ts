import { actions as appActions } from "store/app";
import { actions as generalActions } from "store/general";
import { actions as jujuActions } from "store/juju";
import { rootStateFactory } from "testing/factories";
import {
  credentialFactory,
  generalStateFactory,
  configFactory,
} from "testing/factories/general";
import {
  controllerFactory,
  jujuStateFactory,
} from "testing/factories/juju/juju";

import { logOut, connectAndStartPolling, Label } from "./thunks";

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
      }),
    );
    await action(dispatch, getState, null);
    expect(dispatch).toHaveBeenCalledWith(jujuActions.clearModelData());
    expect(dispatch).toHaveBeenCalledWith(jujuActions.clearControllerData());
    expect(dispatch).toHaveBeenCalledWith(generalActions.logOut());
    const dispatchedThunk = await dispatch.mock.calls[4][0](
      dispatch,
      getState,
      null,
    );
    expect(dispatchedThunk.type).toBe("app/connectAndStartPolling/fulfilled");
  });

  it("connectAndStartPolling", async () => {
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
        juju: jujuStateFactory.build({
          controllers: {
            "wss://example.com": [
              controllerFactory.build({
                path: "/",
                uuid: "uuid123",
                version: "1",
              }),
            ],
          },
        }),
      }),
    );
    const action = connectAndStartPolling();
    await action(dispatch, getState, null);
    expect(dispatch).toHaveBeenCalledWith(
      appActions.connectAndPollControllers({
        controllers: [["wss://controller.example.com", undefined, false]],
        isJuju: true,
      }),
    );
  });

  it("connectAndStartPolling should catch error", async () => {
    const consoleError = console.error;
    console.error = jest.fn();
    const dispatch = jest
      .fn()
      // Successfuly dispatch connectAndStartPolling/pending.
      .mockImplementationOnce(() => {})
      // Throw error when trying to dispatch connectAndPollControllers.
      .mockImplementationOnce(() => {
        throw new Error("Error while dispatching connectAndPollControllers!");
      });
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
        juju: jujuStateFactory.build({
          controllers: {
            "wss://example.com": [
              controllerFactory.build({
                path: "/",
                uuid: "uuid123",
                version: "1",
              }),
            ],
          },
        }),
      }),
    );
    const action = connectAndStartPolling();
    await action(dispatch, getState, null);
    expect(dispatch).toHaveBeenCalledWith(
      appActions.connectAndPollControllers({
        controllers: [["wss://controller.example.com", undefined, false]],
        isJuju: true,
      }),
    );
    expect(console.error).toHaveBeenCalledWith(
      Label.CONNECT_AND_START_POLLING_ERROR,
      new Error("Error while dispatching connectAndPollControllers!"),
    );
    expect(dispatch).toHaveBeenCalledWith(
      generalActions.storeConnectionError(
        Label.CONNECT_AND_START_POLLING_ERROR,
      ),
    );
    console.error = consoleError;
  });
});
