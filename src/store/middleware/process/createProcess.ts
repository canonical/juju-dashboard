import { createAction } from "@reduxjs/toolkit";

import type { Store } from "store/store";
import { toErrorString } from "utils";

import type { Hooks, Process, ProcessActions } from "./types";

export function createProcess<Payload, Status, Result>(
  identifier: string,
  runProcess: (
    payload: { meta: Record<string, unknown> } & Payload,
  ) => AsyncIterator<Status, Result, void>,
  processActions: ProcessActions<Payload, Status, Result>,
  hooks?: Hooks<Payload>,
): Process<Payload> {
  const actions = {
    run: createAction(`process/${identifier}/run`, (payload: Payload) => ({
      payload,
      meta: hooks?.addActionMeta?.(payload),
    })),
  };

  const start = async (
    payload: { meta: Record<string, unknown> } & Payload,
    dispatch: Store["dispatch"],
  ): Promise<void> => {
    // Mark as running.
    dispatch(processActions.setRunning(payload, true));

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
        dispatch(processActions.setOutcome(payload, { result: result.value }));
        return true;
      } else {
        // Status update.
        const action = processActions.setStatus?.(payload, result.value);
        if (action) {
          dispatch(action);
        }
        return false;
      }
    }

    // Continually poll from process iterator.
    while (true) {
      try {
        const result = await process.next();
        if (processIteratorResult(result)) {
          // Process completed.
          break;
        }
      } catch (error) {
        // Process has thrown an error, so store it.
        dispatch(
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
    dispatch(processActions.setRunning(payload, false));

    // Call any callback function.
    hooks?.after?.(payload, dispatch);
  };

  return { actions, start };
}
