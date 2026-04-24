import disableCommandProcess from "./disableCommand";
import createMiddleware from "./middleware";
import type { Process } from "./types";

export type { ProcessOutcome, ProcessActions, Process } from "./types";

// Construct the middleware with process handlers.
export default createMiddleware([disableCommandProcess as Process<unknown>]);
