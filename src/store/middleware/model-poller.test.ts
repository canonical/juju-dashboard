import type { Client, Connection, Transport } from "@canonical/jujulib";
import type { UnknownAction, MiddlewareAPI } from "redux";
import type { Mock } from "vitest";
import { vi } from "vitest";

import * as jujuModule from "juju/api";
import type { RelationshipTuple } from "juju/jimm/JIMMV4";
import { actions as appActions, thunks as appThunks } from "store/app";
import type { ControllerArgs } from "store/app/actions";
import { actions as generalActions } from "store/general";
import { AuthMethod } from "store/general/types";
import { actions as jujuActions } from "store/juju";
import { rootStateFactory } from "testing/factories";
import { generalStateFactory } from "testing/factories/general";
import { auditEventFactory } from "testing/factories/juju/jimm";
import {
  controllerFactory,
  jujuStateFactory,
} from "testing/factories/juju/juju";

import {
  AuditLogsError,
  LoginError,
  ModelsError,
  modelPollerMiddleware,
} from "./model-poller";

vi.mock("juju/api", () => ({
  disableControllerUUIDMasking: vi
    .fn()
    .mockImplementation(async () => await Promise.resolve()),
  fetchControllerList: vi
    .fn()
    .mockImplementation(async () => await Promise.resolve()),
  loginWithBakery: vi.fn(),
  fetchAllModelStatuses: vi.fn(),
  setModelSharingPermissions: vi.fn(),
  findAuditEvents: vi.fn(),
  crossModelQuery: vi.fn(),
}));

describe("model poller", () => {
  let fakeStore: MiddlewareAPI;
  let next: Mock;
  const originalLog = console.log;
  const wsControllerURL = "wss://example.com";
  const controllers: ControllerArgs[] = [
    [
      wsControllerURL,
      { user: "eggman@external", password: "test" },
      AuthMethod.LOCAL,
    ],
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
  const consoleError = console.error;

  beforeEach(() => {
    vi.useFakeTimers();
    next = vi.fn();
    fakeStore = {
      getState: vi.fn(() => ({
        juju: jujuStateFactory.build(),
      })),
      dispatch: vi.fn(),
    };
    conn = {
      facades: {
        modelManager: {
          listModels: vi.fn().mockResolvedValue({ "user-models": models }),
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
      logout: vi.fn(),
    } as unknown as Client;
    console.error = vi.fn();
  });

  afterEach(() => {
    console.error = consoleError;
  });

  const runMiddleware = async (actionOverrides?: Partial<UnknownAction>) => {
    const action = {
      ...appActions.connectAndPollControllers({
        controllers,
        isJuju: true,
        // Turn off polling to prevent the middleware running indefinitely.
        poll: 0,
      }),
      ...(actionOverrides ?? {}),
    };
    const middleware = modelPollerMiddleware(fakeStore);
    await middleware(next)(action);
    return middleware;
  };

  afterEach(() => {
    console.log = originalLog;
    vi.restoreAllMocks();
    vi.useRealTimers();
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
    await runMiddleware({
      payload: { controllers: [], isJuju: true, poll: 0 },
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("dispatches login errors", async () => {
    vi.spyOn(jujuModule, "loginWithBakery").mockImplementation(async () => ({
      error: "Uh oh!",
    }));
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
    vi.spyOn(console, "log").mockImplementation(() => vi.fn());
    vi.spyOn(jujuModule, "loginWithBakery").mockImplementation(async () => {
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
        AuthMethod.LOCAL,
      ],
    );
  });

  it("fetches and stores data", async () => {
    const fetchControllerList = vi.spyOn(jujuModule, "fetchControllerList");
    conn.facades.modelManager.listModels.mockResolvedValue({
      "user-models": [],
    });
    vi.spyOn(jujuModule, "loginWithBakery").mockImplementation(async () => ({
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
      fakeStore.dispatch,
      fakeStore.getState,
    );
  });

  it("disables the controller features if JIMM < 4", async () => {
    conn.facades.modelManager.listModels.mockResolvedValue({
      "user-models": [],
    });
    conn.facades.jimM = {
      checkRelation: vi.fn().mockImplementation(async () => ({
        allowed: true,
      })),
      version: 3,
    };
    vi.spyOn(jujuModule, "loginWithBakery").mockImplementation(async () => ({
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
      checkRelation: vi.fn().mockImplementation(async () => ({
        allowed: true,
      })),
      version: 4,
    };
    vi.spyOn(jujuModule, "loginWithBakery").mockImplementation(async () => ({
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
      checkRelation: vi
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
    vi.spyOn(jujuModule, "loginWithBakery").mockImplementation(async () => ({
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
      checkRelation: vi
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
    vi.spyOn(jujuModule, "loginWithBakery").mockImplementation(async () => ({
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
    vi.spyOn(jujuModule, "loginWithBakery").mockImplementation(async () => ({
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
    const disableControllerUUIDMasking = vi.spyOn(
      jujuModule,
      "disableControllerUUIDMasking",
    );
    conn.facades.modelManager.listModels.mockResolvedValue({
      "user-models": [],
    });
    vi.spyOn(jujuModule, "loginWithBakery").mockImplementation(async () => ({
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
      [
        wsControllerURL,
        { user: "eggman@external", password: "test" },
        AuthMethod.CANDID,
      ],
    ];
    const disableControllerUUIDMasking = vi.spyOn(
      jujuModule,
      "disableControllerUUIDMasking",
    );
    conn.facades.modelManager.listModels.mockResolvedValue({
      "user-models": [],
    });
    vi.spyOn(jujuModule, "loginWithBakery").mockImplementation(async () => ({
      conn,
      intervalId,
      juju,
    }));
    await runMiddleware({
      payload: {
        controllers,
        isJuju: false,
        poll: 0,
      },
    });
    expect(next).not.toHaveBeenCalled();
    expect(disableControllerUUIDMasking).toHaveBeenCalledWith(conn);
  });

  it("fails silently if the user is not authorised to disable masking", async () => {
    vi.spyOn(jujuModule, "disableControllerUUIDMasking").mockImplementation(
      () => Promise.reject(new Error()),
    );
    conn.facades.modelManager.listModels.mockResolvedValue({
      "user-models": [],
    });
    vi.spyOn(jujuModule, "loginWithBakery").mockImplementation(async () => ({
      conn,
      intervalId,
      juju,
    }));
    await runMiddleware();
    expect(next).not.toHaveBeenCalled();
  });

  it("fetches and updates models if logged in to controller", async () => {
    vi.spyOn(fakeStore, "getState").mockReturnValue(storeState);
    const fetchAllModelStatuses = vi.spyOn(jujuModule, "fetchAllModelStatuses");
    vi.spyOn(jujuModule, "loginWithBakery").mockImplementation(async () => ({
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

  it("should remove models error from state if no error occurs", async () => {
    vi.spyOn(fakeStore, "getState").mockReturnValue({
      ...storeState,
      juju: jujuStateFactory.build({
        controllers: {
          [wsControllerURL]: [controllerFactory.build()],
        },
        modelsError: "Oops!",
      }),
    });
    vi.spyOn(jujuModule, "loginWithBakery").mockImplementation(async () => ({
      conn,
      intervalId,
      juju,
    }));
    await runMiddleware();
    expect(fakeStore.dispatch).toHaveBeenCalledWith(
      jujuActions.updateModelsError({
        modelsError: null,
        wsControllerURL,
      }),
    );
  });

  it("should display error when unable to load all models", async () => {
    vi.spyOn(fakeStore, "getState").mockReturnValue(storeState);
    vi.spyOn(jujuModule, "loginWithBakery").mockImplementation(async () => ({
      conn,
      intervalId,
      juju,
    }));
    vi.spyOn(jujuModule, "fetchAllModelStatuses").mockRejectedValue(
      new Error(ModelsError.LOAD_ALL_MODELS),
    );
    await runMiddleware();
    expect(console.error).toHaveBeenCalledWith(
      ModelsError.LOAD_ALL_MODELS,
      new Error(ModelsError.LOAD_ALL_MODELS),
    );
    expect(fakeStore.dispatch).toHaveBeenCalledWith(
      jujuActions.updateModelsError({
        modelsError: ModelsError.LOAD_ALL_MODELS,
        wsControllerURL,
      }),
    );
  });

  it("should display error when unable to load some models", async () => {
    vi.spyOn(fakeStore, "getState").mockReturnValue(storeState);
    vi.spyOn(jujuModule, "loginWithBakery").mockImplementation(async () => ({
      conn,
      intervalId,
      juju,
    }));
    vi.spyOn(jujuModule, "fetchAllModelStatuses").mockRejectedValue(
      new Error(ModelsError.LOAD_SOME_MODELS),
    );
    await runMiddleware();
    expect(console.error).toHaveBeenCalledWith(
      ModelsError.LOAD_SOME_MODELS,
      new Error(ModelsError.LOAD_SOME_MODELS),
    );
    expect(fakeStore.dispatch).toHaveBeenCalledWith(
      jujuActions.updateModelsError({
        modelsError: ModelsError.LOAD_SOME_MODELS,
        wsControllerURL,
      }),
    );
  });

  it("should display error when unable to load latest models", async () => {
    vi.spyOn(fakeStore, "getState").mockReturnValue(storeState);
    vi.spyOn(jujuModule, "loginWithBakery").mockImplementation(async () => ({
      conn,
      intervalId,
      juju,
    }));
    vi.spyOn(jujuModule, "fetchAllModelStatuses")
      .mockImplementationOnce(
        async () => new Promise<void>((resolve) => resolve()),
      )
      .mockImplementationOnce(
        async () =>
          new Promise<void>((resolve, reject) =>
            reject(new Error(ModelsError.LOAD_SOME_MODELS)),
          ),
      );
    runMiddleware({
      payload: { controllers, isJuju: true, poll: 1 },
    }).catch(console.error);
    vi.advanceTimersByTime(30000);
    // Resolve the async calls again.
    await vi.runAllTimersAsync();
    expect(console.error).toHaveBeenCalledWith(
      ModelsError.LOAD_LATEST_MODELS,
      new Error(ModelsError.LOAD_SOME_MODELS),
    );
    expect(fakeStore.dispatch).toHaveBeenCalledWith(
      jujuActions.updateModelsError({
        modelsError: ModelsError.LOAD_LATEST_MODELS,
        wsControllerURL,
      }),
    );
  });

  it("should display error when unable to update model list", async () => {
    vi.spyOn(fakeStore, "getState").mockReturnValue(storeState);
    vi.spyOn(jujuModule, "loginWithBakery").mockImplementation(async () => ({
      conn,
      intervalId,
      juju,
    }));
    vi.spyOn(jujuActions, "updateModelList").mockImplementation(
      vi.fn(() => {
        throw new Error(ModelsError.LIST_OR_UPDATE_MODELS);
      }),
    );
    await runMiddleware();
    expect(console.error).toHaveBeenCalledWith(
      ModelsError.LIST_OR_UPDATE_MODELS,
      new Error(ModelsError.LIST_OR_UPDATE_MODELS),
    );
    expect(fakeStore.dispatch).toHaveBeenCalledWith(
      jujuActions.updateModelsError({
        modelsError: ModelsError.LIST_OR_UPDATE_MODELS,
        wsControllerURL,
      }),
    );
  });

  it("updates models every 30 seconds", async () => {
    vi.spyOn(fakeStore, "getState").mockReturnValue(storeState);
    const fetchAllModelStatuses = vi.spyOn(jujuModule, "fetchAllModelStatuses");
    vi.spyOn(jujuModule, "loginWithBakery").mockImplementation(async () => ({
      conn,
      intervalId,
      juju,
    }));
    runMiddleware({ payload: { controllers, isJuju: true, poll: 1 } }).catch(
      console.error,
    );
    vi.advanceTimersByTime(30000);
    // Resolve the async calls again.
    await vi.runAllTimersAsync();
    expect(next).not.toHaveBeenCalled();
    expect(fetchAllModelStatuses).toHaveBeenCalledTimes(2);
  });

  it("does not update models if the user logs out", async () => {
    vi.spyOn(fakeStore, "getState").mockReturnValue({
      ...storeState,
      general: generalStateFactory.build({
        controllerConnections: {
          [wsControllerURL]: {
            user: {},
          },
        },
      }),
    });
    const fetchAllModelStatuses = vi.spyOn(jujuModule, "fetchAllModelStatuses");
    vi.spyOn(jujuModule, "loginWithBakery").mockImplementation(async () => ({
      conn,
      intervalId,
      juju,
    }));
    await runMiddleware();
    vi.advanceTimersByTime(30000);
    // Resolve the async calls again.
    expect(next).not.toHaveBeenCalled();
    expect(fetchAllModelStatuses).toHaveBeenCalledTimes(1);
  });

  it("handles logging out of models", async () => {
    vi.spyOn(jujuModule, "loginWithBakery").mockImplementation(async () => ({
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
    vi.spyOn(jujuModule, "loginWithBakery").mockImplementation(async () => ({
      conn,
      intervalId,
      juju,
    }));
    vi.spyOn(jujuModule, "setModelSharingPermissions").mockImplementation(() =>
      Promise.resolve({ results: [] }),
    );
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
    vi.spyOn(jujuModule, "loginWithBakery").mockImplementation(async () => ({
      conn,
      intervalId,
      juju,
    }));
    vi.spyOn(jujuModule, "findAuditEvents").mockImplementation(() =>
      Promise.resolve(events),
    );
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
    vi.spyOn(jujuModule, "loginWithBakery").mockImplementation(async () => ({
      conn,
      intervalId,
      juju,
    }));
    vi.spyOn(jujuModule, "findAuditEvents").mockImplementation(() =>
      Promise.resolve(events),
    );
    const middleware = await runMiddleware();
    const action = jujuActions.fetchAuditEvents({
      "user-tag": "user-eggman@external",
      wsControllerURL: "nothing",
    });
    await middleware(next)(action);
    expect(jujuModule.findAuditEvents).not.toHaveBeenCalled();
  });

  it("should handle Audit Logs user permission error", async () => {
    conn.facades.jimM = {
      checkRelation: vi.fn().mockRejectedValue(new Error("Oops!")),
      version: 4,
    };
    vi.spyOn(jujuModule, "loginWithBakery").mockImplementation(async () => ({
      conn,
      intervalId,
      juju,
    }));
    await runMiddleware();
    expect(fakeStore.dispatch).toHaveBeenCalledWith(
      jujuActions.updateAuditEventsErrors(AuditLogsError.CHECK_PERMISSIONS),
    );
    expect(console.error).toHaveBeenCalledWith(
      AuditLogsError.CHECK_PERMISSIONS,
      new Error("Oops!"),
    );
  });

  it("should handle Audit Logs error", async () => {
    vi.spyOn(jujuModule, "loginWithBakery").mockImplementation(async () => ({
      conn,
      intervalId,
      juju,
    }));
    vi.spyOn(jujuModule, "findAuditEvents").mockImplementation(() =>
      Promise.reject(new Error("Uh oh!")),
    );
    const middleware = await runMiddleware();
    const action = jujuActions.fetchAuditEvents({
      "user-tag": "user-eggman@external",
      wsControllerURL: "wss://example.com",
    });
    await middleware(next)(action);
    expect(fakeStore.dispatch).toHaveBeenCalledWith(
      jujuActions.updateAuditEventsErrors("Uh oh!"),
    );
    expect(console.error).toHaveBeenCalledWith(
      "Could not fetch audit events.",
      new Error("Uh oh!"),
    );
  });

  it("handles fetching cross model query results", async () => {
    const crossModelQueryResponse = { results: {}, errors: {} };
    vi.spyOn(jujuModule, "loginWithBakery").mockImplementation(async () => ({
      conn,
      intervalId,
      juju,
    }));
    vi.spyOn(jujuModule, "crossModelQuery").mockImplementation(() =>
      Promise.resolve(crossModelQueryResponse),
    );
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
      jujuActions.updateCrossModelQueryResults(crossModelQueryResponse.results),
    );
  });

  it("handles no controller when fetching cross model query results", async () => {
    const crossModelQueryResponse = { results: {}, errors: {} };
    vi.spyOn(jujuModule, "loginWithBakery").mockImplementation(async () => ({
      conn,
      intervalId,
      juju,
    }));
    vi.spyOn(jujuModule, "crossModelQuery").mockImplementation(() =>
      Promise.resolve(crossModelQueryResponse),
    );
    const middleware = await runMiddleware();
    const action = jujuActions.fetchCrossModelQuery({
      wsControllerURL: "nothing",
      query: ".",
    });
    await middleware(next)(action);
    expect(jujuModule.crossModelQuery).not.toHaveBeenCalled();
  });

  it("handles errors object from response when fetching cross model query results", async () => {
    const crossModelQueryResponse = {
      results: {},
      errors: { error1: ["Uh oh!"] },
    };
    vi.spyOn(jujuModule, "loginWithBakery").mockImplementation(async () => ({
      conn,
      intervalId,
      juju,
    }));
    vi.spyOn(jujuModule, "crossModelQuery").mockImplementation(() =>
      Promise.resolve(crossModelQueryResponse),
    );
    const middleware = await runMiddleware();
    const action = jujuActions.fetchCrossModelQuery({
      wsControllerURL: "wss://example.com",
      query: ".",
    });
    await middleware(next)(action);
    expect(fakeStore.dispatch).toHaveBeenCalledWith(
      jujuActions.updateCrossModelQueryErrors(crossModelQueryResponse.errors),
    );
  });

  it("handles errors when fetching cross model query results", async () => {
    vi.spyOn(jujuModule, "loginWithBakery").mockImplementation(async () => ({
      conn,
      intervalId,
      juju,
    }));
    vi.spyOn(jujuModule, "crossModelQuery").mockImplementation(() =>
      Promise.reject(new Error("Uh oh!")),
    );
    const middleware = await runMiddleware();
    const action = jujuActions.fetchCrossModelQuery({
      wsControllerURL: "wss://example.com",
      query: ".",
    });
    await middleware(next)(action);
    expect(console.error).toHaveBeenCalledWith(
      "Could not perform cross model query.",
      new Error("Uh oh!"),
    );
    expect(fakeStore.dispatch).toHaveBeenCalledWith(
      jujuActions.updateCrossModelQueryErrors("Uh oh!"),
    );
  });

  it("handles non-standard errors when fetching cross model query results", async () => {
    vi.spyOn(jujuModule, "loginWithBakery").mockImplementation(async () => ({
      conn,
      intervalId,
      juju,
    }));
    vi.spyOn(jujuModule, "crossModelQuery")
      // eslint-disable-next-line prefer-promise-reject-errors
      .mockImplementation(() => Promise.reject("Uh oh!"));
    const middleware = await runMiddleware();
    const action = jujuActions.fetchCrossModelQuery({
      wsControllerURL: "wss://example.com",
      query: ".",
    });
    await middleware(next)(action);
    expect(console.error).toHaveBeenCalledWith(
      "Could not perform cross model query.",
      "Uh oh!",
    );
    expect(fakeStore.dispatch).toHaveBeenCalledWith(
      jujuActions.updateCrossModelQueryErrors(
        "Unable to perform search. Please try again later.",
      ),
    );
  });
});
