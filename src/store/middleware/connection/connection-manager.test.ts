import type { Client } from "@canonical/jujulib";
import * as jujuLib from "@canonical/jujulib";
import type { Mock, MockInstance } from "vitest";

import { Auth, LocalAuth } from "auth";
import * as jujuModule from "juju/api";
import { Label, type ConnectionWithFacades } from "juju/types";

import {
  ConnectionManager,
  CONNECTION_HANDLERS_BY_PATH,
  DefaultHandler,
} from "./connection-manager";

describe("ConnectionManager", () => {
  const connection = {} as ConnectionWithFacades;
  let connectionHandler: MockInstance;
  let connectionOnClose: Mock;

  beforeEach(() => {
    connectionOnClose = vi.fn();
    connectionHandler = CONNECTION_HANDLERS_BY_PATH[DefaultHandler] = vi
      .fn()
      .mockResolvedValue({
        connection,
        onClose: connectionOnClose,
      });
  });

  it("creates new connection if not existing", async ({ expect }) => {
    const manager = new ConnectionManager({ getCredentials: vi.fn() });
    const result = await manager.get("wss://example.com/");
    expect(connectionHandler).toHaveBeenCalledTimes(1);
    expect(result).toEqual(connection);
  });

  it("re-uses existing connection if present", async ({ expect }) => {
    const manager = new ConnectionManager({ getCredentials: vi.fn() });
    const result1 = await manager.get("wss://example.com/");
    const result2 = await manager.get("wss://example.com/");
    expect(connectionHandler).toHaveBeenCalledTimes(1);
    expect(result1).toEqual(connection);
    expect(result2).toEqual(connection);
  });

  it("re-uses pending connection if present", async ({ expect }) => {
    vi.useFakeTimers();
    // Ensure connection is pending
    const connectionPromise = Promise.withResolvers();
    connectionHandler.mockReturnValue(connectionPromise.promise);

    const manager = new ConnectionManager({ getCredentials: vi.fn() });
    // Begin connections, won't immediately resolve.
    let resolved1 = false;
    let resolved2 = false;
    const connect1 = manager.get("wss://example.com/").then((conn) => {
      resolved1 = true;
      return conn;
    });
    const connect2 = manager.get("wss://example.com/").then((conn) => {
      resolved2 = true;
      return conn;
    });
    await vi.runOnlyPendingTimersAsync();

    expect(connectionHandler).toHaveBeenCalledTimes(1);
    expect(resolved1).toBe(false);
    expect(resolved2).toBe(false);

    connectionPromise.resolve({ connection });
    await vi.runOnlyPendingTimersAsync();

    expect(resolved1).toBe(true);
    expect(resolved2).toBe(true);
    await expect(connect1).resolves.toBe(connection);
    await expect(connect2).resolves.toBe(connection);
  });

  it("produces iterator of all connections", async ({ expect }) => {
    const manager = new ConnectionManager({ getCredentials: vi.fn() });
    await manager.get("wss://example-1.com/");
    await manager.get("wss://example-2.com/");
    await manager.get("wss://example-3.com/");
    await manager.get("wss://example-4.com/");

    const connections = [...manager];
    expect(connections).toContain("wss://example-1.com/");
    expect(connections).toContain("wss://example-2.com/");
    expect(connections).toContain("wss://example-3.com/");
    expect(connections).toContain("wss://example-4.com/");
  });

  describe("logout", () => {
    it("correctly cleans up", async ({ expect }) => {
      const manager = new ConnectionManager({ getCredentials: vi.fn() });
      await manager.get("wss://example.com/");
      expect(connectionOnClose).not.toHaveBeenCalled();
      await manager.logout("wss://example.com/");
      expect(connectionOnClose).toHaveBeenCalledTimes(1);
    });

    it("immediately returns if not connected", async ({ expect }) => {
      const manager = new ConnectionManager({ getCredentials: vi.fn() });
      await manager.logout("wss://example.com/");
      expect(connectionHandler).not.toHaveBeenCalled();
    });

    it("waits for connection if in progress", async ({ expect }) => {
      vi.useFakeTimers();
      // Ensure connection is pending
      const connectionPromise = Promise.withResolvers();
      connectionHandler.mockReturnValue(connectionPromise.promise);

      const manager = new ConnectionManager({ getCredentials: vi.fn() });
      // Begin connection, won't immediately resolve.
      void manager.get("wss://example.com/");
      await vi.runOnlyPendingTimersAsync();

      let logoutResolved = false;
      void manager.logout("wss://example.com/").then(() => {
        logoutResolved = true;
        return;
      });

      await vi.runOnlyPendingTimersAsync();
      expect(logoutResolved).toBe(false);

      connectionPromise.resolve({ connection });
      await vi.runOnlyPendingTimersAsync();
      expect(logoutResolved).toBe(true);
    });
  });
});

describe("connection handlers", () => {
  describe("default", () => {
    let logout: Mock;
    let logoutCb: Mock;
    const connection = {} as ConnectionWithFacades;
    let connectAndLoginSpy: MockInstance;
    let startPingerLoopSpy: MockInstance;
    let stopPingerLoopSpy: MockInstance;

    const defaultHandler = CONNECTION_HANDLERS_BY_PATH[DefaultHandler];

    beforeEach(() => {
      new LocalAuth(vi.fn());
      logoutCb = vi.fn();
      logout = vi.fn((cb) => cb(0, logoutCb));
      connectAndLoginSpy = vi
        .spyOn(jujuLib, "connectAndLogin")
        .mockResolvedValue({
          conn: connection,
          logout,
        });
      startPingerLoopSpy = vi
        .spyOn(jujuModule, "startPingerLoop")
        .mockReturnValue(1234);
      stopPingerLoopSpy = vi
        .spyOn(jujuModule, "stopPingerLoop")
        .mockReturnValue();
    });

    afterEach(() => {
      // @ts-expect-error - Resetting singleton for each test run.
      delete Auth.instance;
    });

    it("calls `connectAndLogin`", async ({ expect }) => {
      const credential = { user: "admin", password: "example123" };
      const result = await defaultHandler("wss://example.com", credential);
      expect(connectAndLoginSpy).toHaveBeenCalledExactlyOnceWith(
        "wss://example.com",
        expect.anything(),
        expect.anything(),
        jujuModule.CLIENT_VERSION,
      );
      expect(startPingerLoopSpy).to.toHaveBeenCalledExactlyOnceWith(connection);
      expect(result.connection).toEqual(connection);
    });

    it("calls connection logout on close", async ({ expect }) => {
      const result = await defaultHandler("wss://example.com", undefined);
      expect(result.onClose).not.toBeUndefined();
      expect(logout).not.toHaveBeenCalled();
      await result.onClose?.();

      expect(logout).toHaveBeenCalledTimes(1);
      expect(logoutCb).toHaveBeenCalledTimes(1);
      expect(stopPingerLoopSpy).toHaveBeenCalledExactlyOnceWith(1234);
    });

    it("throws error on timeout", async ({ expect }) => {
      vi.useFakeTimers();
      connectAndLoginSpy.mockReturnValue(new Promise(() => {}));
      const connectionPromise = defaultHandler("wss://example.com", undefined);
      vi.advanceTimersByTime(jujuModule.LOGIN_TIMEOUT);
      await expect(async () => await connectionPromise).rejects.toThrow(
        Label.LOGIN_TIMEOUT_ERROR,
      );
    });
  });

  describe("controller", () => {
    const connection = {} as ConnectionWithFacades;
    const intervalId = 1234;
    let bakeryResult: Awaited<
      ReturnType<(typeof jujuModule)["loginWithBakery"]>
    >;
    let bakerySpy: MockInstance;
    let juju: Client;

    const controllerHandler = CONNECTION_HANDLERS_BY_PATH["/api"];

    beforeEach(() => {
      new LocalAuth(vi.fn());
      juju = {
        logout: vi.fn().mockImplementation((cb) => cb()),
      } as unknown as Client;
      bakeryResult = {
        conn: connection,
        juju,
        intervalId,
      };
      bakerySpy = vi
        .spyOn(jujuModule, "loginWithBakery")
        .mockResolvedValue(bakeryResult);
    });

    afterEach(() => {
      // @ts-expect-error - Resetting singleton for each test run.
      delete Auth.instance;
    });

    it("attempts to login with `loginWithBakery`", async ({ expect }) => {
      const credential = { user: "admin", password: "example123" };
      const result = await controllerHandler(
        "wss://example.com/api",
        credential,
      );
      expect(bakerySpy).toHaveBeenCalledExactlyOnceWith(
        "wss://example.com/api",
        credential,
      );
      expect(result.connection).toEqual(connection);
    });

    describe("on close", () => {
      let onClose: Awaited<ReturnType<typeof controllerHandler>>["onClose"];

      beforeEach(async () => {
        const result = await controllerHandler(
          "wss://example.com/api",
          undefined,
        );
        ({ onClose } = result);
      });

      it("calls `juju.logout`", async ({ expect }) => {
        expect(juju.logout).not.toHaveBeenCalled();
        expect(onClose).not.toBeUndefined();
        await onClose?.();
        expect(juju.logout).toBeCalledTimes(1);
      });

      it("clears interval", async ({ expect }) => {
        const clearIntervalSpy = vi.spyOn(window, "clearInterval");
        expect(onClose).not.toBeUndefined();
        await onClose?.();
        expect(clearIntervalSpy).toHaveBeenCalledExactlyOnceWith(intervalId);
      });
    });
  });
});
