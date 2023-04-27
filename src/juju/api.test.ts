import type { Connection } from "@canonical/jujulib";
import * as jujuLib from "@canonical/jujulib";
import { waitFor } from "@testing-library/react";

import { actions as jujuActions } from "store/juju";
import type { RootState } from "store/store";
import { rootStateFactory } from "testing/factories";
import { generalStateFactory } from "testing/factories/general";
import { fullStatusFactory } from "testing/factories/juju/ClientV6";

import {
  LOGIN_TIMEOUT,
  PING_TIME,
  connectAndLoginWithTimeout,
  fetchAndStoreModelStatus,
  fetchModelStatus,
  generateConnectionOptions,
  loginWithBakery,
  CLIENT_VERSION,
} from "./api";

jest.mock("@canonical/jujulib", () => ({
  connect: jest.fn(),
  connectAndLogin: jest.fn(),
  fetchModelStatus: jest.fn(),
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
        false
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
        CLIENT_VERSION
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
        true
      );
      expect(juju.login).toHaveBeenCalledWith({}, CLIENT_VERSION);
    });

    it("handles login errors", async () => {
      const error = new Error("It didn't work!");
      const juju = {
        login: jest.fn().mockImplementation(() => {
          throw error;
        }),
      };
      jest.spyOn(jujuLib, "connect").mockImplementation(async () => juju);
      const response = await loginWithBakery(
        "wss://example.com/api",
        {
          user: "eggman",
          password: "123",
        },
        false
      );
      expect(response).toStrictEqual({ error });
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
        false
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
        false
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
        false
      );
      expect(response).toStrictEqual(juju);
    });

    it("can time out while logging in", async () => {
      jest.spyOn(jujuLib, "connectAndLogin").mockImplementation(
        async () =>
          new Promise((resolve) => {
            setTimeout(resolve, LOGIN_TIMEOUT + 10);
          })
      );
      const response = connectAndLoginWithTimeout(
        "wss://example.com/eggman/test",
        {
          user: "eggman",
          password: "123",
        },
        generateConnectionOptions(false),
        false
      );
      jest.advanceTimersByTime(LOGIN_TIMEOUT);
      await expect(response).rejects.toBe("timeout");
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
        () => rootStateFactory.build()
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
        CLIENT_VERSION
      );
    });

    it("handles timeout errors", async () => {
      const consoleError = console.error;
      console.error = jest.fn();
      jest.spyOn(jujuLib, "connectAndLogin").mockImplementation(
        async () =>
          new Promise((resolve) => {
            setTimeout(resolve, LOGIN_TIMEOUT + 10);
          })
      );
      const response = fetchModelStatus(
        "abc123",
        "wss://example.com/api",
        () => state
      );
      jest.advanceTimersByTime(LOGIN_TIMEOUT);
      await expect(response).resolves.toBeNull();
      expect(console.error).toHaveBeenCalledWith(
        "error connecting to model:",
        "abc123",
        "timeout"
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
        () => state
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
        () => state
      );
      expect(response?.annotations).toStrictEqual({
        etcd: annotations,
      });
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
        () => state
      );
      expect(dispatch).toHaveBeenCalledWith(
        jujuActions.updateModelStatus({
          modelUUID: "abc123",
          status,
          wsControllerURL: "wss://example.com/api",
        })
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
      await fetchAndStoreModelStatus(
        "abc123",
        "wss://example.com/api",
        dispatch,
        () => state
      );
      expect(dispatch).not.toHaveBeenCalled();
      console.error = consoleError;
    });
  });
});
