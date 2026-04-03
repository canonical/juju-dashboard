import type { Client } from "@canonical/jujulib";
import type { MockInstance } from "vitest";

import { Auth, LocalAuth } from "auth";
import * as jujuModule from "juju/api";
import type { ConnectionWithFacades } from "juju/types";

import { ConnectionManager } from "./connection-manager";

describe("ConnectionManager", () => {
  const connection = {} as ConnectionWithFacades;
  const intervalId = 1234;
  let bakeryResult: Awaited<ReturnType<(typeof jujuModule)["loginWithBakery"]>>;
  let bakerySpy: MockInstance;
  let juju: Client;

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

  it("creates new connection if not existing", async ({ expect }) => {
    const manager = new ConnectionManager({ getCredentials: vi.fn() });
    const result = await manager.get("wss://example.com/");
    expect(jujuModule.loginWithBakery).toHaveBeenCalledTimes(1);
    expect(result).toEqual(connection);
  });

  it("re-uses existing connection if present", async ({ expect }) => {
    const manager = new ConnectionManager({ getCredentials: vi.fn() });
    const result1 = await manager.get("wss://example.com/");
    const result2 = await manager.get("wss://example.com/");
    expect(jujuModule.loginWithBakery).toHaveBeenCalledTimes(1);
    expect(result1).toEqual(connection);
    expect(result2).toEqual(connection);
  });

  it("re-uses pending connection if present", async ({ expect }) => {
    vi.useFakeTimers();
    // Ensure bakery is pending
    const bakeryPromise = Promise.withResolvers();
    bakerySpy.mockReturnValue(bakeryPromise.promise);

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

    expect(bakerySpy).toHaveBeenCalledTimes(1);
    expect(resolved1).toBe(false);
    expect(resolved2).toBe(false);

    bakeryPromise.resolve(bakeryResult);
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
      await manager.logout("wss://example.com/");
      expect(juju.logout).toHaveBeenCalledTimes(1);
    });

    it("immediately returns if not connected", async ({ expect }) => {
      const manager = new ConnectionManager({ getCredentials: vi.fn() });
      await manager.logout("wss://example.com/");
      expect(jujuModule.loginWithBakery).not.toHaveBeenCalled();
    });

    it("waits for connection if in progress", async ({ expect }) => {
      vi.useFakeTimers();
      // Ensure bakery is pending
      const bakeryPromise = Promise.withResolvers();
      bakerySpy.mockReturnValue(bakeryPromise.promise);

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

      bakeryPromise.resolve(bakeryResult);
      await vi.runOnlyPendingTimersAsync();
      expect(logoutResolved).toBe(true);
    });
  });
});
