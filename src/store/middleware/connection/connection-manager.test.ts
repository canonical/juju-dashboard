import { Auth, LocalAuth } from "auth";
import * as jujuModule from "juju/api";
import type { ConnectionWithFacades } from "juju/types";

import { ConnectionManager } from "./connection-manager";

describe("ConnectionManager", () => {
  const connection = {} as ConnectionWithFacades;

  beforeEach(() => {
    new LocalAuth(vi.fn());
    vi.spyOn(jujuModule, "loginWithBakery").mockResolvedValue({
      conn: connection,
    });
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
});
