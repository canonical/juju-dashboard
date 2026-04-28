import { Connection } from "@canonical/jujulib";
import type { BlockSwitchParams } from "@canonical/jujulib/dist/api/facades/block/BlockV2";

import { actions as jujuActions } from "store/juju";
import type { ManagedConnection } from "store/middleware/connection/connection-manager";
import type { Store } from "store/store";

import disableCommand, { Label, type Payload } from "./disable-command";

describe("disableCommand process", () => {
  let dispatch: Store["dispatch"];
  let params: BlockSwitchParams;
  let payload: { meta: Record<string, unknown> } & Payload;
  let modelConnection: Connection;

  beforeEach(() => {
    dispatch = vi.fn();
    params = { type: "BlockChange" };
    modelConnection = {} as ManagedConnection;
    const controllerConnection = {} as ManagedConnection;
    Object.setPrototypeOf(modelConnection, Connection.prototype);
    Object.setPrototypeOf(controllerConnection, Connection.prototype);
    modelConnection.facades = {
      block: {
        switchBlockOn: vi.fn(),
      },
    };

    payload = {
      modelUUID: "model-uuid-123",
      modelURL: "wss://example.com/model/model-uuid-123/api",
      wsControllerURL: "wss://example.com",
      params,
      meta: {
        connections: {
          modelURL: modelConnection,
          wsControllerURL: controllerConnection,
        },
      },
    };
  });

  it("creates a run action with the provided payload", () => {
    const action = disableCommand.actions.run({
      modelUUID: payload.modelUUID,
      modelURL: payload.modelURL,
      wsControllerURL: payload.wsControllerURL,
      params: payload.params,
    });

    expect(action).toEqual({
      type: "process/block/disable-command/run",
      payload: {
        modelUUID: "model-uuid-123",
        modelURL: "wss://example.com/model/model-uuid-123/api",
        wsControllerURL: "wss://example.com",
        params,
      },
      meta: {
        withConnection: true,
        connectionList: ["wsControllerURL", "modelURL"],
      },
    });
  });

  it("calls switchBlockOn and dispatches success outcome", async () => {
    const result = {
      error: undefined,
    };
    const switchBlockOn = vi.fn().mockResolvedValue(result);
    modelConnection.facades = {
      block: {
        switchBlockOn,
      },
    };

    await disableCommand.start(payload, dispatch);

    expect(switchBlockOn).toHaveBeenCalledExactlyOnceWith(params);
    expect(dispatch).toHaveBeenNthCalledWith(
      1,
      jujuActions.setBlockRunning({
        modelUUID: "model-uuid-123",
        running: true,
        wsControllerURL: "wss://example.com",
      }),
    );
    expect(dispatch).toHaveBeenNthCalledWith(
      2,
      jujuActions.setBlockStatus({
        modelUUID: "model-uuid-123",
        status: "pending",
        wsControllerURL: "wss://example.com",
      }),
    );
    expect(dispatch).toHaveBeenNthCalledWith(
      3,
      jujuActions.setBlockStatus({
        modelUUID: "model-uuid-123",
        status: "initiated",
        wsControllerURL: "wss://example.com",
      }),
    );
    expect(dispatch).toHaveBeenNthCalledWith(
      4,
      jujuActions.setBlockOutcome({
        modelUUID: "model-uuid-123",
        wsControllerURL: "wss://example.com",
        outcome: {
          result: undefined,
        },
      }),
    );
    expect(dispatch).toHaveBeenNthCalledWith(
      5,
      jujuActions.setBlockRunning({
        modelUUID: "model-uuid-123",
        running: false,
        wsControllerURL: "wss://example.com",
      }),
    );
  });

  it("stores an error outcome when the block facade is missing", async () => {
    modelConnection.facades = {};
    await disableCommand.start(payload, dispatch);

    expect(dispatch).toHaveBeenNthCalledWith(
      1,
      jujuActions.setBlockRunning({
        modelUUID: "model-uuid-123",
        running: true,
        wsControllerURL: "wss://example.com",
      }),
    );
    expect(dispatch).toHaveBeenNthCalledWith(
      2,
      jujuActions.setBlockOutcome({
        modelUUID: "model-uuid-123",
        wsControllerURL: "wss://example.com",
        outcome: {
          error: {
            message: Label.NO_BLOCK_FACADE_ERROR,
            source: new Error(Label.NO_BLOCK_FACADE_ERROR),
          },
        },
      }),
    );
    expect(dispatch).toHaveBeenNthCalledWith(
      3,
      jujuActions.setBlockRunning({
        modelUUID: "model-uuid-123",
        running: false,
        wsControllerURL: "wss://example.com",
      }),
    );

    const [, [outcomeAction]] = (dispatch as ReturnType<typeof vi.fn>).mock
      .calls;
    expect(outcomeAction.type).toBe("juju/setBlockOutcome");
    expect(outcomeAction.payload.outcome.error.message).toBe(
      Label.NO_BLOCK_FACADE_ERROR,
    );
    expect(outcomeAction.payload.outcome.error.source).toBeInstanceOf(Error);
  });

  it("stores an error outcome when switchBlockOn rejects", async () => {
    const error = new Error("boom");
    const switchBlockOn = vi.fn().mockRejectedValue(error);
    modelConnection.facades = {
      block: {
        switchBlockOn,
      },
    };

    await disableCommand.start(payload, dispatch);

    expect(switchBlockOn).toHaveBeenCalledExactlyOnceWith(params);
    expect(dispatch).toHaveBeenNthCalledWith(
      2,
      jujuActions.setBlockStatus({
        modelUUID: "model-uuid-123",
        status: "pending",
        wsControllerURL: "wss://example.com",
      }),
    );
    const [, , [outcomeAction]] = (dispatch as ReturnType<typeof vi.fn>).mock
      .calls;
    expect(outcomeAction).toEqual(
      jujuActions.setBlockOutcome({
        modelUUID: "model-uuid-123",
        wsControllerURL: "wss://example.com",
        outcome: {
          error: {
            message: "boom",
            source: error,
          },
        },
      }),
    );
  });
});
