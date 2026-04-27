import disableCommandProcess from "./block/disable-command";
import createMiddleware from "./middleware";
import type { Process } from "./types";

export type { ProcessOutcome, ProcessActions, Process } from "./types";

// Re-export actions to trigger processes.
export const disableCommand = disableCommandProcess.actions;

// Construct the middleware with process handlers.
export default createMiddleware([disableCommandProcess as Process<unknown>]);
