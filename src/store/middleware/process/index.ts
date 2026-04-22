import createMiddleware from "./middleware";
import { upgradeModelProcess } from "./model-upgrade";
import type { Process } from "./types";

export type { ProcessOutcome, ProcessActions, Process } from "./types";

// Re-export actions to trigger processes.
export const upgradeModel = upgradeModelProcess.actions;

// Construct the middleware with process handlers.
export default createMiddleware([upgradeModelProcess as Process<unknown>]);
