import type { Client, Connection, Transport } from "@canonical/jujulib";
import { waitFor } from "@testing-library/dom";
import type { UnknownAction, MiddlewareAPI, Dispatch } from "redux";
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
import type { RootState } from "store/store";
import { rootStateFactory } from "testing/factories";
import { configFactory, generalStateFactory } from "testing/factories/general";
import { auditEventFactory } from "testing/factories/juju/jimm";
import {
  controllerFactory,
  jujuStateFactory,
  modelDataInfoFactory,
  relationshipTupleFactory,
} from "testing/factories/juju/juju";

import { LoginError, ModelsError, modelPollerMiddleware } from "./model-poller";
import type { MockMiddlewareResult } from "./types";

vi.mock("juju/api", () => ({
  disableControllerUUIDMasking: vi.fn(),
  fetchControllerList: vi.fn(),
  loginWithBakery: vi.fn(),
  fetchAllModelStatuses: vi.fn(),
  fetchModelInfo: vi.fn(),
  setModelSharingPermissions: vi.fn(),
}));

vi.mock("juju/jimm/api", () => ({
  checkRelation: vi.fn(),
  crossModelQuery: vi.fn(),
  findAuditEvents: vi.fn(),
  checkRelations: vi.fn(),
}));

describe("model poller", () => {
  let fakeStore: MiddlewareAPI<Dispatch<UnknownAction>, RootState>;
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
      config: configFactory.build({
        isJuju: true,
      }),
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
      getState: vi.fn(() =>
        rootStateFactory.build({
          juju: jujuStateFactory.build(),
        }),
      ),
      dispatch: vi.fn(),
    };
    conn = {
      facades: {
        modelManager: {
          listModels: vi.fn().mockResolvedValue({ "user-models": models }),
          destroyModels: vi.fn().mockResolvedValue({}),
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

  const runMiddleware = async (
    actionOverrides?: Partial<UnknownAction>,
  ): MockMiddlewareResult => {
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
          rebac: false,
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
    vi.spyOn(fakeStore, "getState").mockReturnValue(storeState);
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
      vi.fn().mockRejectedValue(new Error()),
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
      .mockImplementationOnce(vi.fn())
      .mockRejectedValueOnce(new Error(ModelsError.LOAD_SOME_MODELS));
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
    vi.spyOn(jujuModule, "setModelSharingPermissions").mockImplementation(
      vi.fn().mockResolvedValue({ results: [] }),
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
    vi.spyOn(jimmModule, "findAuditEvents").mockImplementation(
      vi.fn().mockResolvedValue(events),
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
    vi.spyOn(jimmModule, "findAuditEvents").mockImplementation(
      vi.fn().mockResolvedValue(events),
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
    vi.spyOn(jimmModule, "findAuditEvents").mockImplementation(
      vi.fn().mockRejectedValue(new Error("Uh oh!")),
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
    vi.spyOn(jimmModule, "crossModelQuery").mockImplementation(
      vi.fn().mockResolvedValue(crossModelQueryResponse),
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
    vi.spyOn(jimmModule, "crossModelQuery").mockImplementation(
      vi.fn().mockResolvedValue(crossModelQueryResponse),
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
    vi.spyOn(jimmModule, "crossModelQuery").mockImplementation(
      vi.fn().mockResolvedValue(crossModelQueryResponse),
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
    vi.spyOn(jimmModule, "crossModelQuery").mockImplementation(
      vi.fn().mockRejectedValue(new Error("Uh oh!")),
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
    vi.spyOn(jimmModule, "crossModelQuery").mockImplementation(
      vi.fn().mockRejectedValue("Uh oh!"),
    );
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
    vi.spyOn(jimmModule, "checkRelation").mockImplementation(
      vi.fn().mockResolvedValue(checkRelationResponse),
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
    vi.spyOn(jimmModule, "checkRelation").mockImplementation(
      vi.fn().mockResolvedValue(checkRelationResponse),
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
    vi.spyOn(jimmModule, "checkRelation").mockImplementation(
      vi.fn().mockResolvedValue(checkRelationResponse),
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
    vi.spyOn(jimmModule, "checkRelation").mockImplementation(
      vi.fn().mockRejectedValue("Uh oh!"),
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
        errors: "Could not check permissions.",
      }),
    );
  });

  it("handles listing relationship tuples", async () => {
    const requestId = "12356";
    const tuples = [relationshipTupleFactory.build()];
    const checkRelationsResponse = {
      results: [{ allowed: false }, { allowed: true }],
    };
    vi.spyOn(jujuModule, "loginWithBakery").mockImplementation(async () => ({
      conn,
      intervalId,
      juju,
    }));
    vi.spyOn(jimmModule, "checkRelations").mockImplementation(
      vi.fn().mockResolvedValue(checkRelationsResponse),
    );
    const middleware = await runMiddleware();
    const action = jujuActions.checkRelations({
      wsControllerURL: "wss://example.com",
      tuples,
      requestId,
    });
    await middleware(next)(action);
    expect(jimmModule.checkRelations).toHaveBeenCalledWith(
      expect.any(Object),
      tuples,
    );
    expect(next).toHaveBeenCalledWith(action);
    expect(fakeStore.dispatch).toHaveBeenCalledWith(
      jujuActions.addCheckRelations({
        tuples,
        requestId,
        permissions: checkRelationsResponse.results,
      }),
    );
  });

  it("handles no controller when listing relationship tuples", async () => {
    const requestId = "12356";
    const tuples = [relationshipTupleFactory.build()];
    const checkRelationsResponse = {
      results: [],
    };
    vi.spyOn(jujuModule, "loginWithBakery").mockImplementation(async () => ({
      conn,
      intervalId,
      juju,
    }));
    vi.spyOn(jimmModule, "checkRelations").mockImplementation(
      vi.fn().mockResolvedValue(checkRelationsResponse),
    );
    const middleware = await runMiddleware();
    const action = jujuActions.checkRelations({
      requestId,
      wsControllerURL: "nothing",
      tuples,
    });
    await middleware(next)(action);
    expect(jimmModule.checkRelations).not.toHaveBeenCalled();
  });

  it("handles non-standard errors when listing relationship tuples", async () => {
    const requestId = "12356";
    const tuples = [relationshipTupleFactory.build()];
    vi.spyOn(jujuModule, "loginWithBakery").mockImplementation(async () => ({
      conn,
      intervalId,
      juju,
    }));
    vi.spyOn(jimmModule, "checkRelations").mockImplementation(
      vi.fn().mockRejectedValue("Uh oh!"),
    );
    const middleware = await runMiddleware();
    const action = jujuActions.checkRelations({
      requestId,
      wsControllerURL: "wss://example.com",
      tuples,
    });
    await middleware(next)(action);
    expect(fakeStore.dispatch).toHaveBeenCalledWith(
      jujuActions.addCheckRelationsErrors({
        requestId,
        tuples,
        errors: "Could not check relations.",
      }),
    );
  });

  it("handles destroy model action", async () => {
    vi.spyOn(jujuModule, "loginWithBakery").mockImplementation(async () => ({
      conn,
      intervalId,
      juju,
    }));
    const fetchModelInfo = vi
      .spyOn(jujuModule, "fetchModelInfo")
      .mockResolvedValue({
        results: [{ result: undefined }],
      });
    conn.facades.modelManager.destroyModels.mockResolvedValue({
      results: [{}],
    });
    const middleware = await runMiddleware();
    const action = jujuActions.destroyModels({
      wsControllerURL: "wss://example.com",
      models: [{ "model-tag": "model-123abc", modelUUID: "123abc" }],
    });
    await middleware(next)(action);
    expect(conn.facades.modelManager.destroyModels).toHaveBeenCalledWith({
      models: [{ "model-tag": "model-123abc", modelUUID: "123abc" }],
    });
    expect(fakeStore.dispatch).not.toHaveBeenCalledWith(
      jujuActions.destroyModelErrors({
        errors: [["model-123abc", "Error"]],
      }),
    );
    expect(fetchModelInfo).toHaveBeenCalledWith(conn, ["123abc"]);
    expect(fakeStore.dispatch).toHaveBeenCalledWith(
      jujuActions.updateModelsDestroyed({
        modelUUIDs: ["123abc"],
        wsControllerURL: "wss://example.com",
      }),
    );
  });

  it("handles no controller when destroying models", async () => {
    vi.spyOn(jujuModule, "loginWithBakery").mockImplementation(async () => ({
      conn,
      intervalId,
      juju,
    }));
    const middleware = await runMiddleware();
    const action = jujuActions.destroyModels({
      wsControllerURL: "nothing",
      models: [{ "model-tag": "model-123abc", modelUUID: "123abc" }],
    });
    await middleware(next)(action);
    expect(conn.facades.modelManager.destroyModels).not.toHaveBeenCalled();
  });

  it("handles errors from response when destroying models", async () => {
    vi.spyOn(jujuModule, "loginWithBakery").mockImplementation(async () => ({
      conn,
      intervalId,
      juju,
    }));
    conn.facades.modelManager.destroyModels.mockResolvedValue({
      results: [{ error: { code: "BOOM", message: "Error" } }],
    });
    const fetchModelInfo = vi.spyOn(jujuModule, "fetchModelInfo");
    const middleware = await runMiddleware();
    const action = jujuActions.destroyModels({
      wsControllerURL: "wss://example.com",
      models: [{ "model-tag": "model-123abc", modelUUID: "123abc" }],
    });
    await middleware(next)(action);
    expect(fakeStore.dispatch).toHaveBeenCalledWith(
      jujuActions.destroyModelErrors({
        errors: [["123abc", "Error"]],
      }),
    );
    expect(fetchModelInfo).not.toHaveBeenCalled();
    expect(fakeStore.dispatch).not.toHaveBeenCalledWith(
      jujuActions.updateModelsDestroyed({
        modelUUIDs: ["123abc"],
        wsControllerURL: "wss://example.com",
      }),
    );
  });

  it("handles partial errors from response when destroying models", async () => {
    vi.spyOn(jujuModule, "loginWithBakery").mockImplementation(async () => ({
      conn,
      intervalId,
      juju,
    }));
    const fetchModelInfo = vi
      .spyOn(jujuModule, "fetchModelInfo")
      .mockResolvedValue({
        results: [{ result: undefined }],
      });
    conn.facades.modelManager.destroyModels.mockResolvedValue({
      results: [{ error: { code: "BOOM", message: "Error" } }, {}],
    });
    const middleware = await runMiddleware();
    const action = jujuActions.destroyModels({
      wsControllerURL: "wss://example.com",
      models: [
        { "model-tag": "model-123abc", modelUUID: "123abc" },
        { "model-tag": "model-456xyz", modelUUID: "456xyz" },
      ],
    });
    await middleware(next)(action);
    expect(fakeStore.dispatch).toHaveBeenCalledWith(
      jujuActions.destroyModelErrors({
        errors: [["123abc", "Error"]],
      }),
    );
    expect(fetchModelInfo).toHaveBeenCalledWith(conn, ["456xyz"]);
    expect(fakeStore.dispatch).toHaveBeenCalledWith(
      jujuActions.updateModelsDestroyed({
        modelUUIDs: ["456xyz"],
        wsControllerURL: "wss://example.com",
      }),
    );
  });

  it("handles destroy model action for multiple models", async () => {
    vi.spyOn(jujuModule, "loginWithBakery").mockImplementation(async () => ({
      conn,
      intervalId,
      juju,
    }));
    conn.facades.modelManager.destroyModels.mockResolvedValue({
      results: [{}, {}],
    });
    /** 
     We expect fetchModelInfo to be called twice:
     1. With both models.
     2. With the one remaining model after 10s.
     * */
    const fetchModelInfo = vi
      .spyOn(jujuModule, "fetchModelInfo")
      .mockResolvedValueOnce({
        results: [
          { result: undefined },
          { result: modelDataInfoFactory.build({ life: "dying" }) },
        ],
      })
      .mockResolvedValue({
        results: [{ result: undefined }],
      });

    const middleware = await runMiddleware();
    const action = jujuActions.destroyModels({
      wsControllerURL: "wss://example.com",
      models: [
        { "model-tag": "model-123abc", modelUUID: "123abc" },
        { "model-tag": "model-456xyz", modelUUID: "456xyz" },
      ],
    });
    middleware(next)(action);
    await waitFor(() => {
      expect(conn.facades.modelManager.destroyModels).toHaveBeenCalledWith({
        models: [
          { "model-tag": "model-123abc", modelUUID: "123abc" },
          { "model-tag": "model-456xyz", modelUUID: "456xyz" },
        ],
      });
      expect(fakeStore.dispatch).toHaveBeenCalledWith(
        jujuActions.updateDestroyModelsLoading({
          modelUUIDs: ["123abc", "456xyz"],
          wsControllerURL: "wss://example.com",
        }),
      );
    });

    // Check that the first model was successfully destroyed in Poll 1
    expect(fetchModelInfo).toHaveBeenCalledWith(conn, ["123abc", "456xyz"]);
    expect(fakeStore.dispatch).toHaveBeenCalledWith(
      jujuActions.updateModelsDestroyed({
        modelUUIDs: ["123abc"],
        wsControllerURL: "wss://example.com",
      }),
    );

    // This resolves the 10s promise, triggers Poll 2
    await vi.advanceTimersByTimeAsync(10000);

    // The middleware should have called fetchModelInfo exactly twice:
    // Once before the timer (Poll 1), once after the timer (Poll 2).
    expect(fetchModelInfo).toHaveBeenCalledTimes(2);

    // Check that the second fetch call (Poll 2) targeted the remaining model
    expect(fetchModelInfo).toHaveBeenCalledWith(conn, ["456xyz"]);
    expect(fakeStore.dispatch).toHaveBeenCalledWith(
      jujuActions.updateModelsDestroyed({
        modelUUIDs: ["456xyz"],
        wsControllerURL: "wss://example.com",
      }),
    );
  });

  it("handles non-standard errors when destroying models", async () => {
    vi.spyOn(jujuModule, "loginWithBakery").mockImplementation(async () => ({
      conn,
      intervalId,
      juju,
    }));
    conn.facades.modelManager.destroyModels.mockResolvedValue(
      vi.fn().mockRejectedValue("Uh oh!"),
    );
    const middleware = await runMiddleware();
    const action = jujuActions.destroyModels({
      wsControllerURL: "wss://example.com",
      models: [{ "model-tag": "model-123abc", modelUUID: "123abc" }],
    });
    await middleware(next)(action);
    expect(fakeStore.dispatch).toHaveBeenCalledWith(
      jujuActions.destroyModelErrors({
        errors: [
          [
            "123abc",
            "Something went wrong during the model destruction process",
          ],
        ],
      }),
    );
  });
});
