import type { PayloadAction } from "@reduxjs/toolkit";
import { isAction, type Middleware } from "@reduxjs/toolkit";

import type { RootState, Store } from "store/store";

import type { Process } from "./types";

export default function createMiddleware<P extends Process<Payload>, Payload>(
  processes: P[],
): Middleware<void, RootState, Store["dispatch"]> {
  return (store) => (next) => {
    return async (action) => {
      // Don't bother trying to process if not a normal action.
      if (!isAction(action)) {
        return next(action);
      }

      const process = processes.find(({ actions }) =>
        actions.run.match(action),
      );
      if (!process) {
        return next(action);
      }

      if (process.actions.run.match(action)) {
        const actionPayload = action.payload as Payload;
        const actionMeta = (
          action as PayloadAction<Payload, string, Record<string, unknown>>
        ).meta as Record<string, unknown> | undefined;
        const payload = Object.assign(
          {},
          actionPayload,
          actionMeta ? { meta: actionMeta } : undefined,
        );
        await process.start(payload, store.dispatch);
        return;
      } else {
        // This shouldn't be possible to reach, but is necessary for when new actions are added.
        return next(action);
      }
    };
  };
}
