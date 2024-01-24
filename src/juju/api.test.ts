import type { Connection } from "@canonical/jujulib";
import * as jujuLib from "@canonical/jujulib";
import * as jujuLibVersions from "@canonical/jujulib/dist/api/versions";
import { waitFor } from "@testing-library/react";

import { actions as jujuActions } from "store/juju";
import type { RootState } from "store/store";
import { rootStateFactory } from "testing/factories";
import {
  configFactory,
  credentialFactory,
  generalStateFactory,
} from "testing/factories/general";
import { applicationsCharmActionsResultsFactory } from "testing/factories/juju/ActionV7";
import {
  applicationGetFactory,
  errorResultsFactory,
} from "testing/factories/juju/Application";
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

import type { Config } from "./api";
import {
  CLIENT_VERSION,
  LOGIN_TIMEOUT,
  PING_TIME,
  connectAndLoginToModel,
  connectAndLoginWithTimeout,
  disableControllerUUIDMasking,
  executeActionOnUnits,
  fetchAllModelStatuses,
  fetchAndStoreModelStatus,
  fetchControllerList,
  fetchModelStatus,
  generateConnectionOptions,
  getActionsForApplication,
  getApplicationConfig,
  getCharmInfo,
  getCharmsURLFromApplications,
  loginWithBakery,
  queryActionsList,
  queryOperationsList,
  setApplicationConfig,
  setModelSharingPermissions,
  startModelWatcher,
  stopModelWatcher,
  findAuditEvents,
  crossModelQuery,
  Label as JujuAPILabel,
} from "./api";
import type { AllWatcherDelta } from "./types";
import { DeltaChangeTypes, DeltaEntityTypes } from "./types";

jest.mock("@canonical/jujulib", () => ({
  connect: jest.fn(),
  connectAndLogin: jest.fn(),
  fetchModelStatus: jest.fn(),
}));

jest.mock("@canonical/jujulib/dist/api/versions", () => ({
  jujuUpdateAvailable: jest.fn(),
}));

describe("Juju API", () => {
  beforeEach(() => {
    jest.useFakeTimers({
      legacyFakeTimers: true,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  describe("loginWithBakery", () => {
    beforeEach(() => {
      jest.useFakeTimers({
        legacyFakeTimers: true,
      });
    });

    afterEach(() => {
      jest.restoreAllMocks();
      jest.useRealTimers();
    });

    it("connects and logs in", async () => {
      const conn = { facades: {}, info: {} };
      const juju = {
        login: jest.fn().mockReturnValue(conn),
      };
      const connectSpy = jest
        .spyOn(jujuLib, "connect")
        .mockImplementation(async () => juju);
      const response = await loginWithBakery(
        "wss://example.com/api",
        {
          user: "eggman",
          password: "123",
        },
        false,
      );
      expect(response).toStrictEqual({
        conn,
        juju,
        intervalId: expect.any(Number),
      });
      expect(connectSpy).toHaveBeenCalled();
      expect(juju.login).toHaveBeenCalledWith(
        {
          username: "eggman",
          password: "123",
        },
        CLIENT_VERSION,
      );
    });

    it("handles login with external provider", async () => {
      const conn = { facades: {}, info: {} };
      const juju = {
        login: jest.fn().mockReturnValue(conn),
      };
      jest.spyOn(jujuLib, "connect").mockImplementation(async () => juju);
      await loginWithBakery(
        "wss://example.com/api",
        {
          user: "eggman",
          password: "123",
        },
        true,
      );
      expect(juju.login).toHaveBeenCalledWith({}, CLIENT_VERSION);
    });

    it("handles login errors", async () => {
      const juju = {
        login: jest.fn().mockImplementation(() => {
          throw new Error();
        }),
      };
      jest.spyOn(jujuLib, "connect").mockImplementation(async () => juju);
      const response = await loginWithBakery(
        "wss://example.com/api",
        {
          user: "eggman",
          password: "123",
        },
        false,
      );
      expect(response).toStrictEqual({
        error: "Could not log into controller",
      });
    });

    it("starts pinging the connection", async () => {
      const ping = jest.fn().mockResolvedValue(null);
      const conn = {
        facades: {
          pinger: {
            ping,
          },
        },
        info: {},
      };
      const juju = {
        login: jest.fn().mockReturnValue(conn),
      };
      jest.spyOn(jujuLib, "connect").mockImplementation(async () => juju);
      await loginWithBakery(
        "wss://example.com/api",
        {
          user: "eggman",
          password: "123",
        },
        false,
      );
      expect(ping).not.toHaveBeenCalled();
      jest.advanceTimersByTime(PING_TIME);
      expect(ping).toHaveBeenCalledTimes(1);
      jest.advanceTimersByTime(PING_TIME);
      expect(ping).toHaveBeenCalledTimes(2);
    });

    it("stops pinging the connection if there is an error", async () => {
      const clearInterval = jest.spyOn(window, "clearInterval");
      const consoleError = console.error;
      console.error = jest.fn();
      const ping = jest.fn().mockRejectedValue("Failed");
      const conn = {
        facades: {
          pinger: {
            ping,
          },
        },
        info: {},
      };
      const juju = {
        login: jest.fn().mockReturnValue(conn),
      };
      jest.spyOn(jujuLib, "connect").mockImplementation(async () => juju);
      await loginWithBakery(
        "wss://example.com/api",
        {
          user: "eggman",
          password: "123",
        },
        false,
      );
      jest.advanceTimersByTime(PING_TIME);
      await waitFor(() => {
        expect(clearInterval).toHaveBeenCalled();
      });
      clearInterval.mockRestore();
      console.error = consoleError;
    });
  });

  describe("connectAndLoginWithTimeout", () => {
    const consoleError = console.error;

    beforeEach(() => {
      console.error = jest.fn();
    });

    afterEach(() => {
      console.error = consoleError;
    });

    it("can connect and log in", async () => {
      const juju = {
        logout: jest.fn(),
      };
      jest
        .spyOn(jujuLib, "connectAndLogin")
        .mockImplementation(async () => juju);
      const response = await connectAndLoginWithTimeout(
        "wss://example.com/eggman/test",
        {
          user: "eggman",
          password: "123",
        },
        generateConnectionOptions(false),
        false,
      );
      expect(response).toStrictEqual(juju);
    });

    it("can time out while logging in", async () => {
      jest.spyOn(jujuLib, "connectAndLogin").mockImplementation(
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
        false,
      );
      jest.advanceTimersByTime(LOGIN_TIMEOUT);
      await expect(response).rejects.toMatchObject(new Error("timeout"));
    });

    it("should handle exceptions when logging in", async () => {
      jest.spyOn(jujuLib, "connectAndLogin").mockImplementation(async () => {
        return await new Promise((resolve, reject) => {
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
        false,
      );
      await expect(response).rejects.toMatchObject(
        new Error("Error during promise race.", new Error("Uh oh!")),
      );
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
      const response = await fetchModelStatus(
        "abc123",
        "wss://example.com/api",
        () => rootStateFactory.build(),
      );
      expect(response).toBeNull();
    });

    it("can log in with an external provider", async () => {
      if (state.general.config) {
        state.general.config.identityProviderAvailable = true;
      }
      const loginResponse = {
        conn: {
          facades: {
            client: {
              fullStatus: jest.fn().mockReturnValue({}),
            },
          },
        } as unknown as Connection,
        logout: jest.fn(),
      };
      const connectAndLoginSpy = jest
        .spyOn(jujuLib, "connectAndLogin")
        .mockImplementation(async () => loginResponse);
      await fetchModelStatus("abc123", "wss://example.com/api", () => state);
      expect(connectAndLoginSpy).toHaveBeenCalledWith(
        expect.any(String),
        // An empty object is passed when using an external provider.
        {},
        expect.any(Object),
        CLIENT_VERSION,
      );
    });

    it("handles timeout errors", async () => {
      const consoleError = console.error;
      console.error = jest.fn();
      jest.spyOn(jujuLib, "connectAndLogin").mockImplementation(
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
      jest.advanceTimersByTime(LOGIN_TIMEOUT);
      await expect(response).rejects.toStrictEqual(new Error("timeout"));
      expect(console.error).toHaveBeenCalledWith(
        "Error connecting to model:",
        "abc123",
        new Error("timeout"),
      );
      console.error = consoleError;
    });

    it("can fetch the status", async () => {
      const status = fullStatusFactory.build();
      const loginResponse = {
        conn: {
          facades: {
            client: {
              fullStatus: jest.fn().mockReturnValue(status),
            },
          },
        } as unknown as Connection,
        logout: jest.fn(),
      };
      jest
        .spyOn(jujuLib, "connectAndLogin")
        .mockImplementation(async () => loginResponse);
      const response = await fetchModelStatus(
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
              get: jest.fn().mockReturnValue({
                results: [
                  {
                    annotations,
                    entity: "application-etcd",
                  },
                ],
              }),
            },
            client: {
              fullStatus: jest.fn().mockReturnValue(status),
            },
          },
        } as unknown as Connection,
        logout: jest.fn(),
      };
      jest
        .spyOn(jujuLib, "connectAndLogin")
        .mockImplementation(async () => loginResponse);
      const response = await fetchModelStatus(
        "abc123",
        "wss://example.com/api",
        () => state,
      );
      expect(response?.annotations).toStrictEqual({
        etcd: annotations,
      });
    });

    it("handles string error responses", async () => {
      const consoleError = console.error;
      console.error = jest.fn();
      const loginResponse = {
        conn: {
          facades: {
            client: {
              fullStatus: jest.fn().mockReturnValue("Uh oh!"),
            },
          },
        } as unknown as Connection,
        logout: jest.fn(),
      };
      jest
        .spyOn(jujuLib, "connectAndLogin")
        .mockImplementation(async () => loginResponse);
      const response = fetchModelStatus(
        "abc123",
        "wss://example.com/api",
        () => state,
      );
      await expect(response).rejects.toStrictEqual(
        new Error("Unable to fetch the status. Uh oh!"),
      );
      expect(console.error).toHaveBeenCalledWith(
        "Error connecting to model:",
        "abc123",
        new Error("Unable to fetch the status. Uh oh!"),
      );
      console.error = consoleError;
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

    it("can fetch and store model status", async () => {
      const status = fullStatusFactory.build();
      const loginResponse = {
        conn: {
          facades: {
            client: {
              fullStatus: jest.fn().mockReturnValue(status),
            },
          },
        } as unknown as Connection,
        logout: jest.fn(),
      };
      jest
        .spyOn(jujuLib, "connectAndLogin")
        .mockImplementation(async () => loginResponse);
      const dispatch = jest.fn();
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
    });

    it("handles no model status returned", async () => {
      const consoleError = console.error;
      console.error = jest.fn();
      const loginResponse = {
        conn: {
          facades: {
            client: {
              fullStatus: jest.fn().mockReturnValue(null),
            },
          },
        } as unknown as Connection,
        logout: jest.fn(),
      };
      jest
        .spyOn(jujuLib, "connectAndLogin")
        .mockImplementation(async () => loginResponse);
      const dispatch = jest.fn();
      const response = fetchAndStoreModelStatus(
        "abc123",
        "wss://example.com/api",
        dispatch,
        () => state,
      );
      await expect(response).rejects.toStrictEqual(
        new Error("Unable to fetch the status. "),
      );
      expect(console.error).toHaveBeenCalledWith(
        "Error connecting to model:",
        "abc123",
        new Error("Unable to fetch the status. "),
      );
      expect(dispatch).not.toHaveBeenCalled();
      console.error = consoleError;
    });
  });

  describe("fetchAllModelStatuses", () => {
    let state: RootState;
    const consoleError = console.error;

    beforeEach(() => {
      console.error = jest.fn();
      // Need to use real timers so the promises resolve in the tests.
      jest.useRealTimers();
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
      console.error = consoleError;
      jest.restoreAllMocks();
    });

    it("fetches model statuses", async () => {
      const dispatch = jest.fn();
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
            modelInfo: jest
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

    it("updates controller cloud and region", async () => {
      const dispatch = jest.fn().mockReturnValue({ catch: jest.fn() });
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
            modelInfo: jest.fn().mockResolvedValueOnce(abc123),
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
        jest.fn(),
        jest.fn().mockReturnValue(state),
      );
      expect(thunkResult.meta.arg).toMatchObject({
        modelInfo: abc123,
        wsControllerURL: "wss://example.com/api",
      });
    });

    it("should console error when trying to update controller cloud and region", async () => {
      const dispatch = jest
        .fn()
        .mockReturnValueOnce(null)
        .mockReturnValueOnce(
          Promise.reject(new Error("Error while trying to dispatch!")),
        );
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
            modelInfo: jest.fn().mockResolvedValueOnce(abc123),
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
      expect(console.error).toHaveBeenCalledWith(
        "Error when trying to add controller cloud and region data.",
        new Error("Error while trying to dispatch!"),
      );
    });

    it("should return a rejected promise when retrieving data for some models fails", async () => {
      // The dispatch of updateModelInfo fails only for the first model.
      // This would make 50% (1/2) of all models error out.
      const dispatch = jest.fn().mockImplementationOnce(() => {
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
            modelInfo: jest
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
        new Error(JujuAPILabel.ERROR_LOAD_SOME_MODELS),
      );
    });

    it("should return a rejected promise when retrieving data for all models", async () => {
      // The dispatch of updateModelInfo fails for all models.
      const dispatch = jest.fn().mockImplementation(() => {
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
            modelInfo: jest
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
        new Error(JujuAPILabel.ERROR_LOAD_ALL_MODELS),
      );
    });
  });

  describe("fetchControllerList", () => {
    it("can fetch controllers via JIMM", async () => {
      const dispatch = jest.fn();
      const conn = {
        facades: {
          jimM: {
            listControllers: jest.fn().mockResolvedValueOnce({
              controllers: [
                controllerInfoFactory.build({ name: "jaas1" }),
                controllerInfoFactory.build({ name: "jaas2" }),
              ],
            }),
          },
        },
      } as unknown as Connection;
      jest
        .spyOn(jujuLibVersions, "jujuUpdateAvailable")
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
      const dispatch = jest.fn();
      const conn = {
        facades: {
          jimM: {
            listControllers: jest.fn().mockResolvedValueOnce({
              controllers: null,
            }),
          },
        },
      } as unknown as Connection;
      jest
        .spyOn(jujuLibVersions, "jujuUpdateAvailable")
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
      const dispatch = jest.fn();
      const conn = {
        facades: {
          controller: {
            controllerConfig: jest.fn().mockResolvedValueOnce({
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
      jest
        .spyOn(jujuLibVersions, "jujuUpdateAvailable")
        .mockImplementationOnce(async () => true);
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
      const dispatch = jest.fn();
      const conn = {
        facades: {
          jimM: {
            listControllers: jest.fn().mockResolvedValueOnce({
              controllers: [controllerInfoFactory.build({ name: "jaas1" })],
            }),
          },
        },
      } as unknown as Connection;
      jest
        .spyOn(jujuLibVersions, "jujuUpdateAvailable")
        .mockImplementationOnce(async () => null);
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
  });

  describe("disableControllerUUIDMasking", () => {
    it("can disable masking via JIMM", async () => {
      const conn = {
        facades: {
          jimM: {
            disableControllerUUIDMasking: jest.fn(() => Promise.resolve()),
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
            disableControllerUUIDMasking: jest.fn(() => Promise.resolve()),
          },
        },
      } as unknown as Connection;
      await expect(disableControllerUUIDMasking(conn)).resolves.toBeUndefined();
    });

    it("should handle exceptions when trying to disable controller masking", async () => {
      const conn = {
        facades: {
          jimM: {
            disableControllerUUIDMasking: jest.fn(() =>
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
      const connectAndLogin = jest.spyOn(jujuLib, "connectAndLogin");
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
      const connectAndLogin = jest
        .spyOn(jujuLib, "connectAndLogin")
        .mockImplementation(async () => ({
          logout: jest.fn(),
          conn,
        }));
      const response = await connectAndLoginToModel("abc123", state);
      expect(connectAndLogin).toHaveBeenCalledWith(
        "wss://example.com/model/abc123/api",
        {
          username: credentials.user,
          password: credentials.password,
        },
        expect.any(Object),
        CLIENT_VERSION,
      );
      expect(response).toMatchObject(conn);
    });
  });

  describe("getApplicationConfig", () => {
    it("can get app config", async () => {
      const config = applicationGetFactory.build();
      const state = rootStateFactory.build({
        juju: {
          models: {
            abc123: modelListInfoFactory.build(),
          },
        },
      });
      const conn = {
        facades: {
          application: {
            get: jest.fn().mockReturnValue(config),
          },
        },
      } as unknown as Connection;
      jest.spyOn(jujuLib, "connectAndLogin").mockImplementation(async () => ({
        logout: jest.fn(),
        conn,
      }));
      const response = await getApplicationConfig("abc123", "etcd", state);
      expect(conn.facades.application.get).toHaveBeenCalledWith({
        application: "etcd",
        branch: "",
      });
      expect(response).toMatchObject(config);
    });
  });

  describe("setApplicationConfig", () => {
    it("can set app config", async () => {
      const config: Config = {
        ignore: {
          name: "this should be ignored because it doesn't have a new value",
          description: "",
          source: "default",
          type: "boolean",
        },
        updateThis: {
          name: "changed config",
          description: "desc",
          source: "default",
          type: "string",
          newValue: "new val",
        },
      };
      const state = rootStateFactory.build({
        juju: {
          models: {
            abc123: modelListInfoFactory.build(),
          },
        },
      });
      const configResponse = errorResultsFactory.build();
      const conn = {
        facades: {
          application: {
            setConfigs: jest.fn().mockReturnValue(configResponse),
          },
        },
      } as unknown as Connection;
      jest.spyOn(jujuLib, "connectAndLogin").mockImplementation(async () => ({
        logout: jest.fn(),
        conn,
      }));
      const response = await setApplicationConfig(
        "abc123",
        "etcd",
        config,
        state,
      );
      expect(conn.facades.application.setConfigs).toHaveBeenCalledWith({
        Args: [
          {
            application: "etcd",
            config: {
              updateThis: "new val",
            },
            "config-yaml": "",
            generation: "",
          },
        ],
      });
      expect(response).toMatchObject(configResponse);
    });

    it("converts all values to strings", async () => {
      const config: Config = {
        bool: {
          name: "bool",
          description: "",
          source: "default",
          type: "boolean",
          newValue: false,
        },
        int: {
          name: "int",
          description: "desc",
          source: "default",
          type: "int",
          newValue: 0,
        },
        float: {
          name: "float",
          description: "desc",
          source: "default",
          type: "float",
          newValue: 0.0,
        },
      };
      const state = rootStateFactory.build({
        juju: {
          models: {
            abc123: modelListInfoFactory.build(),
          },
        },
      });
      const configResponse = errorResultsFactory.build();
      const conn = {
        facades: {
          application: {
            setConfigs: jest.fn().mockReturnValue(configResponse),
          },
        },
      } as unknown as Connection;
      jest.spyOn(jujuLib, "connectAndLogin").mockImplementation(async () => ({
        logout: jest.fn(),
        conn,
      }));
      await setApplicationConfig("abc123", "etcd", config, state);
      expect(conn.facades.application.setConfigs).toHaveBeenCalledWith({
        Args: [
          {
            application: "etcd",
            config: {
              bool: "false",
              int: "0",
              float: "0",
            },
            "config-yaml": "",
            generation: "",
          },
        ],
      });
    });
  });

  describe("getActionsForApplication", () => {
    it("gets actions for an application", async () => {
      const actionList = applicationsCharmActionsResultsFactory.build();
      const state = rootStateFactory.build({
        juju: {
          models: {
            abc123: modelListInfoFactory.build(),
          },
        },
      });
      const conn = {
        facades: {
          action: {
            applicationsCharmsActions: jest.fn().mockReturnValue(actionList),
          },
        },
      } as unknown as Connection;
      jest.spyOn(jujuLib, "connectAndLogin").mockImplementation(async () => ({
        logout: jest.fn(),
        conn,
      }));
      const response = await getActionsForApplication("etcd", "abc123", state);
      expect(
        conn.facades.action.applicationsCharmsActions,
      ).toHaveBeenCalledWith({
        entities: [{ tag: "application-etcd" }],
      });
      expect(response).toMatchObject(actionList);
    });
  });

  describe("executeActionOnUnits", () => {
    it("can execute actions on units", async () => {
      const result = { operation: "rebooting" };
      const state = rootStateFactory.build({
        juju: {
          models: {
            abc123: modelListInfoFactory.build(),
          },
        },
      });
      const conn = {
        facades: {
          action: {
            enqueueOperation: jest.fn().mockReturnValue(result),
          },
        },
      } as unknown as Connection;
      jest.spyOn(jujuLib, "connectAndLogin").mockImplementation(async () => ({
        logout: jest.fn(),
        conn,
      }));
      const response = await executeActionOnUnits(
        ["etcd/0", "mysql/2"],
        "reboot",
        { extra: "options" },
        "abc123",
        state,
      );
      expect(conn.facades.action.enqueueOperation).toHaveBeenCalledWith({
        actions: [
          {
            name: "reboot",
            receiver: "unit-etcd-0",
            parameters: { extra: "options" },
            tag: "",
          },
          {
            name: "reboot",
            receiver: "unit-mysql-2",
            parameters: { extra: "options" },
            tag: "",
          },
        ],
      });
      expect(response).toMatchObject(result);
    });
  });

  describe("queryOperationsList", () => {
    it("get the operations list", async () => {
      const result = { results: [], truncated: true };
      const state = rootStateFactory.build({
        juju: {
          models: {
            abc123: modelListInfoFactory.build(),
          },
        },
      });
      const conn = {
        facades: {
          action: {
            listOperations: jest.fn().mockReturnValue(result),
          },
        },
      } as unknown as Connection;
      jest.spyOn(jujuLib, "connectAndLogin").mockImplementation(async () => ({
        logout: jest.fn(),
        conn,
      }));
      const response = await queryOperationsList(
        {
          limit: 99,
        },
        "abc123",
        state,
      );
      expect(conn.facades.action.listOperations).toHaveBeenCalledWith({
        actions: [],
        applications: [],
        limit: 99,
        machines: [],
        offset: 0,
        status: [],
        units: [],
      });
      expect(response).toMatchObject(result);
    });
  });

  describe("queryActionsList", () => {
    it("can get the actions list", async () => {
      const result = { results: [] };
      const state = rootStateFactory.build({
        juju: {
          models: {
            abc123: modelListInfoFactory.build(),
          },
        },
      });
      const conn = {
        facades: {
          action: {
            actions: jest.fn().mockReturnValue(result),
          },
        },
      } as unknown as Connection;
      jest.spyOn(jujuLib, "connectAndLogin").mockImplementation(async () => ({
        logout: jest.fn(),
        conn,
      }));
      const args = {
        entities: [{ tag: "one" }],
      };
      const response = await queryActionsList(args, "abc123", state);
      expect(conn.facades.action.actions).toHaveBeenCalledWith(args);
      expect(response).toMatchObject(result);
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
      jest.spyOn(jujuLib, "connectAndLogin").mockImplementation(async () => ({
        logout: jest.fn(),
      }));
      const response = await startModelWatcher("abc123", state, jest.fn());
      expect(response).toBeNull();
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
            watchAll: jest.fn().mockReturnValue(watcherHandle),
          },
          allWatcher: {
            next: jest.fn().mockReturnValue(null),
          },
          pinger: {
            ping: jest.fn().mockResolvedValue(null),
          },
        },
      } as unknown as Connection;
      jest.spyOn(jujuLib, "connectAndLogin").mockImplementation(async () => ({
        logout: jest.fn(),
        conn,
      }));
      const response = await startModelWatcher("abc123", state, jest.fn());
      expect(conn.facades.client.watchAll).toHaveBeenCalled();
      jest.advanceTimersByTime(PING_TIME);
      expect(conn.facades.pinger.ping).toHaveBeenCalled();
      expect(conn.facades.allWatcher.next).toHaveBeenCalledWith({ id: 12345 });
      expect(response).toMatchObject({
        conn,
        watcherHandle,
        pingerIntervalId: expect.any(Number),
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
            watchAll: jest.fn().mockReturnValue(watcherHandle),
          },
          allWatcher: {
            next: jest.fn().mockReturnValue({ deltas }),
          },
          pinger: {
            ping: jest.fn().mockResolvedValue(null),
          },
        },
      } as unknown as Connection;
      jest.spyOn(jujuLib, "connectAndLogin").mockImplementation(async () => ({
        logout: jest.fn(),
        conn,
      }));
      const dispatch = jest.fn();
      await startModelWatcher("abc123", state, dispatch);
      expect(dispatch).toHaveBeenCalledWith(
        jujuActions.processAllWatcherDeltas(deltas),
      );
    });
  });

  describe("stopModelWatcher", () => {
    it("stops the model watcher", async () => {
      const clearInterval = jest
        .spyOn(window, "clearInterval")
        .mockImplementation(jest.fn());
      const conn = {
        facades: {
          allWatcher: {
            stop: jest.fn().mockReturnValue(null),
          },
        },
        transport: {
          close: jest.fn(),
        },
      } as unknown as Connection;
      await stopModelWatcher(conn, "123", 456);
      expect(conn.facades.allWatcher.stop).toHaveBeenCalledWith({ id: "123" });
      expect(conn.transport.close).toHaveBeenCalled();
      jest.advanceTimersByTime(PING_TIME);
      await waitFor(() => {
        expect(clearInterval).toHaveBeenCalled();
      });
      clearInterval.mockRestore();
    });
  });

  describe("setModelSharingPermissions", () => {
    it("handles no connection", async () => {
      jest.spyOn(jujuLib, "connectAndLogin").mockImplementation(async () => ({
        logout: jest.fn(),
      }));
      const response = setModelSharingPermissions(
        "wss://example.com/api",
        "abc123",
        undefined,
        "eggman@external",
        "write",
        "read",
        "grant",
        jest.fn(),
      );
      await expect(response).rejects.toMatchObject(
        new Error("Unable to connect to controller: wss://example.com/api"),
      );
    });

    it("handles incorrect options", async () => {
      jest.spyOn(jujuLib, "connectAndLogin").mockImplementation(async () => ({
        logout: jest.fn(),
      }));
      const conn = {
        facades: {
          modelManager: {
            modelInfo: jest.fn(),
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
        jest.fn(),
      );
      await expect(response).rejects.toMatchObject(
        new Error("Incorrect options given."),
      );
    });

    it("can revoke permissions", async () => {
      jest.spyOn(jujuLib, "connectAndLogin").mockImplementation(async () => ({
        logout: jest.fn(),
      }));
      const modelAccessResponse = errorResultsFactory.build();
      const conn = {
        facades: {
          modelManager: {
            modelInfo: jest.fn(),
            modifyModelAccess: jest.fn().mockReturnValue(modelAccessResponse),
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
        jest.fn(),
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
      jest.spyOn(jujuLib, "connectAndLogin").mockImplementation(async () => ({
        logout: jest.fn(),
      }));
      const modelAccessResponse = errorResultsFactory.build();
      const conn = {
        facades: {
          modelManager: {
            modelInfo: jest.fn(),
            modifyModelAccess: jest.fn().mockReturnValue(modelAccessResponse),
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
        jest.fn(),
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
      jest.spyOn(jujuLib, "connectAndLogin").mockImplementation(async () => ({
        logout: jest.fn(),
      }));
      const modelAccessResponse = errorResultsFactory.build();
      const dispatch = jest.fn();
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
            modelInfo: jest.fn().mockReturnValue(modelInfo),
            modifyModelAccess: jest.fn().mockReturnValue(modelAccessResponse),
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
            charmInfo: jest.fn().mockReturnValue(charm),
          },
        },
      } as unknown as Connection;
      jest.spyOn(jujuLib, "connectAndLogin").mockImplementation(async () => ({
        logout: jest.fn(),
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
      const dispatch = jest.fn();
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
            charmInfo: jest
              .fn()
              .mockResolvedValueOnce(etcd)
              .mockResolvedValueOnce(mysql),
          },
        },
      } as unknown as Connection;
      jest.spyOn(jujuLib, "connectAndLogin").mockImplementation(async () => ({
        logout: jest.fn(),
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

  describe("findAuditEvents", () => {
    it("fetches audit events", async () => {
      const events = { events: [] };
      const conn = {
        facades: {
          jimM: {
            findAuditEvents: jest
              .fn()
              .mockImplementation(() => Promise.resolve(events)),
          },
        },
      } as unknown as Connection;
      const response = await findAuditEvents(conn);
      expect(conn.facades.jimM.findAuditEvents).toHaveBeenCalled();
      expect(response).toMatchObject(events);
    });

    it("fetches audit events with supplied params", async () => {
      const events = { events: [] };
      const conn = {
        facades: {
          jimM: {
            findAuditEvents: jest
              .fn()
              .mockImplementation(() => Promise.resolve(events)),
          },
        },
      } as unknown as Connection;
      const response = await findAuditEvents(conn, {
        "user-tag": "user-eggman@external",
      });
      expect(conn.facades.jimM.findAuditEvents).toHaveBeenCalledWith({
        "user-tag": "user-eggman@external",
      });
      expect(response).toMatchObject(events);
    });

    it("handles errors", async () => {
      const error = new Error("Request failed");
      const conn = {
        facades: {
          jimM: {
            findAuditEvents: jest.fn().mockImplementation(() => {
              throw error;
            }),
          },
        },
      } as unknown as Connection;
      await expect(findAuditEvents(conn)).rejects.toBe(error);
    });

    it("handles no JIMM connection", async () => {
      const conn = {
        facades: {},
      } as unknown as Connection;
      await expect(findAuditEvents(conn)).rejects.toEqual(
        new Error("Not connected to JIMM."),
      );
    });
  });

  describe("crossModelQuery", () => {
    it("fetches cross model query result with supplied params", async () => {
      const result = { results: {}, errors: {} };
      const conn = {
        facades: {
          jimM: {
            crossModelQuery: jest.fn(() => Promise.resolve(result)),
          },
        },
      } as unknown as Connection;
      const response = await crossModelQuery(conn, ".");
      expect(conn.facades.jimM.crossModelQuery).toHaveBeenCalledWith(".");
      expect(response).toMatchObject(result);
    });

    it("handles errors", async () => {
      const error = new Error("Request failed");
      const conn = {
        facades: {
          jimM: {
            crossModelQuery: jest.fn().mockImplementation(() => {
              throw error;
            }),
          },
        },
      } as unknown as Connection;
      await expect(crossModelQuery(conn, ".")).rejects.toBe(error);
    });

    it("handles no JIMM connection", async () => {
      const conn = {
        facades: {},
      } as unknown as Connection;
      await expect(crossModelQuery(conn, ".")).rejects.toMatchObject(
        new Error("Not connected to JIMM."),
      );
    });

    it("should handle exceptions", async () => {
      const conn = {
        facades: {
          jimM: {
            crossModelQuery: jest.fn(() =>
              Promise.reject(
                new Error("Error while trying to run cross model query!"),
              ),
            ),
          },
        },
      } as unknown as Connection;
      await expect(crossModelQuery(conn, ".")).rejects.toMatchObject(
        new Error("Error while trying to run cross model query!"),
      );
    });
  });
});
