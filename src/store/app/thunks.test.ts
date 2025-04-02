import { vi } from "vitest";

import { Auth, CandidAuth, OIDCAuth } from "auth";
import { pollWhoamiStop } from "juju/jimm/listeners";
import { actions as appActions } from "store/app";
import { actions as generalActions } from "store/general";
import { AuthMethod } from "store/general/types";
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
import type { WindowConfig } from "types";

import { logOut, connectAndStartPolling } from "./thunks";

describe("thunks", () => {
  let state: RootState;

  beforeEach(() => {
    window.jujuDashboardConfig = {
      controllerAPIEndpoint: "wss://example.com/api",
    } as WindowConfig;
    fetchMock.resetMocks();
    state = rootStateFactory.build({
      general: generalStateFactory.build({
        config: configFactory.build({ isJuju: true }),
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
        credentials: { "wss://example.com": credentialFactory.build() },
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
    delete window.jujuDashboardConfig;
    // @ts-expect-error - Resetting singleton for each test run.
    delete Auth.instance;
  });

  it("logOut", async () => {
    const action = logOut();
    const dispatch = vi.fn();
    const getState = vi.fn(() =>
      rootStateFactory.build({
        general: generalStateFactory.build({
          config: configFactory.build({ authMethod: AuthMethod.CANDID }),
        }),
      }),
    );
    const logoutSpy = vi.spyOn(CandidAuth.prototype, "logout");
    new CandidAuth(dispatch);
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
    expect(logoutSpy).toHaveBeenCalledOnce();
  });

  it("logOut from OIDC", async () => {
    fetchMock.mockResponseOnce(JSON.stringify({}), { status: 200 });
    const action = logOut();
    const dispatch = vi.fn();
    const getState = vi.fn(() =>
      rootStateFactory.build({
        general: generalStateFactory.build({
          config: configFactory.build({ authMethod: AuthMethod.OIDC }),
        }),
      }),
    );
    const logoutSpy = vi.spyOn(OIDCAuth.prototype, "logout");
    new OIDCAuth(dispatch);
    await action(dispatch, getState, null);
    expect(dispatch).toHaveBeenCalledWith(jujuActions.clearModelData());
    expect(dispatch).toHaveBeenCalledWith(jujuActions.clearControllerData());
    expect(dispatch).toHaveBeenCalledWith(generalActions.logOut());
    expect(dispatch).toHaveBeenCalledWith(pollWhoamiStop());
    const dispatchedThunk = await dispatch.mock.calls[5][0](
      dispatch,
      getState,
      null,
    );
    expect(dispatchedThunk.type).toBe("jimm/logout/fulfilled");
    expect(logoutSpy).toHaveBeenCalledOnce();
  });

  it("connectAndStartPolling", async () => {
    const dispatch = vi.fn();
    const getState = vi.fn(() => state);
    const action = connectAndStartPolling();
    await action(dispatch, getState, null);
    expect(dispatch).toHaveBeenCalledWith(
      appActions.connectAndPollControllers({
        controllers: [["wss://controller.example.com", undefined]],
        isJuju: true,
      }),
    );
  });

  it("connectAndStartPolling should catch error instanceof Error", async () => {
    const dispatch = vi
      .fn()
      // Successfuly dispatch connectAndStartPolling/pending.
      .mockImplementationOnce(() => {})
      // Throw error when trying to dispatch connectAndPollControllers.
      .mockImplementationOnce(() => {
        throw "Error while dispatching connectAndPollControllers!";
      });
    const getState = vi.fn(() => state);
    const action = connectAndStartPolling();
    await action(dispatch, getState, null);
    expect(dispatch).toHaveBeenCalledWith(
      appActions.connectAndPollControllers({
        controllers: [["wss://controller.example.com", undefined]],
        isJuju: true,
      }),
    );
    expect(dispatch).toHaveBeenCalledWith(
      generalActions.storeConnectionError(
        "Unable to connect: Error while dispatching connectAndPollControllers!",
      ),
    );
  });

  it("connectAndStartPolling should catch string error", async () => {
    const dispatch = vi
      .fn()
      // Successfuly dispatch connectAndStartPolling/pending.
      .mockImplementationOnce(() => {})
      // Throw error when trying to dispatch connectAndPollControllers.
      .mockImplementationOnce(() => {
        throw new Error("Error while dispatching connectAndPollControllers!");
      });
    const getState = vi.fn(() => state);
    const action = connectAndStartPolling();
    await action(dispatch, getState, null);
    expect(dispatch).toHaveBeenCalledWith(
      appActions.connectAndPollControllers({
        controllers: [["wss://controller.example.com", undefined]],
        isJuju: true,
      }),
    );
    expect(dispatch).toHaveBeenCalledWith(
      generalActions.storeConnectionError(
        "Unable to connect: Error while dispatching connectAndPollControllers!",
      ),
    );
  });

  it("connectAndStartPolling should catch non-standard type of error", async () => {
    const dispatch = vi
      .fn()
      // Successfuly dispatch connectAndStartPolling/pending.
      .mockImplementationOnce(() => {})
      // Throw error when trying to dispatch connectAndPollControllers.
      .mockImplementationOnce(() => {
        throw ["Unknown error."];
      });
    const getState = vi.fn(() => state);
    const action = connectAndStartPolling();
    await action(dispatch, getState, null);
    expect(dispatch).toHaveBeenCalledWith(
      appActions.connectAndPollControllers({
        controllers: [["wss://controller.example.com", undefined]],
        isJuju: true,
      }),
    );
    expect(dispatch).toHaveBeenCalledWith(
      generalActions.storeConnectionError(
        "Unable to connect: Something went wrong. View the console log for more details.",
      ),
    );
  });
});
