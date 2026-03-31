import type { PayloadAction, PayloadActionCreator } from "@reduxjs/toolkit";
import { createAction, isAction } from "@reduxjs/toolkit";
import type { Middleware } from "redux";

import type { Source } from "data";
import type { Events } from "data/source";
import type { ConnectionWithFacades } from "juju/types";
import type { RootState, Store } from "store/store";
import { isSpecificAction } from "types";
import { hash } from "utils";

export class SourceManager<T, P> {
  private sources: Map<string, Source<T>>;
  private createSource: (args: P, extra: Extra) => Source<T>;

  constructor(createSource: (args: P, extra: Extra) => Source<T>) {
    this.sources = new Map();
    this.createSource = createSource;
  }

  public start(
    args: P,
    extra: Extra,
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
    const source = this.createSource(args, extra);
    if (listeners) {
      for (const [event, handler] of Object.entries(listeners)) {
        source.on(
          event as keyof Events<T>,
          handler as (...data: Events<T>[keyof Events<T>]) => unknown,
        );
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

type Extra = {
  connection?: ConnectionWithFacades;
};

/**
 * Create a redux middleware for a given source. Sources are tracked by the arguments passed to
 * the `start` action.
 *
 * @param identifier A unique identifier for this source.
 * @param createSource A callback function to create a new source with the given arguments.
 * @param sourceActions A collection of actions to propagate the data and source state into the
 * backing store.
 * @param hooks A collection of callback function to run at various times when interacting with
 * the underlying store. **Warning:** This will be removed in the future once there are less
 * interactions between old and new polling implementations, so try not to rely on it.
 */
export function createSourceMiddleware<T, P>(
  identifier: string,
  createSource: (args: P, extra: Extra) => Source<T>,
  sourceActions: {
    setData: (args: P, data: T) => PayloadAction<unknown>;
    setLoading: (args: P, loading: boolean) => PayloadAction<unknown>;
    setError: (
      args: P,
      error: { message: string; source: unknown } | null,
    ) => PayloadAction<unknown>;
  },
  hooks?: {
    after?: (args: P, store: Pick<Store, "dispatch" | "getState">) => void;
  },
): {
  middleware: Middleware<void, RootState, Store["dispatch"]>;
  actions: Record<
    "invalidate" | "start" | "stop",
    PayloadActionCreator<P, string>
  >;
} {
  const actions = {
    start: createAction<P>(
      `source/${identifier}/start`,
    ) as PayloadActionCreator<P, "start">,
    stop: createAction<P>(`source/${identifier}/stop`) as PayloadActionCreator<
      P,
      "stop"
    >,
    invalidate: createAction<P>(
      `source/${identifier}/invalidate`,
    ) as PayloadActionCreator<P, "invalidate">,
  };

  return {
    middleware: (store) => (next) => {
      const sources = new SourceManager<T, P>(createSource);

      return (action) => {
        if (!isAction(action)) {
          return next(action);
        }

        if (actions.start.match(action)) {
          const args = action.payload as P;
          sources.start(
            args,
            {
              // @ts-expect-error - Redux action types do not carry `meta` field
              connection: action.meta?.connection as
                | ConnectionWithFacades
                | undefined,
            },
            {
              data: (data) => {
                store.dispatch(sourceActions.setData(args, data));
                hooks?.after?.(args, store);
              },
              load: () => {
                store.dispatch(sourceActions.setLoading(args, true));
              },
              loadEnd: () => {
                store.dispatch(sourceActions.setLoading(args, false));
              },
              error: (message, sourceError) => {
                store.dispatch(
                  sourceActions.setError(args, {
                    message,
                    source: sourceError,
                  }),
                );
              },
              errorCleared: () => {
                store.dispatch(sourceActions.setError(args, null));
              },
            },
          );
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
