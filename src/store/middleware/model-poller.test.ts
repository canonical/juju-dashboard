import type { Client, Connection, Transport } from "@canonical/jujulib";
import type { UnknownAction, MiddlewareAPI } from "redux";
import type { Mock, MockInstance } from "vitest";
import { vi } from "vitest";

import { Auth, LocalAuth, OIDCAuth } from "auth";
import * as jujuModule from "juju/api";
import * as jimmModule from "juju/jimm/api";
import { pollWhoamiStart } from "juju/jimm/listeners";
import { Label } from "juju/types";
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
  relationshipTupleFactory,
} from "testing/factories/juju/juju";

import { LoginError, ModelsError, modelPollerMiddleware } from "./model-poller";

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
}));

vi.mock("juju/jimm/api", () => ({
  checkRelation: vi.fn(),
  crossModelQuery: vi.fn(),
  findAuditEvents: vi.fn(),
}));

describe("model poller", () => {
  let fakeStore: MiddlewareAPI;
  let next: Mock;
  const wsControllerURL = "wss://example.com";
  const controllers: ControllerArgs[] = [
    [wsControllerURL, { user: "eggman@external", password: "test" }],
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
    vi.clearAllMocks();
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
    // Instantiate local auth by default.
    new LocalAuth(fakeStore.dispatch);
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
    vi.restoreAllMocks();
    localStorage.clear();
    vi.useRealTimers();
    // @ts-expect-error - Resetting singleton for each test run.
    delete Auth.instance;
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
      error: Label.CONTROLLER_LOGIN_ERROR,
    }));
    await runMiddleware();
    expect(next).not.toHaveBeenCalled();
    expect(fakeStore.dispatch).toHaveBeenCalledWith(
      generalActions.storeLoginError({
        wsControllerURL: "wss://example.com",
        error: Label.CONTROLLER_LOGIN_ERROR,
      }),
    );
  });

  it("stops loading with unhandled bakery error", async () => {
    vi.spyOn(jujuModule, "loginWithBakery").mockRejectedValue(
      new Error("some error"),
    );
    await runMiddleware();
    expect(next).not.toHaveBeenCalled();
    expect(fakeStore.dispatch).toHaveBeenCalledWith(
      generalActions.updateLoginLoading(true),
    );
    expect(fakeStore.dispatch).toHaveBeenCalledWith(
      generalActions.updateLoginLoading(false),
    );
  });

  describe("using OIDC", () => {
    let dispatchMock: MockInstance;

    beforeEach(() => {
      vi.spyOn(fakeStore, "getState").mockReturnValue(storeState);
      dispatchMock = vi.spyOn(fakeStore, "dispatch");

      new OIDCAuth(fakeStore.dispatch);
    });

    it("stops when not logged in", async () => {
      dispatchMock.mockReturnValue({ type: "whoami" });
      const loginWithBakerySpy = vi.spyOn(jujuModule, "loginWithBakery");
      await runMiddleware(
        appActions.connectAndPollControllers({
          controllers: [[wsControllerURL, undefined]],
          isJuju: true,
          poll: 0,
        }),
      );
      expect(dispatchMock).toHaveBeenCalledWith(
        generalActions.updateLoginLoading(true),
      );
      expect(loginWithBakerySpy).not.toHaveBeenCalled();
      expect(dispatchMock).toHaveBeenCalledWith(
        generalActions.updateLoginLoading(false),
      );
    });

    it("continues when logged in", async () => {
      dispatchMock.mockReturnValue({
        type: "whoami",
        payload: { user: "user-test@external" },
      });
      const loginWithBakerySpy = vi
        .spyOn(jujuModule, "loginWithBakery")
        .mockImplementation(async () => ({
          conn,
          intervalId,
          juju,
        }));
      await runMiddleware(
        appActions.connectAndPollControllers({
          controllers: [[wsControllerURL, undefined]],
          isJuju: true,
          poll: 0,
        }),
      );
      expect(fakeStore.dispatch).toHaveBeenCalledWith(pollWhoamiStart());
      expect(loginWithBakerySpy).toHaveBeenCalled();
    });

    it("stops loading if connection cancelled", async () => {
      const beforeControllerConnectMock = vi
        .spyOn(Auth.instance, "beforeControllerConnect")
        .mockResolvedValue(false);
      await runMiddleware(
        appActions.connectAndPollControllers({
          controllers: [[wsControllerURL, undefined]],
          isJuju: true,
          poll: 0,
        }),
      );
      expect(dispatchMock).toHaveBeenCalledWith(
        generalActions.updateLoginLoading(true),
      );
      expect(beforeControllerConnectMock).toHaveBeenCalledOnce();
      expect(dispatchMock).toHaveBeenCalledWith(
        generalActions.updateLoginLoading(false),
      );
    });
  });

  it("fetches and stores data", async () => {
    const fetchControllerList = vi.spyOn(jujuModule, "fetchControllerList");
    const beforeControllerConnect = vi.spyOn(
      LocalAuth.prototype,
      "beforeControllerConnect",
    );
    const afterControllerListFetchedSpy = vi.spyOn(
      LocalAuth.prototype,
      "afterControllerListFetched",
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
    expect(beforeControllerConnect).toHaveBeenCalledOnce();
    expect(afterControllerListFetchedSpy).toHaveBeenCalledOnce();
  });

  it("disables the controller features if JIMM < 4", async () => {
    localStorage.setItem("flags", JSON.stringify(["rebac"]));
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
          rebac: false,
        },
      }),
    );
  });

  it("disables rebac features if JIMM >= 4 but feature flag is disabled", async () => {
    localStorage.setItem("flags", JSON.stringify([]));
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
          rebac: false,
        },
      }),
    );
  });

  it("updates the controller features if JIMM >= 4 and feature flag enabled", async () => {
    localStorage.setItem("flags", JSON.stringify(["rebac"]));
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
          rebac: true,
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
    }).catch(() => vi.fn());
    vi.advanceTimersByTime(30000);
    // Resolve the async calls again.
    await vi.runAllTimersAsync();
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
      () => vi.fn(),
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
    vi.spyOn(jimmModule, "findAuditEvents").mockImplementation(() =>
      Promise.resolve(events),
    );
    const middleware = await runMiddleware();
    const action = jujuActions.fetchAuditEvents({
      "user-tag": "user-eggman@external",
      wsControllerURL: "wss://example.com",
    });
    await middleware(next)(action);
    expect(jimmModule.findAuditEvents).toHaveBeenCalledWith(
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
    vi.spyOn(jimmModule, "findAuditEvents").mockImplementation(() =>
      Promise.resolve(events),
    );
    const middleware = await runMiddleware();
    const action = jujuActions.fetchAuditEvents({
      "user-tag": "user-eggman@external",
      wsControllerURL: "nothing",
    });
    await middleware(next)(action);
    expect(jimmModule.findAuditEvents).not.toHaveBeenCalled();
  });

  it("should handle Audit Logs error", async () => {
    vi.spyOn(jujuModule, "loginWithBakery").mockImplementation(async () => ({
      conn,
      intervalId,
      juju,
    }));
    vi.spyOn(jimmModule, "findAuditEvents").mockImplementation(() =>
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
  });

  it("handles fetching cross model query results", async () => {
    const crossModelQueryResponse = { results: {}, errors: {} };
    vi.spyOn(jujuModule, "loginWithBakery").mockImplementation(async () => ({
      conn,
      intervalId,
      juju,
    }));
    vi.spyOn(jimmModule, "crossModelQuery").mockImplementation(() =>
      Promise.resolve(crossModelQueryResponse),
    );
    const middleware = await runMiddleware();
    const action = jujuActions.fetchCrossModelQuery({
      wsControllerURL: "wss://example.com",
      query: ".",
    });
    await middleware(next)(action);
    expect(jimmModule.crossModelQuery).toHaveBeenCalledWith(
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
    vi.spyOn(jimmModule, "crossModelQuery").mockImplementation(() =>
      Promise.resolve(crossModelQueryResponse),
    );
    const middleware = await runMiddleware();
    const action = jujuActions.fetchCrossModelQuery({
      wsControllerURL: "nothing",
      query: ".",
    });
    await middleware(next)(action);
    expect(jimmModule.crossModelQuery).not.toHaveBeenCalled();
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
    vi.spyOn(jimmModule, "crossModelQuery").mockImplementation(() =>
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
    vi.spyOn(jimmModule, "crossModelQuery").mockImplementation(() =>
      Promise.reject(new Error("Uh oh!")),
    );
    const middleware = await runMiddleware();
    const action = jujuActions.fetchCrossModelQuery({
      wsControllerURL: "wss://example.com",
      query: ".",
    });
    await middleware(next)(action);
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
    vi.spyOn(jimmModule, "crossModelQuery")
      // eslint-disable-next-line prefer-promise-reject-errors
      .mockImplementation(() => Promise.reject("Uh oh!"));
    const middleware = await runMiddleware();
    const action = jujuActions.fetchCrossModelQuery({
      wsControllerURL: "wss://example.com",
      query: ".",
    });
    await middleware(next)(action);
    expect(fakeStore.dispatch).toHaveBeenCalledWith(
      jujuActions.updateCrossModelQueryErrors(
        "Unable to perform search. Please try again later.",
      ),
    );
  });

  it("handles checking relations", async () => {
    const tuple = relationshipTupleFactory.build();
    const checkRelationResponse = { allowed: true };
    vi.spyOn(jujuModule, "loginWithBakery").mockImplementation(async () => ({
      conn,
      intervalId,
      juju,
    }));
    vi.spyOn(jimmModule, "checkRelation").mockImplementation(() =>
      Promise.resolve(checkRelationResponse),
    );
    const middleware = await runMiddleware();
    const action = jujuActions.checkRelation({
      wsControllerURL: "wss://example.com",
      tuple,
    });
    await middleware(next)(action);
    expect(jimmModule.checkRelation).toHaveBeenCalledWith(
      expect.any(Object),
      tuple,
    );
    expect(next).toHaveBeenCalledWith(action);
    expect(fakeStore.dispatch).toHaveBeenCalledWith(
      jujuActions.addCheckRelation({ tuple, allowed: true }),
    );
  });

  it("handles no controller when checking relations", async () => {
    const tuple = relationshipTupleFactory.build();
    const checkRelationResponse = { allowed: true };
    vi.spyOn(jujuModule, "loginWithBakery").mockImplementation(async () => ({
      conn,
      intervalId,
      juju,
    }));
    vi.spyOn(jimmModule, "checkRelation").mockImplementation(() =>
      Promise.resolve(checkRelationResponse),
    );
    const middleware = await runMiddleware();
    const action = jujuActions.checkRelation({
      wsControllerURL: "nothing",
      tuple,
    });
    await middleware(next)(action);
    expect(jimmModule.checkRelation).not.toHaveBeenCalled();
  });

  it("handles errors from response when checking relations", async () => {
    const tuple = relationshipTupleFactory.build();
    const checkRelationResponse = {
      error: "target not found",
    };
    vi.spyOn(jujuModule, "loginWithBakery").mockImplementation(async () => ({
      conn,
      intervalId,
      juju,
    }));
    vi.spyOn(jimmModule, "checkRelation").mockImplementation(() =>
      Promise.resolve(checkRelationResponse),
    );
    const middleware = await runMiddleware();
    const action = jujuActions.checkRelation({
      wsControllerURL: "wss://example.com",
      tuple,
    });
    await middleware(next)(action);
    expect(fakeStore.dispatch).toHaveBeenCalledWith(
      jujuActions.addCheckRelationErrors({
        tuple,
        errors: checkRelationResponse.error,
      }),
    );
  });

  it("handles non-standard errors when checking relations", async () => {
    const tuple = relationshipTupleFactory.build();
    vi.spyOn(jujuModule, "loginWithBakery").mockImplementation(async () => ({
      conn,
      intervalId,
      juju,
    }));
    vi.spyOn(jimmModule, "checkRelation")
      // eslint-disable-next-line prefer-promise-reject-errors
      .mockImplementation(() => Promise.reject("Uh oh!"));
    const middleware = await runMiddleware();
    const action = jujuActions.checkRelation({
      wsControllerURL: "wss://example.com",
      tuple,
    });
    await middleware(next)(action);
    expect(fakeStore.dispatch).toHaveBeenCalledWith(
      jujuActions.addCheckRelationErrors({
        tuple,
        errors: "Could not check permissions.",
      }),
    );
  });
});
