import { isAction, type Middleware } from "@reduxjs/toolkit";

import type { RootState, Store } from "store/store";
import { isMetaAction } from "types";

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
        const actionPayload = action.payload;
        const actionMeta = isMetaAction(action)
          ? { meta: action.meta }
          : undefined;
        const payload = Object.assign({}, actionPayload, actionMeta);
        await process.start(payload, store.dispatch);
        return;
      } else {
        // This shouldn't be possible to reach, but is necessary for when new actions are added.
        return next(action);
      }
    };
  };
}
