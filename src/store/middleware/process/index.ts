import disableCommandProcess from "./block/disable-command";
import createMiddleware from "./middleware";
import { upgradeModelProcess, upgradeToProcess } from "./model-upgrade";
import type { Process } from "./types";

export type { ProcessOutcome, ProcessActions, Process } from "./types";

// Re-export actions to trigger processes.
export const disableCommand = disableCommandProcess.actions;
export const upgradeTo = upgradeToProcess.actions;
export const upgradeModel = upgradeModelProcess.actions;

// Construct the middleware with process handlers.
export default createMiddleware([
  disableCommandProcess as Process<unknown>,
  upgradeToProcess as Process<unknown>,
  upgradeModelProcess as Process<unknown>,
]);
