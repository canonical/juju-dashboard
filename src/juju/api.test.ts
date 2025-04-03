import type { Client, Connection } from "@canonical/jujulib";
import * as jujuLib from "@canonical/jujulib";
import * as jujuLibVersions from "@canonical/jujulib/dist/api/versions";
import { waitFor } from "@testing-library/react";
import { vi } from "vitest";

import { Auth, CandidAuth, LocalAuth, OIDCAuth } from "auth";
import { actions as generalActions } from "store/general";
import { AuthMethod } from "store/general/types";
import { actions as jujuActions } from "store/juju";
import type { RootState } from "store/store";
import { rootStateFactory } from "testing/factories";
import {
  configFactory,
  credentialFactory,
  generalStateFactory,
} from "testing/factories/general";
import { errorResultsFactory } from "testing/factories/juju/Application";
import { charmInfoFactory } from "testing/factories/juju/Charms";
import { fullStatusFactory } from "testing/factories/juju/ClientV6";
import {
  modelInfoFactory,
  modelInfoResultFactory,
  modelInfoResultsFactory,
} from "testing/factories/juju/ModelManagerV9";
import {
  controllerFactory,
  controllerInfoFactory,
  modelListInfoFactory,
} from "testing/factories/juju/juju";
import { connectionInfoFactory } from "testing/factories/juju/jujulib";
import {
  applicationInfoFactory,
  machineChangeDeltaFactory,
} from "testing/factories/juju/model-watcher";

import {
  CLIENT_VERSION,
  LOGIN_TIMEOUT,
  PING_TIME,
  connectAndLoginToModel,
  connectAndLoginWithTimeout,
  disableControllerUUIDMasking,
  fetchAllModelStatuses,
  fetchAndStoreModelStatus,
  fetchControllerList,
  fetchModelStatus,
  generateConnectionOptions,
  getCharmInfo,
  getCharmsURLFromApplications,
  loginWithBakery,
  setModelSharingPermissions,
  startModelWatcher,
  stopModelWatcher,
  connectToModel,
  Label,
} from "./api";
import type { AllWatcherDelta } from "./types";
import { DeltaChangeTypes, DeltaEntityTypes } from "./types";

describe("Juju API", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    new LocalAuth(vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();

    // @ts-expect-error - Resetting singleton for each test run.
    delete Auth.instance;
  });

  describe("loginWithBakery", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.restoreAllMocks();
      vi.useRealTimers();
    });

    it("connects and logs in", async () => {
      const conn = { facades: {}, info: {} };
      const juju = {
        login: vi.fn().mockReturnValue(conn),
      } as unknown as Client;
      const connectSpy = vi
        .spyOn(jujuLib, "connect")
        .mockImplementation(async () => juju);
      const determineCredentialsSpy = vi.spyOn(
        LocalAuth.prototype,
        "determineCredentials",
      );
      const response = await loginWithBakery("wss://example.com/api", {
        user: "eggman",
        password: "123",
      });
      expect(response).toStrictEqual({
        conn,
        juju,
        // This would be a number, but we're using mocked timers.
        intervalId: expect.any(Object),
      });
      expect(connectSpy).toHaveBeenCalled();
      expect(juju.login).toHaveBeenCalledWith(
        {
          username: "eggman",
          password: "123",
        },
        CLIENT_VERSION,
      );
      expect(determineCredentialsSpy).toHaveBeenCalledOnce();
    });

    it("handles login with external provider", async () => {
      new CandidAuth(vi.fn());
      const conn = { facades: {}, info: {} };
      const juju = {
        login: vi.fn().mockReturnValue(conn),
      } as unknown as Client;
      vi.spyOn(jujuLib, "connect").mockImplementation(async () => juju);
      await loginWithBakery("wss://example.com/api", {
        user: "eggman",
        password: "123",
      });
      expect(juju.login).toHaveBeenCalledWith(undefined, CLIENT_VERSION);
    });

    describe("using OIDC", () => {
      beforeEach(() => {
        new OIDCAuth(vi.fn());
      });

      it("connects and logs in when using OIDC", async () => {
        const conn = { facades: {}, info: {} };
        const juju = {
          login: vi.fn().mockReturnValue(conn),
        } as unknown as Client;
        const connectSpy = vi
          .spyOn(jujuLib, "connect")
          .mockImplementation(async () => juju);
        const response = await loginWithBakery(
          "wss://example.com/api",
          undefined,
        );
        expect(response).toStrictEqual({
          conn,
          juju,
          // This would be a number, but we're using mocked timers.
          intervalId: expect.any(Object),
        });
        expect(connectSpy).toHaveBeenCalledWith(
          "wss://example.com/api",
          expect.objectContaining({ loginWithSessionCookie: true }),
        );
        expect(juju.login).toHaveBeenCalledWith(undefined, CLIENT_VERSION);
      });
    });

    it("handles login errors", async () => {
      const juju = {
        login: vi.fn().mockImplementation(() => {
          throw new Error();
        }),
      } as unknown as Client;
      vi.spyOn(jujuLib, "connect").mockImplementation(async () => juju);
      const response = await loginWithBakery("wss://example.com/api", {
        user: "eggman",
        password: "123",
      });
      expect(response).toStrictEqual({
        error: "Could not log into controller",
      });
    });

    it("starts pinging the connection", async () => {
      const ping = vi.fn().mockResolvedValue(null);
      const conn = {
        facades: {
          pinger: {
            ping,
          },
        },
        info: {},
      };
      const juju = {
        login: vi.fn().mockReturnValue(conn),
      } as unknown as Client;
      vi.spyOn(jujuLib, "connect").mockImplementation(async () => juju);
      await loginWithBakery("wss://example.com/api", {
        user: "eggman",
        password: "123",
      });
      expect(ping).not.toHaveBeenCalled();
      vi.advanceTimersByTime(PING_TIME);
      expect(ping).toHaveBeenCalledTimes(1);
      vi.advanceTimersByTime(PING_TIME);
      expect(ping).toHaveBeenCalledTimes(2);
    });

    it("stops pinging the connection if there is an error", async () => {
      const clearInterval = vi.spyOn(window, "clearInterval");
      const ping = vi.fn().mockRejectedValue("Failed");
      const conn = {
        facades: {
          pinger: {
            ping,
          },
        },
        info: {},
      };
      const juju = {
        login: vi.fn().mockReturnValue(conn),
      } as unknown as Client;
      vi.spyOn(jujuLib, "connect").mockImplementation(async () => juju);
      await loginWithBakery("wss://example.com/api", {
        user: "eggman",
        password: "123",
      });
      vi.advanceTimersByTime(PING_TIME);
      await waitFor(() => {
        expect(clearInterval).toHaveBeenCalled();
      });
      clearInterval.mockRestore();
    });
  });

  describe("connectAndLoginWithTimeout", () => {
    it("can connect and log in", async () => {
      const juju = {
        logout: vi.fn(),
      };
      vi.spyOn(jujuLib, "connectAndLogin").mockImplementation(async () => juju);
      const determineCredentialsSpy = vi.spyOn(
        LocalAuth.prototype,
        "determineCredentials",
      );
      const response = await connectAndLoginWithTimeout(
        "wss://example.com/eggman/test",
        {
          user: "eggman",
          password: "123",
        },
        generateConnectionOptions(false),
      );
      expect(response).toStrictEqual(juju);
      expect(determineCredentialsSpy).toHaveBeenCalledOnce();
    });

    it("can time out while logging in", async () => {
      vi.spyOn(jujuLib, "connectAndLogin").mockImplementation(
        async () =>
          new Promise((resolve) => {
            setTimeout(resolve, LOGIN_TIMEOUT + 10);
          }),
      );
      const response = connectAndLoginWithTimeout(
        "wss://example.com/eggman/test",
        {
          user: "eggman",
          password: "123",
        },
        generateConnectionOptions(false),
      );
      vi.advanceTimersByTime(LOGIN_TIMEOUT);
      await expect(response).rejects.toMatchObject(
        new Error(Label.LOGIN_TIMEOUT_ERROR),
      );
    });

    it("should handle exceptions when logging in", async () => {
      vi.spyOn(jujuLib, "connectAndLogin").mockImplementation(async () => {
        return await new Promise((_resolve, reject) => {
          reject(new Error("Uh oh!"));
        });
      });
      const response = connectAndLoginWithTimeout(
        "wss://example.com/eggman/test",
        {
          user: "eggman",
          password: "123",
        },
        generateConnectionOptions(false),
      );
      await expect(response).rejects.toMatchObject(new Error("Uh oh!"));
    });
  });

  describe("generateConnectionOptions", () => {
    it("calls Auth.instance.jujulibConnectOptions", () => {
      const jujulibConnectOptionsSpy = vi.spyOn(
        LocalAuth.prototype,
        "jujulibConnectOptions",
      );
      generateConnectionOptions(false);
      expect(jujulibConnectOptionsSpy).toHaveBeenCalledOnce();
    });
  });

  describe("fetchModelStatus", () => {
    let state: RootState;

    beforeEach(() => {
      state = rootStateFactory.build({
        general: generalStateFactory.build({
          controllerConnections: {
            "wss://example.com/api": {
              user: {
                identity: "user",
              },
            },
          },
        }),
      });
    });

    it("handles a logged out user", async () => {
      const { status } = await fetchModelStatus(
        "abc123",
        "wss://example.com/api",
        () => rootStateFactory.build(),
      );
      expect(status).toBeNull();
    });

    it("can log in with an external provider", async () => {
      if (state.general.config) {
        state.general.config.authMethod = AuthMethod.CANDID;
      }
      const loginResponse = {
        conn: {
          facades: {
            client: {
              fullStatus: vi.fn().mockReturnValue({}),
            },
          },
        } as unknown as Connection,
        logout: vi.fn(),
      };
      const connectAndLoginSpy = vi
        .spyOn(jujuLib, "connectAndLogin")
        .mockImplementation(async () => loginResponse);
      await fetchModelStatus("abc123", "wss://example.com/api", () => state);
      expect(connectAndLoginSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        undefined,
        CLIENT_VERSION,
      );
    });

    it("handles timeout errors", async () => {
      vi.spyOn(jujuLib, "connectAndLogin").mockImplementation(
        async () =>
          new Promise((resolve) => {
            setTimeout(resolve, LOGIN_TIMEOUT + 10);
          }),
      );
      const response = fetchModelStatus(
        "abc123",
        "wss://example.com/api",
        () => state,
      );
      vi.advanceTimersByTime(LOGIN_TIMEOUT);
      await expect(response).rejects.toStrictEqual(
        new Error(Label.LOGIN_TIMEOUT_ERROR),
      );
    });

    it("can fetch the status", async () => {
      const status = fullStatusFactory.build();
      const loginResponse = {
        conn: {
          facades: {
            client: {
              fullStatus: vi.fn().mockReturnValue(status),
            },
          },
        } as unknown as Connection,
        logout: vi.fn(),
      };
      vi.spyOn(jujuLib, "connectAndLogin").mockImplementation(
        async () => loginResponse,
      );
      const { status: response } = await fetchModelStatus(
        "abc123",
        "wss://example.com/api",
        () => state,
      );
      expect(response).toStrictEqual(status);
    });

    it("adds annotations to the status", async () => {
      const status = fullStatusFactory.build();
      const annotations = {
        "gui-x": 1,
        "gui-y": 2,
      };
      const loginResponse = {
        conn: {
          facades: {
            annotations: {
              get: vi.fn().mockReturnValue({
                results: [
                  {
                    annotations,
                    entity: "application-etcd",
                  },
                ],
              }),
            },
            client: {
              fullStatus: vi.fn().mockReturnValue(status),
            },
          },
        } as unknown as Connection,
        logout: vi.fn(),
      };
      vi.spyOn(jujuLib, "connectAndLogin").mockImplementation(
        async () => loginResponse,
      );
      const { status: response } = await fetchModelStatus(
        "abc123",
        "wss://example.com/api",
        () => state,
      );
      expect(response?.annotations).toStrictEqual({
        etcd: annotations,
      });
    });

    it("handles features when no secrets facade", async () => {
      const status = fullStatusFactory.build();
      const loginResponse = {
        conn: {
          facades: {
            client: {
              fullStatus: vi.fn().mockReturnValue(status),
            },
          },
        } as unknown as Connection,
        logout: vi.fn(),
      };
      vi.spyOn(jujuLib, "connectAndLogin").mockImplementation(
        async () => loginResponse,
      );
      const { features } = await fetchModelStatus(
        "abc123",
        "wss://example.com/api",
        () => state,
      );
      expect(features).toStrictEqual({
        listSecrets: false,
        manageSecrets: false,
      });
    });

    it("handles features when secrets facade is v1", async () => {
      const status = fullStatusFactory.build();
      const loginResponse = {
        conn: {
          facades: {
            client: {
              fullStatus: vi.fn().mockReturnValue(status),
            },
            secrets: {
              VERSION: 1,
            },
          },
        } as unknown as Connection,
        logout: vi.fn(),
      };
      vi.spyOn(jujuLib, "connectAndLogin").mockImplementation(
        async () => loginResponse,
      );
      const { features } = await fetchModelStatus(
        "abc123",
        "wss://example.com/api",
        () => state,
      );
      expect(features).toStrictEqual({
        listSecrets: true,
        manageSecrets: false,
      });
    });

    it("handles features when secrets facade is v2", async () => {
      const status = fullStatusFactory.build();
      const loginResponse = {
        conn: {
          facades: {
            client: {
              fullStatus: vi.fn().mockReturnValue(status),
            },
            secrets: {
              VERSION: 2,
            },
          },
        } as unknown as Connection,
        logout: vi.fn(),
      };
      vi.spyOn(jujuLib, "connectAndLogin").mockImplementation(
        async () => loginResponse,
      );
      const { features } = await fetchModelStatus(
        "abc123",
        "wss://example.com/api",
        () => state,
      );
      expect(features).toStrictEqual({
        listSecrets: true,
        manageSecrets: true,
      });
    });

    it("handles status error response", async () => {
      const loginResponse = {
        conn: {
          facades: {
            client: {
              fullStatus: vi.fn().mockRejectedValue(new Error("Uh oh!")),
            },
          },
        } as unknown as Connection,
        logout: vi.fn(),
      };
      vi.spyOn(jujuLib, "connectAndLogin").mockImplementation(
        async () => loginResponse,
      );
      const response = fetchModelStatus(
        "abc123",
        "wss://example.com/api",
        () => state,
      );
      await expect(response).rejects.toStrictEqual(
        new Error("Unable to fetch the status. Uh oh!"),
      );
    });
  });

  describe("fetchAndStoreModelStatus", () => {
    let state: RootState;

    beforeEach(() => {
      state = rootStateFactory.build({
        general: generalStateFactory.build({
          controllerConnections: {
            "wss://example.com/api": {
              user: {
                identity: "user",
              },
            },
          },
        }),
      });
    });

    it("can fetch and store model status and features", async () => {
      const status = fullStatusFactory.build();
      const loginResponse = {
        conn: {
          facades: {
            client: {
              fullStatus: vi.fn().mockReturnValue(status),
            },
            secrets: {
              VERSION: 1,
            },
          },
        } as unknown as Connection,
        logout: vi.fn(),
      };
      vi.spyOn(jujuLib, "connectAndLogin").mockImplementation(
        async () => loginResponse,
      );
      const dispatch = vi.fn();
      await fetchAndStoreModelStatus(
        "abc123",
        "wss://example.com/api",
        dispatch,
        () => state,
      );
      expect(dispatch).toHaveBeenCalledWith(
        jujuActions.updateModelStatus({
          modelUUID: "abc123",
          status,
          wsControllerURL: "wss://example.com/api",
        }),
      );
      expect(dispatch).toHaveBeenCalledWith(
        jujuActions.updateModelFeatures({
          modelUUID: "abc123",
          features: {
            listSecrets: true,
            manageSecrets: false,
          },
          wsControllerURL: "wss://example.com/api",
        }),
      );
    });

    it("handles the user not being authenticated after fetching the status", async () => {
      const status = fullStatusFactory.build();
      const loginResponse = {
        conn: {
          facades: {
            client: {
              fullStatus: vi.fn().mockReturnValue(status),
            },
            secrets: {
              VERSION: 1,
            },
          },
        } as unknown as Connection,
        logout: vi.fn(),
      };
      vi.spyOn(jujuLib, "connectAndLogin").mockImplementation(
        async () => loginResponse,
      );
      const dispatch = vi.fn();
      const getState = vi
        .fn()
        .mockImplementationOnce(() => state)
        .mockImplementationOnce(() => state)
        .mockImplementationOnce(() => state)
        .mockImplementationOnce(() => state)
        .mockImplementationOnce(() => ({
          ...state,
          general: generalStateFactory.build({
            controllerConnections: undefined,
          }),
        }));
      await fetchAndStoreModelStatus(
        "abc123",
        "wss://example.com/api",
        dispatch,
        getState,
      );
      // This number needs to match the number of times getState is called and
      // `mockImplementationOnce` needs to return the logged out state the last time.
      expect(getState).toHaveBeenCalledTimes(5);
      expect(dispatch).not.toHaveBeenCalled();
    });

    it("handles no model status returned", async () => {
      const loginResponse = {
        conn: {
          facades: {
            client: {
              fullStatus: vi.fn().mockReturnValue(null),
            },
          },
        } as unknown as Connection,
        logout: vi.fn(),
      };
      vi.spyOn(jujuLib, "connectAndLogin").mockImplementation(
        async () => loginResponse,
      );
      const dispatch = vi.fn();
      const response = fetchAndStoreModelStatus(
        "abc123",
        "wss://example.com/api",
        dispatch,
        () => state,
      );
      await expect(response).rejects.toStrictEqual(
        new Error("Unable to fetch the status. Status not returned."),
      );
      expect(dispatch).not.toHaveBeenCalled();
    });
  });

  describe("fetchAllModelStatuses", () => {
    let state: RootState;

    beforeEach(() => {
      // Need to use real timers so the promises resolve in the tests.
      vi.useRealTimers();
      state = rootStateFactory.build({
        general: generalStateFactory.build({
          controllerConnections: {
            "wss://example.com/api": {
              user: {
                identity: "user",
              },
            },
          },
        }),
        juju: {
          controllers: {
            "wss://example.com/api": [
              controllerFactory.build({ path: "admin/jaas", uuid: "123" }),
            ],
          },
          models: {
            abc123: modelListInfoFactory.build({
              wsControllerURL: "wss://example1.com/api",
            }),
            def456: modelListInfoFactory.build({
              wsControllerURL: "wss://example2.com/api",
            }),
          },
        },
      });
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("fetches model statuses", async () => {
      const dispatch = vi.fn();
      const abc123 = modelInfoResultsFactory.build({
        results: [
          modelInfoResultFactory.build({
            result: modelInfoFactory.build({
              uuid: "abc123",
            }),
          }),
        ],
      });
      const def456 = modelInfoResultsFactory.build({
        results: [
          modelInfoResultFactory.build({
            result: modelInfoFactory.build({
              uuid: "def456",
            }),
          }),
        ],
      });
      const conn = {
        facades: {
          modelManager: {
            modelInfo: vi
              .fn()
              .mockResolvedValueOnce(abc123)
              .mockResolvedValueOnce(def456),
          },
        },
      } as unknown as Connection;
      await fetchAllModelStatuses(
        "wss://example.com/api",
        ["abc123", "def456"],
        conn,
        dispatch,
        () => state,
      );
      expect(dispatch).toHaveBeenCalledWith(
        jujuActions.updateModelInfo({
          modelInfo: abc123,
          wsControllerURL: "wss://example.com/api",
        }),
      );
      expect(dispatch).toHaveBeenCalledWith(
        jujuActions.updateModelInfo({
          modelInfo: def456,
          wsControllerURL: "wss://example.com/api",
        }),
      );
    });

    it("should fetch model statuses successfully when there are 0 models", async () => {
      state.juju.models = {};
      const dispatch = vi.fn();
      const conn = {
        facades: {
          modelManager: {
            modelInfo: vi.fn(),
          },
        },
      } as unknown as Connection;
      const response = fetchAllModelStatuses(
        "wss://example.com/api",
        [],
        conn,
        dispatch,
        () => state,
      );
      await expect(response).resolves.toBeUndefined();
    });

    it("updates controller cloud and region", async () => {
      const dispatch = vi.fn().mockReturnValue({
        then: vi.fn().mockReturnValue({ catch: vi.fn() }),
      });
      const abc123 = modelInfoResultsFactory.build({
        results: [
          modelInfoResultFactory.build({
            result: modelInfoFactory.build({
              "is-controller": true,
              uuid: "abc123",
            }),
          }),
        ],
      });
      const conn = {
        facades: {
          modelManager: {
            modelInfo: vi.fn().mockResolvedValueOnce(abc123),
          },
        },
      } as unknown as Connection;
      await fetchAllModelStatuses(
        "wss://example.com/api",
        ["abc123"],
        conn,
        dispatch,
        () => state,
      );
      // Call the dispatched thunk so that we can check it was called with the
      // right args.
      const thunkResult = await dispatch.mock.calls[1][0](
        vi.fn(),
        vi.fn().mockReturnValue(state),
      );
      expect(thunkResult.meta.arg).toMatchObject({
        modelInfo: abc123,
        wsControllerURL: "wss://example.com/api",
      });
    });

    it("should console error when trying to update controller cloud and region", async () => {
      const dispatch = vi
        .fn()
        .mockReturnValueOnce(null)
        .mockRejectedValueOnce(new Error("Error while trying to dispatch!"));
      const abc123 = modelInfoResultsFactory.build({
        results: [
          modelInfoResultFactory.build({
            result: modelInfoFactory.build({
              "is-controller": true,
              uuid: "abc123",
            }),
          }),
        ],
      });
      const conn = {
        facades: {
          modelManager: {
            modelInfo: vi.fn().mockResolvedValueOnce(abc123),
          },
        },
      } as unknown as Connection;
      await fetchAllModelStatuses(
        "wss://example.com/api",
        ["abc123"],
        conn,
        dispatch,
        () => state,
      );
      expect(dispatch).toHaveBeenCalledTimes(2);
    });

    it("should return a rejected promise when retrieving data for some models fails", async () => {
      // The dispatch of updateModelInfo fails only for the first model.
      // This would make 50% (1/2) of all models error out.
      const dispatch = vi.fn().mockImplementationOnce(() => {
        throw new Error("Error while dispatching updateModelInfo!");
      });
      const abc123 = modelInfoResultsFactory.build({
        results: [
          modelInfoResultFactory.build({
            result: modelInfoFactory.build({
              uuid: "abc123",
            }),
          }),
        ],
      });
      const def456 = modelInfoResultsFactory.build({
        results: [
          modelInfoResultFactory.build({
            result: modelInfoFactory.build({
              uuid: "def456",
            }),
          }),
        ],
      });
      const conn = {
        facades: {
          modelManager: {
            modelInfo: vi
              .fn()
              .mockResolvedValueOnce(abc123)
              .mockResolvedValueOnce(def456),
          },
        },
      } as unknown as Connection;
      const response = fetchAllModelStatuses(
        "wss://example.com/api",
        ["abc123", "def456"],
        conn,
        dispatch,
        () => state,
      );
      await expect(response).rejects.toStrictEqual(
        new Error("Unable to load some models."),
      );
    });

    it("should return a rejected promise when retrieving data for all models", async () => {
      // The dispatch of updateModelInfo fails for all models.
      const dispatch = vi.fn().mockImplementation(() => {
        throw new Error("Error while dispatching updateModelInfo!");
      });
      const abc123 = modelInfoResultsFactory.build({
        results: [
          modelInfoResultFactory.build({
            result: modelInfoFactory.build({
              uuid: "abc123",
            }),
          }),
        ],
      });
      const def456 = modelInfoResultsFactory.build({
        results: [
          modelInfoResultFactory.build({
            result: modelInfoFactory.build({
              uuid: "def456",
            }),
          }),
        ],
      });
      const conn = {
        facades: {
          modelManager: {
            modelInfo: vi
              .fn()
              .mockResolvedValueOnce(abc123)
              .mockResolvedValueOnce(def456),
          },
        },
      } as unknown as Connection;
      const response = fetchAllModelStatuses(
        "wss://example.com/api",
        ["abc123", "def456"],
        conn,
        dispatch,
        () => state,
      );
      await expect(response).rejects.toStrictEqual(
        new Error("Unable to load models."),
      );
    });

    it("handles logout while fetching model status", async () => {
      const dispatch = vi
        .fn()
        .mockImplementation((...args) => console.log("called with", ...args));
      const getState = vi
        .fn()
        .mockReturnValueOnce(state)
        .mockReturnValueOnce(state)
        .mockReturnValueOnce(state)
        .mockReturnValueOnce(state)
        .mockReturnValueOnce({
          ...state,
          general: generalStateFactory.build({
            controllerConnections: {},
          }),
        });
      const abc123 = modelInfoResultsFactory.build({
        results: [
          modelInfoResultFactory.build({
            result: modelInfoFactory.build({
              uuid: "abc123",
            }),
          }),
        ],
      });
      const conn = {
        facades: {
          modelManager: {
            modelInfo: vi.fn().mockResolvedValueOnce(abc123),
          },
        },
      } as unknown as Connection;
      await fetchAllModelStatuses(
        "wss://example.com/api",
        ["abc123"],
        conn,
        dispatch,
        getState,
      );
      // We need to return the logged out state on the last call, so check that
      // the number of calls is what we expect:
      expect(getState).toHaveBeenCalledTimes(5);
      expect(dispatch).not.toHaveBeenCalled();
    });

    it("handles logout while fetching model info", async () => {
      const dispatch = vi.fn();
      const getState = vi
        .fn()
        .mockReturnValueOnce(state)
        .mockReturnValueOnce(state)
        .mockReturnValueOnce(state)
        .mockReturnValueOnce(state)
        .mockReturnValueOnce(state)
        .mockReturnValueOnce({
          ...state,
          general: generalStateFactory.build({
            controllerConnections: {},
          }),
        });
      const abc123 = modelInfoResultsFactory.build({
        results: [
          modelInfoResultFactory.build({
            result: modelInfoFactory.build({
              "is-controller": true,
              uuid: "abc123",
            }),
          }),
        ],
      });
      const conn = {
        facades: {
          modelManager: {
            modelInfo: vi.fn().mockResolvedValueOnce(abc123),
          },
        },
      } as unknown as Connection;
      await fetchAllModelStatuses(
        "wss://example.com/api",
        ["abc123"],
        conn,
        dispatch,
        getState,
      );
      // We need to return the logged out state on the last call, so check that
      // the number of calls is what we expect:
      expect(getState).toHaveBeenCalledTimes(6);
      // The `updateModelInfo` should be the last dispatch before exiting.
      expect(dispatch).toHaveBeenLastCalledWith(
        jujuActions.updateModelInfo({
          modelInfo: abc123,
          wsControllerURL: "wss://example.com/api",
        }),
      );
    });
  });

  describe("fetchControllerList", () => {
    it("can fetch controllers via JIMM", async () => {
      const dispatch = vi.fn();
      const conn = {
        facades: {
          jimM: {
            listControllers: vi.fn().mockResolvedValueOnce({
              controllers: [
                controllerInfoFactory.build({ name: "jaas1" }),
                controllerInfoFactory.build({ name: "jaas2" }),
              ],
            }),
          },
        },
      } as unknown as Connection;
      vi.spyOn(jujuLibVersions, "jujuUpdateAvailable")
        .mockImplementationOnce(async () => true)
        .mockImplementationOnce(async () => false);
      await fetchControllerList("wss://example.com/api", conn, dispatch, () =>
        rootStateFactory.build(),
      );
      expect(dispatch).toHaveBeenCalledWith(
        jujuActions.updateControllerList({
          wsControllerURL: "wss://example.com/api",
          controllers: [
            controllerInfoFactory.build({
              name: "jaas1",
              updateAvailable: true,
            }),
            controllerInfoFactory.build({
              name: "jaas2",
              updateAvailable: false,
            }),
          ],
        }),
      );
    });

    it("can fetch controllers via JIMM with 0 controllers", async () => {
      const dispatch = vi.fn();
      const conn = {
        facades: {
          jimM: {
            listControllers: vi.fn().mockResolvedValueOnce({
              controllers: null,
            }),
          },
        },
      } as unknown as Connection;
      vi.spyOn(jujuLibVersions, "jujuUpdateAvailable")
        .mockImplementationOnce(async () => true)
        .mockImplementationOnce(async () => false);
      await fetchControllerList("wss://example.com/api", conn, dispatch, () =>
        rootStateFactory.build(),
      );
      expect(dispatch).toHaveBeenCalledWith(
        jujuActions.updateControllerList({
          wsControllerURL: "wss://example.com/api",
          controllers: [],
        }),
      );
    });

    it("can fetch the controller from Juju", async () => {
      const dispatch = vi.fn();
      const conn = {
        facades: {
          controller: {
            controllerConfig: vi.fn().mockResolvedValueOnce({
              config: {
                "controller-name": "admin/juju1",
                "controller-uuid": "abc123",
              },
            }),
          },
        },
      } as unknown as Connection;
      const state = rootStateFactory.build({
        general: generalStateFactory.build({
          controllerConnections: {
            "wss://example.com/api": connectionInfoFactory.build({
              serverVersion: "1.2.3",
            }),
          },
        }),
      });
      vi.spyOn(jujuLibVersions, "jujuUpdateAvailable").mockImplementationOnce(
        async () => true,
      );
      await fetchControllerList(
        "wss://example.com/api",
        conn,
        dispatch,
        () => state,
      );
      expect(dispatch).toHaveBeenCalledWith(
        jujuActions.updateControllerList({
          wsControllerURL: "wss://example.com/api",
          controllers: [
            {
              path: "admin/juju1",
              uuid: "abc123",
              updateAvailable: true,
              version: "1.2.3",
            },
          ],
        }),
      );
    });

    it("can handle null responses when checking for updates", async () => {
      const dispatch = vi.fn();
      const conn = {
        facades: {
          jimM: {
            listControllers: vi.fn().mockResolvedValueOnce({
              controllers: [controllerInfoFactory.build({ name: "jaas1" })],
            }),
          },
        },
      } as unknown as Connection;
      vi.spyOn(jujuLibVersions, "jujuUpdateAvailable").mockImplementationOnce(
        async () => null,
      );
      await fetchControllerList("wss://example.com/api", conn, dispatch, () =>
        rootStateFactory.build(),
      );
      expect(dispatch).toHaveBeenCalledWith(
        jujuActions.updateControllerList({
          wsControllerURL: "wss://example.com/api",
          controllers: [
            controllerInfoFactory.build({
              name: "jaas1",
              updateAvailable: false,
            }),
          ],
        }),
      );
    });

    it("should handle error when unable to fetch the list of controllers", async () => {
      const dispatch = vi.fn();
      const conn = {
        facades: {
          jimM: {
            listControllers: vi.fn().mockRejectedValueOnce(new Error("Uh oh!")),
          },
        },
      } as unknown as Connection;
      vi.spyOn(jujuLibVersions, "jujuUpdateAvailable").mockImplementationOnce(
        async () => null,
      );
      await fetchControllerList("wss://example.com/api", conn, dispatch, () =>
        rootStateFactory.build(),
      );
      expect(dispatch).toHaveBeenCalledWith(
        generalActions.storeConnectionError(
          "Unable to fetch the list of controllers.",
        ),
      );
    });
  });

  describe("disableControllerUUIDMasking", () => {
    it("can disable masking via JIMM", async () => {
      const conn = {
        facades: {
          jimM: {
            disableControllerUUIDMasking: vi.fn(() => Promise.resolve()),
          },
        },
      } as unknown as Connection;
      await disableControllerUUIDMasking(conn);
      expect(conn.facades.jimM.disableControllerUUIDMasking).toHaveBeenCalled();
    });

    it("does nothing for Juju controllers", async () => {
      const conn = {
        facades: {
          jimM: {
            disableControllerUUIDMasking: vi.fn(() => Promise.resolve()),
          },
        },
      } as unknown as Connection;
      await expect(disableControllerUUIDMasking(conn)).resolves.toBeUndefined();
    });

    it("should handle exceptions when trying to disable controller masking", async () => {
      const conn = {
        facades: {
          jimM: {
            disableControllerUUIDMasking: vi.fn(() =>
              Promise.reject(new Error()),
            ),
          },
        },
      } as unknown as Connection;
      await expect(disableControllerUUIDMasking(conn)).rejects.toMatchObject(
        new Error("Unable to disabled controller UUID masking."),
      );
    });
  });

  describe("connectAndLoginToModel", () => {
    it("exits if there is no model", async () => {
      const connectAndLogin = vi.spyOn(jujuLib, "connectAndLogin");
      const response = await connectAndLoginToModel(
        "abc12",
        rootStateFactory.build(),
      );
      expect(connectAndLogin).not.toHaveBeenCalled();
      expect(response).toBeNull();
    });

    it("can connect and log in", async () => {
      const config = configFactory.build({
        controllerAPIEndpoint: "wss://example.com/api",
      });
      const credentials = credentialFactory.build();
      const state = rootStateFactory.build({
        general: generalStateFactory.build({
          credentials: {
            "wss://example.com/api": credentials,
          },
          config,
        }),
        juju: {
          models: {
            abc123: modelListInfoFactory.build({
              wsControllerURL: "wss://example.com/api",
            }),
          },
        },
      });
      const conn = {
        facades: {},
      } as unknown as Connection;
      const connectAndLogin = vi
        .spyOn(jujuLib, "connectAndLogin")
        .mockImplementation(async () => ({
          logout: vi.fn(),
          conn,
        }));
      const response = await connectAndLoginToModel("abc123", state);
      expect(connectAndLogin).toHaveBeenCalledWith(
        "wss://example.com/model/abc123/api",
        expect.any(Object),
        {
          username: credentials.user,
          password: credentials.password,
        },
        CLIENT_VERSION,
      );
      expect(response).toMatchObject(conn);
    });
  });

  describe("connectToModel", () => {
    it("can connect and log in", async () => {
      const credentials = credentialFactory.build();
      const conn = {
        facades: {},
      } as unknown as Connection;
      const connectAndLogin = vi
        .spyOn(jujuLib, "connectAndLogin")
        .mockImplementation(async () => ({
          logout: vi.fn(),
          conn,
        }));
      const response = await connectToModel(
        "abc123",
        "wss://example.com/api",
        credentials,
      );
      expect(connectAndLogin).toHaveBeenCalledWith(
        "wss://example.com/model/abc123/api",
        expect.any(Object),
        {
          username: credentials.user,
          password: credentials.password,
        },
        CLIENT_VERSION,
      );
      expect(response).toMatchObject(conn);
    });
  });

  describe("startModelWatcher", () => {
    it("handles no connection", async () => {
      const state = rootStateFactory.build({
        juju: {
          models: {
            abc123: modelListInfoFactory.build(),
          },
        },
      });
      vi.spyOn(jujuLib, "connectAndLogin").mockImplementation(async () => ({
        logout: vi.fn(),
      }));
      await expect(startModelWatcher("abc123", state, vi.fn())).rejects.toThrow(
        Label.START_MODEL_WATCHER_NO_CONNECTION_ERROR,
      );
    });

    it("handles no response", async () => {
      const state = rootStateFactory.build({
        juju: {
          models: {
            abc123: modelListInfoFactory.build(),
          },
        },
      });
      const conn = {
        facades: {
          client: {
            watchAll: vi.fn().mockReturnValue(null),
          },
          allWatcher: {
            next: vi.fn().mockReturnValue(null),
          },
          pinger: {
            ping: vi.fn().mockResolvedValue(null),
          },
        },
      } as unknown as Connection;
      vi.spyOn(jujuLib, "connectAndLogin").mockImplementation(async () => ({
        logout: vi.fn(),
        conn,
      }));
      await expect(startModelWatcher("abc123", state, vi.fn())).rejects.toThrow(
        Label.START_MODEL_WATCHER_NO_ID_ERROR,
      );
    });

    it("handles error response", async () => {
      const state = rootStateFactory.build({
        juju: {
          models: {
            abc123: modelListInfoFactory.build(),
          },
        },
      });
      const conn = {
        facades: {
          client: {
            watchAll: vi.fn().mockRejectedValue(new Error("Uh oh!")),
          },
          allWatcher: {
            next: vi.fn().mockReturnValue(null),
          },
          pinger: {
            ping: vi.fn().mockResolvedValue(null),
          },
        },
      } as unknown as Connection;
      vi.spyOn(jujuLib, "connectAndLogin").mockImplementation(async () => ({
        logout: vi.fn(),
        conn,
      }));
      await expect(startModelWatcher("abc123", state, vi.fn())).rejects.toThrow(
        "Uh oh!",
      );
    });

    it("starts the model watcher", async () => {
      const state = rootStateFactory.build({
        juju: {
          models: {
            abc123: modelListInfoFactory.build(),
          },
        },
      });
      const watcherHandle = { "watcher-id": 12345 };
      const conn = {
        facades: {
          client: {
            watchAll: vi.fn().mockReturnValue(watcherHandle),
          },
          allWatcher: {
            next: vi.fn().mockReturnValue(null),
          },
          pinger: {
            ping: vi.fn().mockResolvedValue(null),
          },
        },
      } as unknown as Connection;
      vi.spyOn(jujuLib, "connectAndLogin").mockImplementation(async () => ({
        logout: vi.fn(),
        conn,
      }));
      const response = await startModelWatcher("abc123", state, vi.fn());
      expect(conn.facades.client.watchAll).toHaveBeenCalled();
      vi.advanceTimersByTime(PING_TIME);
      expect(conn.facades.pinger.ping).toHaveBeenCalled();
      expect(conn.facades.allWatcher.next).toHaveBeenCalledWith({ id: 12345 });
      expect(response).toMatchObject({
        conn,
        watcherHandle,
        // This will be a number, but we're using mocked timers in these tests.
        pingerIntervalId: expect.any(Object),
      });
    });

    it("processes deltas if they're returned", async () => {
      const state = rootStateFactory.build({
        juju: {
          models: {
            abc123: modelListInfoFactory.build(),
          },
        },
      });
      const watcherHandle = { "watcher-id": 12345 };
      const deltas: AllWatcherDelta[] = [
        [
          DeltaEntityTypes.MACHINE,
          DeltaChangeTypes.CHANGE,
          machineChangeDeltaFactory.build(),
        ],
      ];
      const conn = {
        facades: {
          client: {
            watchAll: vi.fn().mockReturnValue(watcherHandle),
          },
          allWatcher: {
            next: vi.fn().mockReturnValue({ deltas }),
          },
          pinger: {
            ping: vi.fn().mockResolvedValue(null),
          },
        },
      } as unknown as Connection;
      vi.spyOn(jujuLib, "connectAndLogin").mockImplementation(async () => ({
        logout: vi.fn(),
        conn,
      }));
      const dispatch = vi.fn();
      await startModelWatcher("abc123", state, dispatch);
      expect(dispatch).toHaveBeenCalledWith(
        jujuActions.processAllWatcherDeltas(deltas),
      );
    });
  });

  describe("stopModelWatcher", () => {
    it("stops the model watcher", async () => {
      const clearInterval = vi
        .spyOn(window, "clearInterval")
        .mockImplementation(vi.fn());
      const conn = {
        facades: {
          allWatcher: {
            stop: vi.fn().mockReturnValue(null),
          },
        },
        transport: {
          close: vi.fn(),
        },
      } as unknown as Connection;
      await stopModelWatcher(conn, "123", 456);
      expect(conn.facades.allWatcher.stop).toHaveBeenCalledWith({ id: "123" });
      expect(conn.transport.close).toHaveBeenCalled();
      vi.advanceTimersByTime(PING_TIME);
      await waitFor(() => {
        expect(clearInterval).toHaveBeenCalled();
      });
      clearInterval.mockRestore();
    });
  });

  describe("setModelSharingPermissions", () => {
    it("handles no connection", async () => {
      vi.spyOn(jujuLib, "connectAndLogin").mockImplementation(async () => ({
        logout: vi.fn(),
      }));
      const response = setModelSharingPermissions(
        "wss://example.com/api",
        "abc123",
        undefined,
        "eggman@external",
        "write",
        "read",
        "grant",
        vi.fn(),
      );
      await expect(response).rejects.toMatchObject(
        new Error("Unable to connect to controller: wss://example.com/api"),
      );
    });

    it("handles incorrect options", async () => {
      vi.spyOn(jujuLib, "connectAndLogin").mockImplementation(async () => ({
        logout: vi.fn(),
      }));
      const conn = {
        facades: {
          modelManager: {
            modelInfo: vi.fn(),
          },
        },
      } as unknown as Connection;
      const response = setModelSharingPermissions(
        "wss://example.com/api",
        "abc123",
        conn,
        "eggman@external",
        undefined,
        undefined,
        "none",
        vi.fn(),
      );
      await expect(response).rejects.toMatchObject(
        new Error("Incorrect options given."),
      );
    });

    it("can revoke permissions", async () => {
      vi.spyOn(jujuLib, "connectAndLogin").mockImplementation(async () => ({
        logout: vi.fn(),
      }));
      const modelAccessResponse = errorResultsFactory.build();
      const conn = {
        facades: {
          modelManager: {
            modelInfo: vi.fn(),
            modifyModelAccess: vi.fn().mockReturnValue(modelAccessResponse),
          },
        },
      } as unknown as Connection;
      const response = await setModelSharingPermissions(
        "wss://example.com/api",
        "abc123",
        conn,
        "eggman@external",
        "write",
        "read",
        "revoke",
        vi.fn(),
      );
      expect(conn.facades.modelManager.modifyModelAccess).toHaveBeenCalledTimes(
        1,
      );
      expect(conn.facades.modelManager.modifyModelAccess).toHaveBeenCalledWith({
        changes: [
          {
            access: "read",
            action: "revoke",
            "model-tag": "model-abc123",
            "user-tag": "user-eggman@external",
          },
        ],
      });
      expect(response).toBe(modelAccessResponse);
    });

    it("can grant permissions", async () => {
      vi.spyOn(jujuLib, "connectAndLogin").mockImplementation(async () => ({
        logout: vi.fn(),
      }));
      const modelAccessResponse = errorResultsFactory.build();
      const conn = {
        facades: {
          modelManager: {
            modelInfo: vi.fn(),
            modifyModelAccess: vi.fn().mockReturnValue(modelAccessResponse),
          },
        },
      } as unknown as Connection;
      const response = await setModelSharingPermissions(
        "wss://example.com/api",
        "abc123",
        conn,
        "eggman@external",
        "write",
        "read",
        "grant",
        vi.fn(),
      );
      expect(conn.facades.modelManager.modifyModelAccess).toHaveBeenCalledWith({
        changes: [
          {
            access: "read",
            action: "revoke",
            "model-tag": "model-abc123",
            "user-tag": "user-eggman@external",
          },
        ],
      });
      expect(conn.facades.modelManager.modifyModelAccess).toHaveBeenCalledWith({
        changes: [
          {
            access: "write",
            action: "grant",
            "model-tag": "model-abc123",
            "user-tag": "user-eggman@external",
          },
        ],
      });
      expect(response).toBe(modelAccessResponse);
    });

    it("can fetch and update permissions", async () => {
      vi.spyOn(jujuLib, "connectAndLogin").mockImplementation(async () => ({
        logout: vi.fn(),
      }));
      const modelAccessResponse = errorResultsFactory.build();
      const dispatch = vi.fn();
      const modelInfo = modelInfoResultsFactory.build({
        results: [
          modelInfoResultFactory.build({
            result: modelInfoFactory.build({
              uuid: "abc123",
            }),
          }),
        ],
      });
      const conn = {
        facades: {
          modelManager: {
            modelInfo: vi.fn().mockReturnValue(modelInfo),
            modifyModelAccess: vi.fn().mockReturnValue(modelAccessResponse),
          },
        },
      } as unknown as Connection;
      await setModelSharingPermissions(
        "wss://example.com/api",
        "abc123",
        conn,
        "eggman@external",
        "write",
        "read",
        "grant",
        dispatch,
      );
      expect(conn.facades.modelManager.modelInfo).toHaveBeenCalledWith({
        entities: [
          {
            tag: "model-abc123",
          },
        ],
      });
      expect(dispatch).toHaveBeenCalledWith(
        jujuActions.updateModelInfo({
          modelInfo,
          wsControllerURL: "wss://example.com/api",
        }),
      );
    });
  });

  describe("getCharmInfo", () => {
    it("gets charm info", async () => {
      const charm = charmInfoFactory.build();
      const state = rootStateFactory.build({
        juju: {
          models: {
            abc123: modelListInfoFactory.build(),
          },
        },
      });
      const conn = {
        facades: {
          charms: {
            charmInfo: vi.fn().mockReturnValue(charm),
          },
        },
      } as unknown as Connection;
      vi.spyOn(jujuLib, "connectAndLogin").mockImplementation(async () => ({
        logout: vi.fn(),
        conn,
      }));
      const response = await getCharmInfo("cs:etcd", "abc123", state);
      expect(conn.facades.charms.charmInfo).toHaveBeenCalledWith({
        url: "cs:etcd",
      });
      expect(response).toMatchObject(charm);
    });
  });

  describe("getCharmsURLFromApplications", () => {
    it("fetches and stores charms", async () => {
      const dispatch = vi.fn();
      const etcd = charmInfoFactory.build({
        url: "cs:etcd",
      });
      const mysql = charmInfoFactory.build({
        url: "cs:mysql",
      });
      const state = rootStateFactory.build({
        general: generalStateFactory.build({
          config: configFactory.build({
            controllerAPIEndpoint: "wss://example.com/api",
          }),
        }),
        juju: {
          models: {
            abc123: modelListInfoFactory.build(),
          },
        },
      });
      const conn = {
        facades: {
          charms: {
            charmInfo: vi
              .fn()
              .mockResolvedValueOnce(etcd)
              .mockResolvedValueOnce(mysql),
          },
        },
      } as unknown as Connection;
      vi.spyOn(jujuLib, "connectAndLogin").mockImplementation(async () => ({
        logout: vi.fn(),
        conn,
      }));
      const apps = [
        applicationInfoFactory.build({ "charm-url": "cs:etcd" }),
        applicationInfoFactory.build({ "charm-url": "cs:myslq" }),
        applicationInfoFactory.build({ "charm-url": "cs:etcd" }),
      ];
      await getCharmsURLFromApplications(apps, "abc123", state, dispatch);
      expect(dispatch).toHaveBeenCalledWith(
        jujuActions.updateCharms({
          charms: [etcd, mysql],
          wsControllerURL: "wss://example.com/api",
        }),
      );
    });
  });
});
