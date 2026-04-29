import type { BlockSwitchParams } from "@canonical/jujulib/dist/api/facades/block/BlockV2";

import { DisableType } from "pages/AddModel/ConfigsConstraints/types";
import type { ManagedConnection } from "store/middleware/connection/connection-manager";

import disableCommand, { Label, runBlock } from "./disable-command";

describe("runBlock", () => {
  let params: BlockSwitchParams;
  let modelConnection: ManagedConnection;
  let setBlockFacade: (switchBlockOn: ReturnType<typeof vi.fn>) => void;

  beforeEach(() => {
    params = { type: DisableType.ALL };
    modelConnection = { facades: {} } as ManagedConnection;
    setBlockFacade = (switchBlockOn): void => {
      (modelConnection.facades as Record<string, unknown>).block = {
        switchBlockOn,
      };
    };
    setBlockFacade(vi.fn());
  });

  it("calls switchBlockOn and yields pending then initiated", async ({
    expect,
  }) => {
    expect.assertions(4);
    const switchBlockOn = vi.fn().mockResolvedValue({ error: undefined });
    setBlockFacade(switchBlockOn);
    const progress = runBlock(params, modelConnection);

    await expect(progress.next()).resolves.toEqual({
      done: false,
      value: { status: "pending" },
    });
    await expect(progress.next()).resolves.toEqual({
      done: false,
      value: { status: "initiated" },
    });
    await expect(progress.next()).resolves.toEqual({
      done: true,
      value: undefined,
    });

    expect(switchBlockOn).toHaveBeenCalledExactlyOnceWith(params);
  });

  it("throws an error when block facade is missing", async ({ expect }) => {
    expect.assertions(1);
    modelConnection.facades = {};
    const progress = runBlock(params, modelConnection);

    await expect(progress.next()).rejects.toThrowError(
      Label.NO_BLOCK_FACADE_ERROR,
    );
  });

  it("throws an error when switchBlockOn rejects", async ({ expect }) => {
    expect.assertions(2);
    const error = new Error("boom");
    const switchBlockOn = vi.fn().mockRejectedValue(error);
    setBlockFacade(switchBlockOn);
    const progress = runBlock(params, modelConnection);

    await expect(progress.next()).resolves.toEqual({
      done: false,
      value: { status: "pending" },
    });
    await expect(progress.next()).rejects.toThrowError("boom");
  });

  it("throws an error when switchBlockOn resolves with an error", async ({
    expect,
  }) => {
    expect.assertions(2);
    const switchError = new Error("request failed");
    const switchBlockOn = vi.fn().mockResolvedValue({ error: switchError });
    setBlockFacade(switchBlockOn);
    const progress = runBlock(params, modelConnection);

    await expect(progress.next()).resolves.toEqual({
      done: false,
      value: { status: "pending" },
    });
    await expect(progress.next()).rejects.toThrowError("request failed");
  });
});

describe("action", () => {
  it("contains meta properties", ({ expect }) => {
    const action = disableCommand.actions.run({
      wsControllerURL: "wss://example.com/api",
      modelURL: "wss://example.com/model/abc123/api",
      modelUUID: "abc123",
      params: { type: DisableType.ALL },
    });

    expect(action).toEqual(
      expect.objectContaining({
        meta: {
          withConnection: true,
          connectionList: ["wsControllerURL", "modelURL"],
        },
      }),
    );
  });
});
