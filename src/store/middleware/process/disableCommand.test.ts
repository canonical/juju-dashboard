import type {
  BlockSwitchParams,
  ErrorResult,
} from "@canonical/jujulib/dist/api/facades/block/BlockV2";

import type { ConnectionWithFacades } from "juju/types";
import { actions as jujuActions } from "store/juju";
import type { Store } from "store/store";

import disableCommand, { Label, type Payload } from "./disableCommand";

describe("disableCommand process", () => {
  let dispatch: Store["dispatch"];
  let params: BlockSwitchParams;
  let payload: { meta: Record<string, unknown> } & Payload;

  beforeEach(() => {
    dispatch = vi.fn();
    params = { type: "BlockChange" };
    payload = {
      connection: {
        facades: {
          block: {
            switchBlockOn: vi.fn(),
          },
        },
      } as unknown as ConnectionWithFacades,
      modelUUID: "model-uuid-123",
      wsControllerURL: "wss://example.com",
      params,
      meta: {},
    };
  });

  it("creates a run action with the provided payload", () => {
    const action = disableCommand.actions.run({
      connection: payload.connection,
      modelUUID: payload.modelUUID,
      wsControllerURL: payload.wsControllerURL,
      params: payload.params,
    });

    expect(action).toEqual({
      type: "process/disableCommand/run",
      payload: {
        connection: payload.connection,
        modelUUID: "model-uuid-123",
        wsControllerURL: "wss://example.com",
        params,
      },
      meta: undefined,
    });
  });

  it("calls switchBlockOn and dispatches success outcome", async () => {
    const result = {
      error: null,
    } as unknown as ErrorResult;
    const switchBlockOn = vi.fn().mockResolvedValue(result);
    payload.connection = {
      facades: {
        block: {
          switchBlockOn,
        },
      },
    } as unknown as ConnectionWithFacades;

    await disableCommand.start(payload, dispatch);

    expect(switchBlockOn).toHaveBeenCalledExactlyOnceWith(params);
    expect(dispatch).toHaveBeenNthCalledWith(
      1,
      jujuActions.setBlockState({
        modelUUID: "model-uuid-123",
        wsControllerURL: "wss://example.com",
      }),
    );
    expect(dispatch).toHaveBeenNthCalledWith(
      2,
      jujuActions.setBlockOutcome({
        modelUUID: "model-uuid-123",
        wsControllerURL: "wss://example.com",
        outcome: {
          result,
        },
      }),
    );
    expect(dispatch).toHaveBeenNthCalledWith(
      3,
      jujuActions.setBlockState({
        modelUUID: "model-uuid-123",
        wsControllerURL: "wss://example.com",
      }),
    );
  });

  it("stores an error outcome when the block facade is missing", async () => {
    payload.connection = {
      facades: {},
    } as unknown as ConnectionWithFacades;

    await disableCommand.start(payload, dispatch);

    expect(dispatch).toHaveBeenNthCalledWith(
      1,
      jujuActions.setBlockState({
        modelUUID: "model-uuid-123",
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
      jujuActions.setBlockState({
        modelUUID: "model-uuid-123",
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
    payload.connection = {
      facades: {
        block: {
          switchBlockOn,
        },
      },
    } as unknown as ConnectionWithFacades;

    await disableCommand.start(payload, dispatch);

    expect(switchBlockOn).toHaveBeenCalledExactlyOnceWith(params);
    const [, [outcomeAction]] = (dispatch as ReturnType<typeof vi.fn>).mock
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
