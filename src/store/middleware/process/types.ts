import type {
  PayloadAction,
  PayloadActionCreator,
  PrepareAction,
} from "@reduxjs/toolkit";

import type { Store } from "store/store";

export type Hooks<P> = {
  addActionMeta?: (payload: P) => Record<string, unknown>;
  after?: (args: P, store: Store["dispatch"]) => void;
};

export type ProcessOutcome<Result> =
  | { error: { message: string; source: unknown } }
  | { result: Result };

export type ProcessActions<Payload, Status, Result> = {
  setStatus: (
    payload: Payload,
    status: Status,
  ) => PayloadAction<unknown> | void;
  setRunning: (payload: Payload, running: boolean) => PayloadAction<unknown>;
  setOutcome: (
    payload: Payload,
    outcome: ProcessOutcome<Result>,
  ) => PayloadAction<unknown>;
};

export type Process<Payload> = {
  actions: {
    run: PayloadActionCreator<Payload, string, PrepareAction<Payload>>;
  };
  start: (
    payload: { meta: Record<string, unknown> } & Payload,
    dispatch: Store["dispatch"],
  ) => Promise<void>;
};
