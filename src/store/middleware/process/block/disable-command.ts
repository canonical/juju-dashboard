import type { BlockSwitchParams } from "@canonical/jujulib/dist/api/facades/block/BlockV2";

import type { ConnectionWithFacades } from "juju/types";
import { actions as jujuActions } from "store/juju";

import { hasConnections } from "../../connection/util";
import { createProcess } from "../createProcess";

const REQUIRED_CONNECTIONS = ["wsControllerURL", "modelURL"];

export enum Label {
  NO_BLOCK_FACADE_ERROR = "Block facade is not available on the connection",
  MISSING_CONNECTION_ERROR = "connection not provided",
}

export type Payload = {
  modelUUID: string;
  modelURL: string;
  wsControllerURL: string;
  params: BlockSwitchParams;
};

export type BlockStatus = { status: "initiated" | "pending" };

export async function* runBlock(
  params: BlockSwitchParams,
  modelConnection: ConnectionWithFacades,
): AsyncGenerator<BlockStatus, void, void> {
  if (!modelConnection.facades.block) {
    throw new Error(Label.NO_BLOCK_FACADE_ERROR);
  }
  const request = modelConnection.facades.block.switchBlockOn(params);
  yield { status: "pending" };
  const result = await request;
  if (result.error) {
    throw result.error;
  }
  yield { status: "initiated" };
  return;
}

export default createProcess<Payload, BlockStatus, void>(
  "block/disable-command",
  async function* ({ params, meta }): AsyncGenerator<BlockStatus, void, void> {
    if (!hasConnections(meta, REQUIRED_CONNECTIONS)) {
      throw new Error(Label.MISSING_CONNECTION_ERROR);
    }

    const modelConnection = meta.connections.modelURL;

    return yield* runBlock(params, modelConnection);
  },
  {
    setStatus: (payload, status) =>
      jujuActions.setBlockStatus({
        modelUUID: payload.modelUUID,
        status: status.status,
        wsControllerURL: payload.wsControllerURL,
      }),
    setRunning: (payload, running) =>
      jujuActions.setBlockRunning({
        modelUUID: payload.modelUUID,
        running,
        wsControllerURL: payload.wsControllerURL,
      }),
    setOutcome: (payload, outcome) =>
      jujuActions.setBlockOutcome({
        modelUUID: payload.modelUUID,
        outcome,
        wsControllerURL: payload.wsControllerURL,
      }),
  },
  {
    addActionMeta: (_payload) => ({
      withConnection: true,
      connectionList: REQUIRED_CONNECTIONS,
    }),
  },
);
