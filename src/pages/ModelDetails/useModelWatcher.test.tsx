import type { Connection } from "@canonical/jujulib";
import * as jujuLib from "@canonical/jujulib";
import type { AllWatcherNextResults } from "@canonical/jujulib/dist/api/facades/all-watcher/AllWatcherV3";
import { act } from "@testing-library/react";
import type { MockInstance } from "vitest";

import * as juju from "juju/api";
import type { WrappedHookResult } from "testing/utils";
import { renderWrappedHook } from "testing/utils";

import useModelWatcher from "./useModelWatcher";

describe("useModelWatcher", () => {
  let client: {
    conn: Connection;
    logout: () => void;
  };

  beforeEach(() => {
    client = {
      conn: {
        info: {
          serverVersion: "3.2.1",
        },
        facades: {
          client: {
            fullStatus: vi.fn(),
            watchAll: vi.fn().mockReturnValue({ "watcher-id": "123" }),
          },
          allWatcher: {
            next: vi.fn().mockReturnValue(new Promise(() => {})),
            stop: vi.fn(),
          },
        },
        transport: {
          close: vi.fn(),
        },
      } as unknown as Connection,
      logout: vi.fn(),
    };
    vi.spyOn(jujuLib, "connectAndLogin").mockImplementation(async () => client);
  });

  afterEach(() => {
    vi.resetAllMocks();
    vi.restoreAllMocks();
  });

  let watcherNextMock: MockInstance<
    Awaited<ReturnType<(typeof juju)["startModelWatcher"]>>["next"]
  >;
  let startModelWatcherMock: MockInstance<(typeof juju)["startModelWatcher"]>;
  let stopModelWatcherMock: MockInstance<(typeof juju)["stopModelWatcher"]>;

  async function runHook(
    modelUUID: string = "abc123",
  ): Promise<WrappedHookResult<ReturnType<typeof useModelWatcher>, void>> {
    return await act(async () =>
      renderWrappedHook(() => useModelWatcher(modelUUID)),
    );
  }

  beforeEach(async () => {
    watcherNextMock = vi.fn().mockReturnValue(new Promise(() => {}));
    startModelWatcherMock = vi
      .spyOn(juju, "startModelWatcher")
      .mockResolvedValue({
        conn: client.conn,
        watcherHandle: { "watcher-id": "1" },
        pingerIntervalId: 1,
        // @ts-expect-error: mocks
        next: watcherNextMock,
      });
    stopModelWatcherMock = vi.spyOn(juju, "stopModelWatcher");
  });

  it("waits when connecting to AllWatcher", async () => {
    startModelWatcherMock.mockReturnValue(new Promise(() => {}));
    const { result } = await runHook();
    expect(result.current).toEqual({
      ready: false,
      deltas: [],
      error: null,
    });
    expect(watcherNextMock).not.toHaveBeenCalled();
  });

  it("connects to AllWatcher", async () => {
    const { result } = await runHook();
    expect(result.current).toEqual({
      ready: true,
      deltas: [],
      error: null,
      conn: expect.any(Object),
    });
    expect(startModelWatcherMock).toHaveBeenCalledOnce();
    expect(watcherNextMock).toHaveBeenCalledOnce();
    expect(stopModelWatcherMock).not.toHaveBeenCalled();
  });

  it("presents error whilst connecting", async () => {
    startModelWatcherMock.mockRejectedValue("timeout");
    const { result } = await runHook();
    expect(result.current).toEqual({
      ready: false,
      deltas: [],
      error: "timeout",
    });
    expect(watcherNextMock).not.toHaveBeenCalled();
  });

  it("doesn't attempt connection if modelUUID isn't provided", async () => {
    const { result } = await runHook("");
    expect(startModelWatcherMock).not.toHaveBeenCalled();
    expect(result.current).toEqual({ ready: false, deltas: [], error: null });
  });

  it("disconnects from AllWatcher", async () => {
    const { unmount } = await runHook();
    expect(stopModelWatcherMock).not.toHaveBeenCalled();
    await act(async () => {
      unmount();
    });
    expect(stopModelWatcherMock).toHaveBeenCalledOnce();
  });

  it("updates deltas once", async () => {
    watcherNextMock
      .mockResolvedValueOnce({
        deltas: [["model", "change", { uuid: "first" }]],
      })
      .mockReturnValueOnce(new Promise(() => {}));
    const { result } = await runHook();
    expect(watcherNextMock).toHaveBeenCalledTimes(2);
    expect(result.current.deltas).toEqual([
      ["model", "change", { uuid: "first" }],
    ]);
  });

  it("updates deltas repeatedly", async () => {
    const { promise, resolve } = Promise.withResolvers<AllWatcherNextResults>();
    watcherNextMock
      .mockResolvedValueOnce({
        deltas: [["model", "change", { uuid: "first" }]],
      })
      .mockReturnValueOnce(promise)
      .mockReturnValueOnce(new Promise(() => {}));
    const { result } = await runHook();
    expect(watcherNextMock).toHaveBeenCalledTimes(2);
    expect(result.current.deltas).toEqual([
      ["model", "change", { uuid: "first" }],
    ]);
    await act(async () => {
      resolve({ deltas: [["model", "change", { uuid: "second" }]] });
    });
    expect(watcherNextMock).toHaveBeenCalledTimes(3);
    expect(result.current.deltas).toEqual([
      ["model", "change", { uuid: "second" }],
    ]);
  });

  it("stops requesting deltas once unmounted", async () => {
    const { promise, resolve } = Promise.withResolvers<AllWatcherNextResults>();
    watcherNextMock.mockReturnValueOnce(promise);
    const { unmount } = await runHook();
    expect(watcherNextMock).toHaveBeenCalledTimes(1);
    unmount();
    await act(async () => {
      resolve({ deltas: [] });
    });
    expect(watcherNextMock).toHaveBeenCalledTimes(1);
  });
});
