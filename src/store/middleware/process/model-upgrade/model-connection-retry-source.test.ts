import type { Mock } from "vitest";

import type { ManagedConnection } from "store/middleware/connection/connection-manager";

import { createModelConnectionRetry } from "./model-connection-retry-source";

describe("modelConnectionRetrySource", () => {
  let connection: ManagedConnection;
  let fullStatusMock: Mock;
  let reconnectMock: Mock;

  beforeEach(() => {
    fullStatusMock = vi.fn().mockResolvedValue({
      model: {
        version: "1.2.3",
      },
    });
    reconnectMock = vi.fn().mockImplementation(async () => connection);
    connection = {
      facades: {
        client: {
          fullStatus: fullStatusMock,
        },
      },
      reconnect: reconnectMock,
    } as unknown as ManagedConnection;
  });

  it("calls `fullStatus` method on provided connection", async ({ expect }) => {
    const tryConnection = createModelConnectionRetry(connection);
    expect(fullStatusMock).not.toHaveBeenCalled();

    await expect(tryConnection()).resolves.toEqual({ version: "1.2.3" });
    expect(fullStatusMock).toHaveBeenCalledTimes(1);

    await expect(tryConnection()).resolves.toEqual({ version: "1.2.3" });
    expect(fullStatusMock).toHaveBeenCalledTimes(2);

    await expect(tryConnection()).resolves.toEqual({ version: "1.2.3" });
    expect(fullStatusMock).toHaveBeenCalledTimes(3);
  });

  it("throws error if `client` facade isn't present", async ({ expect }) => {
    delete connection.facades.client;

    const tryConnection = createModelConnectionRetry(connection);
    await expect(tryConnection()).rejects.toThrowError(
      "missing client facade on connection",
    );
  });

  it("attempts reconnection if request fails", async ({ expect }) => {
    fullStatusMock.mockRejectedValue(new Error("connection closed"));

    const tryConnection = createModelConnectionRetry(connection);
    expect(reconnectMock).toHaveBeenCalledTimes(0);
    await expect(tryConnection()).resolves.toEqual({ reconnecting: true });
    expect(reconnectMock).toHaveBeenCalledTimes(0);

    // Trigger re-connection
    await tryConnection();
    expect(reconnectMock).toHaveBeenCalledTimes(1);
  });

  it("doesn't initiate multiple reconnect attempts", async ({ expect }) => {
    fullStatusMock.mockRejectedValue(new Error("connection closed"));
    const reconnectPromise = Promise.withResolvers();
    reconnectMock.mockReturnValue(reconnectPromise.promise);

    const tryConnection = createModelConnectionRetry(connection);

    // Will clear the connection.
    await expect(tryConnection()).resolves.toEqual({ reconnecting: true });

    // Trigger re-connection
    void tryConnection();
    void tryConnection();
    void tryConnection();

    expect(reconnectMock).toHaveBeenCalledTimes(1);
  });

  it("handles error thrown from reconnect", async ({ expect }) => {
    fullStatusMock
      .mockRejectedValueOnce(new Error("connection closed"))
      .mockResolvedValueOnce({ model: { version: "1.2.3" } });
    const error = new Error("couldn't connect");
    reconnectMock
      .mockRejectedValueOnce(error)
      .mockResolvedValueOnce(connection);

    const tryConnection = createModelConnectionRetry(connection);

    // Will clear the connection.
    await expect(tryConnection()).resolves.toEqual({ reconnecting: true });
    expect(fullStatusMock).toHaveBeenCalledTimes(1);
    expect(reconnectMock).not.toHaveBeenCalled();

    await expect(tryConnection()).resolves.toEqual({ reconnecting: true });
    expect(fullStatusMock).toHaveBeenCalledTimes(1);
    expect(reconnectMock).toHaveBeenCalledTimes(1);

    await expect(tryConnection()).resolves.toEqual({ version: "1.2.3" });
    expect(fullStatusMock).toHaveBeenCalledTimes(2);
    expect(reconnectMock).toHaveBeenCalledTimes(2);
  });
});
