import { actions as appActions } from "store/app";
import { actions as generalActions } from "store/general";
import { actions as jujuActions } from "store/juju";
import type { RootState } from "store/store";
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

import { logOut, connectAndStartPolling } from "./thunks";

describe("thunks", () => {
  const consoleError = console.error;
  let state: RootState;

  beforeEach(() => {
    console.error = jest.fn();
    state = rootStateFactory.build({
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
    });
  });

  afterEach(() => {
    console.error = consoleError;
  });

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
    const getState = jest.fn(() => state);
    const action = connectAndStartPolling();
    await action(dispatch, getState, null);
    expect(dispatch).toHaveBeenCalledWith(
      appActions.connectAndPollControllers({
        controllers: [["wss://controller.example.com", undefined, false]],
        isJuju: true,
      }),
    );
  });

  it("connectAndStartPolling should catch error instanceof Error", async () => {
    const dispatch = jest
      .fn()
      // Successfuly dispatch connectAndStartPolling/pending.
      .mockImplementationOnce(() => {})
      // Throw error when trying to dispatch connectAndPollControllers.
      .mockImplementationOnce(() => {
        // eslint-disable-next-line no-throw-literal
        throw "Error while dispatching connectAndPollControllers!";
      });
    const getState = jest.fn(() => state);
    const action = connectAndStartPolling();
    await action(dispatch, getState, null);
    expect(dispatch).toHaveBeenCalledWith(
      appActions.connectAndPollControllers({
        controllers: [["wss://controller.example.com", undefined, false]],
        isJuju: true,
      }),
    );
    expect(console.error).toHaveBeenCalledWith(
      "Error while triggering the connection and polling of models.",
      "Error while dispatching connectAndPollControllers!",
    );
    expect(dispatch).toHaveBeenCalledWith(
      generalActions.storeConnectionError(
        "Unable to connect: Error while dispatching connectAndPollControllers!",
      ),
    );
  });

  it("connectAndStartPolling should catch string error", async () => {
    const dispatch = jest
      .fn()
      // Successfuly dispatch connectAndStartPolling/pending.
      .mockImplementationOnce(() => {})
      // Throw error when trying to dispatch connectAndPollControllers.
      .mockImplementationOnce(() => {
        throw new Error("Error while dispatching connectAndPollControllers!");
      });
    const getState = jest.fn(() => state);
    const action = connectAndStartPolling();
    await action(dispatch, getState, null);
    expect(dispatch).toHaveBeenCalledWith(
      appActions.connectAndPollControllers({
        controllers: [["wss://controller.example.com", undefined, false]],
        isJuju: true,
      }),
    );
    expect(console.error).toHaveBeenCalledWith(
      "Error while triggering the connection and polling of models.",
      new Error("Error while dispatching connectAndPollControllers!"),
    );
    expect(dispatch).toHaveBeenCalledWith(
      generalActions.storeConnectionError(
        "Unable to connect: Error while dispatching connectAndPollControllers!",
      ),
    );
  });

  it("connectAndStartPolling should catch non-standard type of error", async () => {
    const dispatch = jest
      .fn()
      // Successfuly dispatch connectAndStartPolling/pending.
      .mockImplementationOnce(() => {})
      // Throw error when trying to dispatch connectAndPollControllers.
      .mockImplementationOnce(() => {
        // eslint-disable-next-line no-throw-literal
        throw ["Unknown error."];
      });
    const getState = jest.fn(() => state);
    const action = connectAndStartPolling();
    await action(dispatch, getState, null);
    expect(dispatch).toHaveBeenCalledWith(
      appActions.connectAndPollControllers({
        controllers: [["wss://controller.example.com", undefined, false]],
        isJuju: true,
      }),
    );
    expect(console.error).toHaveBeenCalledWith(
      "Error while triggering the connection and polling of models.",
      ["Unknown error."],
    );
    expect(dispatch).toHaveBeenCalledWith(
      generalActions.storeConnectionError(
        "Unable to connect: Something went wrong. View the console log for more details.",
      ),
    );
  });
});
