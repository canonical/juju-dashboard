import type { Client, Connection, Transport } from "@canonical/jujulib";
import type { AnyAction, MiddlewareAPI } from "redux";

import * as jujuModule from "juju/api";
import type { RelationshipTuple } from "juju/jimm/JIMMV4";
import { actions as appActions, thunks as appThunks } from "store/app";
import type { ControllerArgs } from "store/app/actions";
import { actions as generalActions } from "store/general";
import { actions as jujuActions } from "store/juju";
import { rootStateFactory } from "testing/factories";
import { generalStateFactory } from "testing/factories/general";
import { auditEventFactory } from "testing/factories/juju/jimm";
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
  findAuditEvents: jest.fn(),
  crossModelQuery: jest.fn(),
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
          identity: "user-eggman",
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
    // For some reason the async functions don't finish when using fake timers, so
    // force the test to wait for the next process:
    await new Promise(jest.requireActual("timers").setImmediate);
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
      generalActions.storeLoginError({
        wsControllerURL: "wss://example.com",
        error: "Uh oh!",
      }),
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
      ],
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
      generalActions.clearVisitURLs(),
    );
    expect(fakeStore.dispatch).toHaveBeenCalledWith(
      generalActions.updateControllerConnection({
        wsControllerURL,
        info: conn.info,
      }),
    );
    expect(fakeStore.dispatch).toHaveBeenCalledWith(
      generalActions.updatePingerIntervalId({ wsControllerURL, intervalId }),
    );
    expect(fetchControllerList).toHaveBeenCalledWith(
      wsControllerURL,
      conn,
      false,
      fakeStore.dispatch,
      fakeStore.getState,
    );
  });

  it("disables the controller features if JIMM < 4", async () => {
    conn.facades.modelManager.listModels.mockResolvedValue({
      "user-models": [],
    });
    conn.facades.jimM = {
      checkRelation: jest.fn().mockImplementation(async () => ({
        allowed: true,
      })),
      version: 3,
    };
    jest.spyOn(jujuModule, "loginWithBakery").mockImplementation(async () => ({
      conn,
      intervalId,
      juju,
    }));
    await runMiddleware();
    expect(next).not.toHaveBeenCalled();
    expect(fakeStore.dispatch).toHaveBeenCalledWith(
      generalActions.updateControllerFeatures({
        wsControllerURL,
        features: {
          auditLogs: false,
          crossModelQueries: false,
        },
      }),
    );
  });

  it("updates the controller features if JIMM >= 4", async () => {
    conn.facades.modelManager.listModels.mockResolvedValue({
      "user-models": [],
    });
    conn.facades.jimM = {
      checkRelation: jest.fn().mockImplementation(async () => ({
        allowed: true,
      })),
      version: 4,
    };
    jest.spyOn(jujuModule, "loginWithBakery").mockImplementation(async () => ({
      conn,
      intervalId,
      juju,
    }));
    await runMiddleware();
    expect(next).not.toHaveBeenCalled();
    expect(fakeStore.dispatch).toHaveBeenCalledWith(
      generalActions.updateControllerFeatures({
        wsControllerURL,
        features: {
          auditLogs: true,
          crossModelQueries: true,
        },
      }),
    );
  });

  it("enables audit logs if the user has audit log permissions", async () => {
    conn.facades.modelManager.listModels.mockResolvedValue({
      "user-models": [],
    });
    conn.facades.jimM = {
      checkRelation: jest
        .fn()
        .mockImplementation(async (payload: RelationshipTuple) => {
          if (payload.relation === "audit_log_viewer") {
            return {
              allowed: true,
            };
          }
        }),
      version: 4,
    };
    jest.spyOn(jujuModule, "loginWithBakery").mockImplementation(async () => ({
      conn,
      intervalId,
      juju,
    }));
    await runMiddleware();
    expect(next).not.toHaveBeenCalled();
    expect(fakeStore.dispatch).toHaveBeenCalledWith(
      generalActions.updateControllerFeatures({
        wsControllerURL,
        features: {
          auditLogs: true,
          crossModelQueries: true,
        },
      }),
    );
  });

  it("enables audit logs if the user is an administrator", async () => {
    conn.facades.modelManager.listModels.mockResolvedValue({
      "user-models": [],
    });
    conn.facades.jimM = {
      checkRelation: jest
        .fn()
        .mockImplementation(async (payload: RelationshipTuple) => {
          if (payload.relation === "audit_log_viewer") {
            return {
              allowed: false,
            };
          }
          if (payload.relation === "administrator") {
            return {
              allowed: true,
            };
          }
        }),
      version: 4,
    };
    jest.spyOn(jujuModule, "loginWithBakery").mockImplementation(async () => ({
      conn,
      intervalId,
      juju,
    }));
    await runMiddleware();
    expect(next).not.toHaveBeenCalled();
    expect(fakeStore.dispatch).toHaveBeenCalledWith(
      generalActions.updateControllerFeatures({
        wsControllerURL,
        features: {
          auditLogs: true,
          crossModelQueries: true,
        },
      }),
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
      generalActions.storeLoginError({
        wsControllerURL: "wss://example.com",
        error: LoginError.NO_INFO,
      }),
    );
  });

  it("does not disable masking when running on Juju", async () => {
    const disableControllerUUIDMasking = jest.spyOn(
      jujuModule,
      "disableControllerUUIDMasking",
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
    const controllers = [
      [wsControllerURL, { user: "eggman@external", password: "test" }, true],
    ];
    const disableControllerUUIDMasking = jest.spyOn(
      jujuModule,
      "disableControllerUUIDMasking",
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
      .mockImplementation(() => Promise.reject(new Error()));
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
      "fetchAllModelStatuses",
    );
    jest.spyOn(jujuModule, "loginWithBakery").mockImplementation(async () => ({
      conn,
      intervalId,
      juju,
    }));
    await runMiddleware();
    expect(next).not.toHaveBeenCalled();
    expect(fakeStore.dispatch).toHaveBeenCalledWith(
      jujuActions.updateModelList({
        models: { "user-models": models },
        wsControllerURL,
      }),
    );
    expect(fetchAllModelStatuses).toHaveBeenCalledWith(
      wsControllerURL,
      ["abc123"],
      conn,
      fakeStore.dispatch,
      fakeStore.getState,
    );
  });

  it("updates models every 30 seconds", async () => {
    jest.spyOn(fakeStore, "getState").mockReturnValue(storeState);
    const fetchAllModelStatuses = jest.spyOn(
      jujuModule,
      "fetchAllModelStatuses",
    );
    jest.spyOn(jujuModule, "loginWithBakery").mockImplementation(async () => ({
      conn,
      intervalId,
      juju,
    }));
    await runMiddleware();
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
      "fetchAllModelStatuses",
    );
    jest.spyOn(jujuModule, "loginWithBakery").mockImplementation(async () => ({
      conn,
      intervalId,
      juju,
    }));
    await runMiddleware();
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

  it("handles fetching audit events", async () => {
    const events = { events: [auditEventFactory.build()] };
    jest.spyOn(jujuModule, "loginWithBakery").mockImplementation(async () => ({
      conn,
      intervalId,
      juju,
    }));
    jest
      .spyOn(jujuModule, "findAuditEvents")
      .mockImplementation(() => Promise.resolve(events));
    const middleware = await runMiddleware();
    const action = jujuActions.fetchAuditEvents({
      "user-tag": "user-eggman@external",
      wsControllerURL: "wss://example.com",
    });
    await middleware(next)(action);
    expect(jujuModule.findAuditEvents).toHaveBeenCalledWith(
      expect.any(Object),
      { "user-tag": "user-eggman@external" },
    );
    expect(next).toHaveBeenCalledWith(action);
    expect(fakeStore.dispatch).toHaveBeenCalledWith(
      jujuActions.updateAuditEvents(events.events),
    );
  });

  it("handles no controller when fetching audit events", async () => {
    const events = { events: [] };
    jest.spyOn(jujuModule, "loginWithBakery").mockImplementation(async () => ({
      conn,
      intervalId,
      juju,
    }));
    jest
      .spyOn(jujuModule, "findAuditEvents")
      .mockImplementation(() => Promise.resolve(events));
    const middleware = await runMiddleware();
    const action = jujuActions.fetchAuditEvents({
      "user-tag": "user-eggman@external",
      wsControllerURL: "nothing",
    });
    await middleware(next)(action);
    expect(jujuModule.findAuditEvents).not.toHaveBeenCalled();
  });

  it("handles fetching cross model query results", async () => {
    const crossModelQueryResponse = { results: {}, errors: {} };
    jest.spyOn(jujuModule, "loginWithBakery").mockImplementation(async () => ({
      conn,
      intervalId,
      juju,
    }));
    jest
      .spyOn(jujuModule, "crossModelQuery")
      .mockImplementation(() => Promise.resolve(crossModelQueryResponse));
    const middleware = await runMiddleware();
    const action = jujuActions.fetchCrossModelQuery({
      wsControllerURL: "wss://example.com",
      query: ".",
    });
    await middleware(next)(action);
    expect(jujuModule.crossModelQuery).toHaveBeenCalledWith(
      expect.any(Object),
      ".",
    );
    expect(next).toHaveBeenCalledWith(action);
    expect(fakeStore.dispatch).toHaveBeenCalledWith(
      jujuActions.updateCrossModelQuery(crossModelQueryResponse),
    );
  });

  it("handles no controller when fetching cross model query results", async () => {
    const crossModelQueryResponse = { results: {}, errors: {} };
    jest.spyOn(jujuModule, "loginWithBakery").mockImplementation(async () => ({
      conn,
      intervalId,
      juju,
    }));
    jest
      .spyOn(jujuModule, "crossModelQuery")
      .mockImplementation(() => Promise.resolve(crossModelQueryResponse));
    const middleware = await runMiddleware();
    const action = jujuActions.fetchCrossModelQuery({
      wsControllerURL: "nothing",
      query: ".",
    });
    await middleware(next)(action);
    expect(jujuModule.crossModelQuery).not.toHaveBeenCalled();
  });

  it("handles errors when fetching cross model query results", async () => {
    const consoleError = console.error;
    console.error = jest.fn();
    jest.spyOn(jujuModule, "loginWithBakery").mockImplementation(async () => ({
      conn,
      intervalId,
      juju,
    }));
    jest
      .spyOn(jujuModule, "crossModelQuery")
      .mockImplementation(() => Promise.reject(new Error("Uh oh!")));
    const middleware = await runMiddleware();
    const action = jujuActions.fetchCrossModelQuery({
      wsControllerURL: "wss://example.com",
      query: ".",
    });
    await middleware(next)(action);
    expect(console.error).toHaveBeenCalledWith(
      "Could not perform cross model query:",
      new Error("Uh oh!"),
    );
    expect(fakeStore.dispatch).toHaveBeenCalledWith(
      jujuActions.updateCrossModelQuery(
        "Unable to perform search. Please try again later.",
      ),
    );
    console.error = consoleError;
  });
});
