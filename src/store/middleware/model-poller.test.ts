import type { Client, Connection, Transport } from "@canonical/jujulib";
import type { AnyAction, MiddlewareAPI } from "redux";

import * as jujuModule from "juju/api";
import { actions as appActions, thunks as appThunks } from "store/app";
import type { ControllerArgs } from "store/app/actions";
import { actions as generalActions } from "store/general";
import { actions as jujuActions } from "store/juju";
import { rootStateFactory } from "testing/factories";
import { generalStateFactory } from "testing/factories/general";
import {
  controllerFactory,
  jujuStateFactory,
} from "testing/factories/juju/juju";

import { LoginError, modelPollerMiddleware } from "./model-poller";

jest.mock("juju/api", () => ({
  disableControllerUUIDMasking: jest
    .fn()
    .mockImplementation(async () => await Promise.resolve()),
  fetchControllerList: jest
    .fn()
    .mockImplementation(async () => await Promise.resolve()),
  loginWithBakery: jest.fn(),
  fetchAllModelStatuses: jest.fn(),
  setModelSharingPermissions: jest.fn(),
}));

describe("model poller", () => {
  let fakeStore: MiddlewareAPI;
  let next: jest.Mock;
  const originalLog = console.log;
  const wsControllerURL = "wss://example.com";
  const controllers: ControllerArgs[] = [
    [wsControllerURL, { user: "eggman@external", password: "test" }, false],
  ];
  const models = [
    {
      model: {
        uuid: "abc123",
        name: "a model",
        "owner-tag": "user-eggman@external",
        type: "model",
      },
      "last-connection": "today",
    },
  ];
  let juju: Client;
  const intervalId = 99;
  let conn: Connection;
  const storeState = rootStateFactory.build({
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

  beforeEach(() => {
    jest.useFakeTimers();
    next = jest.fn();
    fakeStore = {
      getState: jest.fn(() => ({})),
      dispatch: jest.fn(),
    };
    conn = {
      facades: {
        modelManager: {
          listModels: jest.fn().mockResolvedValue({ "user-models": models }),
        },
      },
      info: {
        user: {
          "controller-access": "admin",
          "model-access": "admin",
          "display-name": "Eggman",
          identity: "eggman",
        },
      },
      transport: {} as Transport,
    };
    juju = {
      logout: jest.fn(),
    } as unknown as Client;
  });

  const runMiddleware = async (actionOverrides?: Partial<AnyAction>) => {
    const action = {
      ...appActions.connectAndPollControllers({
        controllers,
        isJuju: true,
      }),
      ...(actionOverrides ?? {}),
    };
    const middleware = modelPollerMiddleware(fakeStore);
    await middleware(next)(action);
    return middleware;
  };

  afterEach(() => {
    console.log = originalLog;
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it("ignores unrelated actions", async () => {
    const action = {
      type: "UNKNOWN",
      payload: null,
    };
    await runMiddleware(action);
    expect(next).toHaveBeenCalledWith(action);
    expect(fakeStore.getState).not.toHaveBeenCalled();
    expect(fakeStore.dispatch).not.toHaveBeenCalledWith(action);
  });

  it("does not pass through matched actions", async () => {
    await runMiddleware({ payload: { controllers: [], isJuju: true } });
    expect(next).not.toHaveBeenCalled();
  });

  it("dispatches login errors", async () => {
    jest
      .spyOn(jujuModule, "loginWithBakery")
      .mockImplementation(async () => ({ error: "Uh oh!" }));
    await runMiddleware();
    expect(next).not.toHaveBeenCalled();
    expect(fakeStore.dispatch).toHaveBeenCalledWith(
      generalActions.storeLoginError("Uh oh!")
    );
  });

  it("logs login exceptions", async () => {
    jest.spyOn(console, "log").mockImplementation(jest.fn);
    jest.spyOn(jujuModule, "loginWithBakery").mockImplementation(async () => {
      throw new Error("Uh oh!");
    });
    await runMiddleware();
    expect(next).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith(
      LoginError.LOG,
      new Error("Uh oh!"),
      [
        "wss://example.com",
        {
          password: "test",
          user: "eggman@external",
        },
        false,
      ]
    );
  });

  it("fetches and stores data", async () => {
    const fetchControllerList = jest.spyOn(jujuModule, "fetchControllerList");
    conn.facades.modelManager.listModels.mockResolvedValue({
      "user-models": [],
    });
    jest.spyOn(jujuModule, "loginWithBakery").mockImplementation(async () => ({
      conn,
      intervalId,
      juju,
    }));
    await runMiddleware();
    expect(next).not.toHaveBeenCalled();
    expect(fakeStore.dispatch).toHaveBeenCalledWith(
      generalActions.updateControllerConnection({
        wsControllerURL,
        info: conn.info,
      })
    );
    expect(fakeStore.dispatch).toHaveBeenCalledWith(
      generalActions.updatePingerIntervalId({ wsControllerURL, intervalId })
    );
    expect(fetchControllerList).toHaveBeenCalledWith(
      wsControllerURL,
      conn,
      false,
      fakeStore.dispatch,
      fakeStore.getState
    );
  });

  it("dispatches an error if the info is not returned", async () => {
    jest.spyOn(jujuModule, "loginWithBakery").mockImplementation(async () => ({
      conn: { ...conn, info: {} },
      intervalId,
      juju,
    }));
    await runMiddleware();
    expect(next).not.toHaveBeenCalled();
    expect(fakeStore.dispatch).toHaveBeenCalledWith(
      generalActions.storeLoginError(LoginError.NO_INFO)
    );
  });

  it("does not disable masking when running on Juju", async () => {
    const disableControllerUUIDMasking = jest.spyOn(
      jujuModule,
      "disableControllerUUIDMasking"
    );
    conn.facades.modelManager.listModels.mockResolvedValue({
      "user-models": [],
    });
    jest.spyOn(jujuModule, "loginWithBakery").mockImplementation(async () => ({
      conn,
      intervalId,
      juju,
    }));
    await runMiddleware();
    expect(next).not.toHaveBeenCalled();
    expect(disableControllerUUIDMasking).not.toHaveBeenCalled();
  });

  it("disables masking when using JIMM", async () => {
    const disableControllerUUIDMasking = jest.spyOn(
      jujuModule,
      "disableControllerUUIDMasking"
    );
    conn.facades.modelManager.listModels.mockResolvedValue({
      "user-models": [],
    });
    jest.spyOn(jujuModule, "loginWithBakery").mockImplementation(async () => ({
      conn,
      intervalId,
      juju,
    }));
    await runMiddleware({
      payload: {
        controllers,
        isJuju: false,
      },
    });
    expect(next).not.toHaveBeenCalled();
    expect(disableControllerUUIDMasking).toHaveBeenCalledWith(conn);
  });

  it("fails silently if the user is not authorised to disable masking", async () => {
    jest
      .spyOn(jujuModule, "disableControllerUUIDMasking")
      .mockImplementation(() => Promise.reject());
    conn.facades.modelManager.listModels.mockResolvedValue({
      "user-models": [],
    });
    jest.spyOn(jujuModule, "loginWithBakery").mockImplementation(async () => ({
      conn,
      intervalId,
      juju,
    }));
    await runMiddleware();
    expect(next).not.toHaveBeenCalled();
  });

  it("fetches and updates models if logged in to controller", async () => {
    jest.spyOn(fakeStore, "getState").mockReturnValue(storeState);
    const fetchAllModelStatuses = jest.spyOn(
      jujuModule,
      "fetchAllModelStatuses"
    );
    jest.spyOn(jujuModule, "loginWithBakery").mockImplementation(async () => ({
      conn,
      intervalId,
      juju,
    }));
    await runMiddleware();
    // For some reason the listModels call doesn't resolve before the test
    // finishes so force the test to wait for the next process:
    await new Promise(jest.requireActual("timers").setImmediate);
    expect(next).not.toHaveBeenCalled();
    expect(fakeStore.dispatch).toHaveBeenCalledWith(
      jujuActions.updateModelList({
        models: { "user-models": models },
        wsControllerURL,
      })
    );
    expect(fetchAllModelStatuses).toHaveBeenCalledWith(
      wsControllerURL,
      ["abc123"],
      conn,
      fakeStore.dispatch,
      fakeStore.getState
    );
  });

  it("updates models every 30 seconds", async () => {
    jest.spyOn(fakeStore, "getState").mockReturnValue(storeState);
    const fetchAllModelStatuses = jest.spyOn(
      jujuModule,
      "fetchAllModelStatuses"
    );
    jest.spyOn(jujuModule, "loginWithBakery").mockImplementation(async () => ({
      conn,
      intervalId,
      juju,
    }));
    await runMiddleware();
    // For some reason the listModels call doesn't resolve before the test
    // finishes so force the test to wait for the next process:
    await new Promise(jest.requireActual("timers").setImmediate);
    jest.advanceTimersByTime(30000);
    // Resolve the async calls again.
    await new Promise(jest.requireActual("timers").setImmediate);
    expect(next).not.toHaveBeenCalled();
    expect(fetchAllModelStatuses).toHaveBeenCalledTimes(2);
  });

  it("does not update models if the user logs out", async () => {
    jest.spyOn(fakeStore, "getState").mockReturnValue({
      ...storeState,
      general: generalStateFactory.build({
        controllerConnections: {
          [wsControllerURL]: {
            user: {},
          },
        },
      }),
    });
    const fetchAllModelStatuses = jest.spyOn(
      jujuModule,
      "fetchAllModelStatuses"
    );
    jest.spyOn(jujuModule, "loginWithBakery").mockImplementation(async () => ({
      conn,
      intervalId,
      juju,
    }));
    await runMiddleware();
    // For some reason the listModels call doesn't resolve before the test
    // finishes so force the test to wait for the next process:
    await new Promise(jest.requireActual("timers").setImmediate);
    jest.advanceTimersByTime(30000);
    // Resolve the async calls again.
    await new Promise(jest.requireActual("timers").setImmediate);
    expect(next).not.toHaveBeenCalled();
    expect(fetchAllModelStatuses).toHaveBeenCalledTimes(1);
  });

  it("handles logging out of models", async () => {
    jest.spyOn(jujuModule, "loginWithBakery").mockImplementation(async () => ({
      conn,
      intervalId,
      juju,
    }));
    const middleware = await runMiddleware();
    const action = {
      type: appThunks.logOut.pending.type,
      payload: null,
    };
    await middleware(next)(action);
    expect(juju.logout).toHaveBeenCalled();
    // The action should be passed along to the reducers.
    expect(next).toHaveBeenCalled();
  });

  it("handles updating permissions", async () => {
    jest.spyOn(jujuModule, "loginWithBakery").mockImplementation(async () => ({
      conn,
      intervalId,
      juju,
    }));
    jest
      .spyOn(jujuModule, "setModelSharingPermissions")
      .mockImplementation(() => Promise.resolve({ results: [] }));
    const middleware = await runMiddleware();
    const action = appActions.updatePermissions({
      action: "grant",
      modelUUID: "abc123",
      permissionFrom: "read",
      permissionTo: "write",
      user: "admin",
      wsControllerURL: "wss://example.com",
    });
    const response = middleware(next)(action);
    expect(jujuModule.setModelSharingPermissions).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
    return expect(response).resolves.toStrictEqual({ results: [] });
  });
});
