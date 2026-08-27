import type {
  PayloadAction,
  PayloadActionCreator,
  PrepareAction,
} from "@reduxjs/toolkit";
import { createAction, isAction } from "@reduxjs/toolkit";
import type { Middleware } from "redux";

import type { Source } from "data";
import type { Events } from "data/source";
import type { RootState, Store } from "store/store";
import { hash } from "utils";

export class SourceManager<T, P extends O, O = P> {
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
    const sourceHash = hash(args, ["meta"]);

    // Ensure the source doesn't already exist.
    const existingSource = this.sources.get(sourceHash);
    if (existingSource) {
      return existingSource;
    }

    // Create the source, and add listeners to it.
    const source = this.createSource(args);
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

  public stop(args: O): void {
    const sourceHash = hash(args);
    const source = this.sources.get(sourceHash);
    if (!source) {
      return;
    }
    source.done();
    this.sources.delete(sourceHash);
  }

  public invalidate(args: O): void {
    const sourceHash = hash(args);
    const source = this.sources.get(sourceHash);
    if (!source) {
      return;
    }
    source.invalidate();
  }
}

type SourceHooks<P> = {
  addActionMeta?: (payload: P) => Record<string, unknown>;
  after?: (args: P, store: Pick<Store, "dispatch" | "getState">) => void;
};

export type SourceInstance<Payload, T> = {
  actions: {
    start: PayloadActionCreator<Payload, string, PrepareAction<Payload>>;
    stop: PayloadActionCreator<Payload, string, PrepareAction<Payload>>;
    invalidate: PayloadActionCreator<Payload, string, PrepareAction<Payload>>;
  };
  sourceActions: {
    setData: (args: Payload, data: T) => PayloadAction<unknown>;
    setLoading: (args: Payload, loading: boolean) => PayloadAction<unknown>;
    setError: (
      args: Payload,
      error: { message: string; source: Error } | null,
    ) => PayloadAction<unknown>;
  };
  hooks: SourceHooks<Payload>;
  createSource: () => SourceManager<
    T,
    { meta: Record<string, unknown> } & Payload,
    Payload
  >;
};

export default function createMiddleware<
  S extends SourceInstance<Payload, T>,
  Payload,
  T,
>(sources: S[]): Middleware<void, RootState, Store["dispatch"]> {
  return (store) => (next) => {
    const instances = sources.map(({ createSource, ...rest }) => ({
      ...rest,
      source: createSource(),
    }));
    return (action) => {
      if (!isAction(action)) {
        return next(action);
      }

      const source = instances.find(({ actions }) =>
        [actions.start, actions.stop, actions.invalidate].some((testAction) =>
          testAction.match(action),
        ),
      );
      if (!source) {
        return next(action);
      }

      if (source.actions.start.match(action)) {
        const actionPayload = action.payload as Payload;
        const actionMeta = (
          action as PayloadAction<Payload, string, Record<string, unknown>>
        ).meta as Record<string, unknown> | undefined;
        const args = Object.assign(
          {},
          actionPayload,
          actionMeta ? { meta: actionMeta } : undefined,
        );
        source.source.start(args, {
          data: (data) => {
            store.dispatch(source.sourceActions.setData(args, data));
            source.hooks.after?.(args, store);
          },
          load: () => {
            store.dispatch(source.sourceActions.setLoading(args, true));
          },
          loadEnd: () => {
            store.dispatch(source.sourceActions.setLoading(args, false));
          },
          error: (message, sourceError) => {
            store.dispatch(
              source.sourceActions.setError(args, {
                message,
                source: sourceError,
              }),
            );
          },
          errorCleared: () => {
            store.dispatch(source.sourceActions.setError(args, null));
          },
        });
      } else if (source.actions.stop.match(action)) {
        const args = action.payload as Payload;
        source.source.stop(args);
      } else if (source.actions.invalidate.match(action)) {
        const args = action.payload as Payload;
        source.source.invalidate(args);
      } else {
        // This shouldn't be possible to reach, but is necessary for when new actions are added.
        return next(action);
      }
      return;
    };
  };
}

/**
 * Wrap source for use in middleware. Sources are tracked by the arguments passed to the `start`
 * action.
 *
 * @param identifier A unique identifier for this source.
 * @param createSource A callback function to create a new source with the given arguments.
 * @param sourceActions A collection of actions to propagate the data and source state into the
 * backing store.
 * @param hooks A collection of callback function to run at various times when interacting with
 * the underlying store. **Warning:** This will be removed in the future once there are less
 * interactions between old and new polling implementations, so try not to rely on it.
 */
export function createSourceInstance<Payload, T>(
  identifier: string,
  createSource: (
    args: { meta: Record<string, unknown> } & Payload,
  ) => Source<T>,
  sourceActions: {
    setData: (args: Payload, data: T) => PayloadAction<unknown>;
    setLoading: (args: Payload, loading: boolean) => PayloadAction<unknown>;
    setError: (
      args: Payload,
      error: { message: string; source: Error } | null,
    ) => PayloadAction<unknown>;
  },
  hooks?: SourceHooks<Payload>,
): SourceInstance<Payload, T> {
  return {
    actions: {
      // WARN: Redux doesn't export the types needed to make this play nicely (`BaseActionCreator`),
      // so manually do the casting.
      start: createAction(
        `source/${identifier}/start`,
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
      ) as PayloadActionCreator<Payload, string, PrepareAction<Payload>>,
      stop: createAction<Payload>(
        `source/${identifier}/stop`,
      ) as PayloadActionCreator<Payload, string, PrepareAction<Payload>>,
      invalidate: createAction<Payload>(
        `source/${identifier}/invalidate`,
      ) as PayloadActionCreator<Payload, string, PrepareAction<Payload>>,
    },
    createSource: () => new SourceManager(createSource),
    sourceActions,
    hooks: hooks ?? {},
  };
}
