import type { PayloadAction } from "@reduxjs/toolkit";
import { createAction } from "@reduxjs/toolkit";

import type { Store } from "store/store";
import { toErrorString } from "utils";
import { logger } from "utils/logger";

export class ProcessCancelled {
  public reason: unknown;
  constructor(reason: unknown) {
    this.reason = reason;
  }
}

type Hooks<P> = {
  addActionMeta?: (payload: P) => Record<string, unknown>;
};

export function createProcess<Payload, Status, Result>(
  identifier: string,
  runProcess: (payload: Payload) => AsyncIterator<Status, Result, void>,
  processActions: {
    setStatus: (payload: Payload, status: Status) => PayloadAction<unknown>;
    setRunning: (payload: Payload, running: boolean) => PayloadAction<unknown>;
    setOutcome: (
      payload: Payload,
      outcome:
        | { error: { message: string; source: unknown } }
        | { result: Result },
    ) => PayloadAction<unknown>;
  },
  hooks: Hooks<Payload>,
) {
  const actions = {
    run: createAction(
      `process/${identifier}/run`,
      (
        payload: Payload,
      ): { payload: Payload; meta?: Record<string, unknown> } =>
        Object.assign(
          {
            payload,
          },
          hooks?.addActionMeta
            ? { meta: hooks.addActionMeta(payload) }
            : undefined,
        ),
    ),
    cancel: createAction(`process/${identifier}/cancel`),
  };

  const start = async (
    store: Store,
    payload: Payload,
    signal: AbortSignal,
  ): Promise<void> => {
    // Mark as running.
    store.dispatch(processActions.setRunning(payload, true));

    // Begin running.
    const process = runProcess(payload);

    /**
     * For the given iterator result, dispatch into the store as a status update or result, using
     * the provided action.
     *
     * @returns `true` if this is the last result from the iterator.
     */
    function processIteratorResult(
      result: IteratorResult<Status, Result>,
    ): boolean {
      if (result.done) {
        // Final item from this iterator, set the outcome.
        store.dispatch(
          processActions.setOutcome(payload, { result: result.value }),
        );
        return true;
      } else {
        // Status update.
        store.dispatch(processActions.setStatus(payload, result.value));
        return false;
      }
    }

    // Listen on provided abort signal, to cancel the iterator.
    signal.addEventListener(
      "abort",
      () => {
        if (!process.throw) {
          logger.warn(`cannot abort process: ${identifier}`, payload);
          return;
        }

        void process
          .throw(new ProcessCancelled(signal.reason))
          // Allow processing of final item.
          .then(processIteratorResult);
      },
      { once: true },
    );

    // Continually poll from process iterator.
    while (!signal.aborted) {
      try {
        const result = await process.next();
        if (processIteratorResult(result)) {
          // Process completed.
          break;
        }
      } catch (error) {
        // Process has thrown an error, so store it.
        store.dispatch(
          processActions.setOutcome(payload, {
            error: {
              message: toErrorString(error),
              source: error,
            },
          }),
        );
        break;
      }
    }

    // Mark process as not running.
    store.dispatch(processActions.setRunning(payload, false));
  };

  return { actions, start };
}
