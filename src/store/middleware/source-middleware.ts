import type { ActionCreatorWithPayload, PayloadAction } from "@reduxjs/toolkit";
import { createAction, isAction } from "@reduxjs/toolkit";
import type { Middleware } from "redux";

import type { Source } from "data";
import type { Events } from "data/source";
import type { RootState, Store } from "store/store";
import { isSpecificAction } from "types";
import { hash } from "utils";

export class SourceManager<T, P> {
  private sources: Map<string, Source<T>>;
  private createSource: (args: P) => Source<T>;

  constructor(createSource: (args: P) => Source<T>) {
    this.sources = new Map();
    this.createSource = createSource;
  }

  public start(
    args: P,
    listeners?: Partial<{
      [Name in keyof Events<T>]: (...data: Events<T>[Name]) => unknown;
    }>,
  ): Source<T> {
    const sourceHash = hash(args);

    // Ensure the source doesn't already exist.
    const existingSource = this.sources.get(sourceHash);
    if (existingSource) {
      return existingSource;
    }

    // Create the source, and add listeners to it.
    const source = this.createSource(args);
    if (listeners) {
      for (const [event, handler] of Object.entries(listeners)) {
        // @ts-expect-error - `Object.entries` is lossy, and does not retain the correct types.
        source.on(event, handler);
      }
    }
    this.sources.set(sourceHash, source);
    return source;
  }

  public stop(args: P): void {
    const sourceHash = hash(args);
    const source = this.sources.get(sourceHash);
    if (!source) {
      return;
    }
    source.done();
    this.sources.delete(sourceHash);
  }

  public invalidate(args: P): void {
    const sourceHash = hash(args);
    const source = this.sources.get(sourceHash);
    if (!source) {
      return;
    }
    source.invalidate();
  }
}

export function createSourceMiddleware<T, P>(
  identifier: string,
  createSource: (args: P) => Source<T>,
  sourceActions: {
    setData: (args: P, data: T) => PayloadAction<unknown>;
    setLoading: (args: P, loading: boolean) => PayloadAction<unknown>;
    setError: (
      args: P,
      error: { message: string; source: unknown } | null,
    ) => PayloadAction<unknown>;
  },
): {
  middleware: Middleware<void, RootState, Store["dispatch"]>;
  actions: Record<
    "invalidate" | "start" | "stop",
    ActionCreatorWithPayload<P, string>
  >;
} {
  const actions = {
    start: createAction<P>(
      `source/${identifier}/start`,
    ) as ActionCreatorWithPayload<P, "start">,
    stop: createAction<P>(
      `source/${identifier}/stop`,
    ) as ActionCreatorWithPayload<P, "stop">,
    invalidate: createAction<P>(
      `source/${identifier}/invalidate`,
    ) as ActionCreatorWithPayload<P, "invalidate">,
  };

  return {
    middleware: (store) => (next) => {
      const sources = new SourceManager<T, P>(createSource);

      return (action) => {
        if (!isAction(action)) {
          return next(action);
        }

        if (
          isSpecificAction<ReturnType<typeof actions.start>>(
            action,
            actions.start.type,
          )
        ) {
          const args = action.payload as P;
          sources.start(args, {
            data: (data) => {
              store.dispatch(sourceActions.setData(args, data));
            },
            load: () => {
              store.dispatch(sourceActions.setLoading(args, true));
            },
            loadEnd: () => {
              store.dispatch(sourceActions.setLoading(args, false));
            },
            error: (message, sourceError) => {
              store.dispatch(
                sourceActions.setError(args, { message, source: sourceError }),
              );
            },
            errorCleared: () => {
              store.dispatch(sourceActions.setError(args, null));
            },
          });
        } else if (
          isSpecificAction<ReturnType<typeof actions.stop>>(
            action,
            actions.stop.type,
          )
        ) {
          const args = action.payload as P;
          sources.stop(args);
        } else if (
          isSpecificAction<ReturnType<typeof actions.invalidate>>(
            action,
            actions.invalidate.type,
          )
        ) {
          const args = action.payload as P;
          sources.invalidate(args);
        } else {
          // Pass the action down the handler chain.
          return next(action);
        }
        return;
      };
    },
    actions,
  };
}
