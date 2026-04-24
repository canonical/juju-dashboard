import type {
  BlockSwitchParams,
  ErrorResult,
} from "@canonical/jujulib/dist/api/facades/block/BlockV2";
import { createAction } from "@reduxjs/toolkit";

import type { ConnectionWithFacades } from "juju/types";
import { actions as jujuActions } from "store/juju";

import { createProcess } from "./createProcess";
import type { ProcessActions } from "./types";

export enum Label {
  NO_BLOCK_FACADE_ERROR = "Block facade is not available on the connection",
}

export type Payload = {
  connection: ConnectionWithFacades;
  modelUUID: string;
  wsControllerURL: string;
  params: BlockSwitchParams;
};

// eslint-disable-next-line require-yield
async function* runBlock(
  payload: { meta: Record<string, unknown> } & Payload,
): AsyncGenerator<void, ErrorResult, void> {
  if (!payload.connection.facades.block) {
    throw new Error(Label.NO_BLOCK_FACADE_ERROR);
  }
  return await payload.connection.facades.block.switchBlockOn(payload.params);
}

// setStatus is required by ProcessActions but never invoked for a process
// with no intermediate status yields.
const noOp = createAction("process/disableCommand/noop");

const processActions: ProcessActions<Payload, void, ErrorResult> = {
  setStatus: () => noOp(),
  setRunning: (payload) =>
    jujuActions.setBlockState({
      modelUUID: payload.modelUUID,
      wsControllerURL: payload.wsControllerURL,
    }),
  setOutcome: (payload, outcome) =>
    jujuActions.setBlockOutcome({
      modelUUID: payload.modelUUID,
      outcome,
      wsControllerURL: payload.wsControllerURL,
    }),
};

export default createProcess("disableCommand", runBlock, processActions);
