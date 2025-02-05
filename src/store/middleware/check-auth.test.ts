import type { UnknownAction, MiddlewareAPI } from "redux";
import type { Mock } from "vitest";
import { vi } from "vitest";

import * as jujuModule from "juju/api";
import { thunks as appThunks } from "store/app";
import { actions as generalActions } from "store/general";
import type { RootState } from "store/store";
import { rootStateFactory } from "testing/factories";
import {
  controllerFactory,
  jujuStateFactory,
} from "testing/factories/juju/juju";

import { checkAuthMiddleware } from "./check-auth";

describe("model poller", () => {
  let fakeStore: MiddlewareAPI;
  let next: Mock;
  const originalLog = console.log;
  const wsControllerURL = "wss://example.com";
  let state: RootState;

  beforeEach(() => {
    console.log = vi.fn();
    vi.useFakeTimers();
    next = vi.fn();
    state = rootStateFactory.build({
      juju: jujuStateFactory.build({
        controllers: {
          [wsControllerURL]: [controllerFactory.build()],
        },
      }),
      general: {
        controllerConnections: {
          [wsControllerURL]: {
            user: {
              identity: "user-eggman",
            },
          },
        },
      },
    });
    fakeStore = {
      getState: vi.fn(() => state),
      dispatch: vi.fn(),
    };
    vi.spyOn(jujuModule, "loginWithBakery").mockImplementation(async () => ({
      error: "Uh oh!",
      wsControllerURL: "wss://example.com/api",
    }));
  });

  const runMiddleware = async (action: UnknownAction) => {
    const middleware = checkAuthMiddleware(fakeStore);
    await middleware(next)(action);
    return middleware;
  };

  afterEach(() => {
    console.log = originalLog;
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("ignores function actions", async () => {
    const action = vi.fn() as unknown as UnknownAction;
    await runMiddleware(action);
    expect(next).toHaveBeenCalledWith(action);
  });

  it("blocks actions when not authenticated", async () => {
    state.general.controllerConnections = {};
    await runMiddleware({ type: "an-action", payload: { wsControllerURL } });
    expect(next).not.toHaveBeenCalled();
  });

  it("blocks actions when not authenticated and no ws param", async () => {
    state.general.controllerConnections = {};
    await runMiddleware({ type: "an-action", payload: null });
    expect(next).not.toHaveBeenCalled();
  });

  it("allows authenticated actions", async () => {
    const action = { type: "an-action", payload: { wsControllerURL } };
    await runMiddleware(action);
    expect(next).toHaveBeenCalledWith(action);
  });

  it("allows some unauthenticated actions", async () => {
    const action = generalActions.cleanupLoginErrors();
    await runMiddleware(action);
    expect(next).toHaveBeenCalledWith(action);
  });

  it("allows some unauthenticated thunk actions", async () => {
    const action = appThunks.connectAndStartPolling.fulfilled(undefined, "abc");
    await runMiddleware(action);
    expect(next).toHaveBeenCalledWith(action);
  });
});
