import { logger } from "utils/logger";

import { type Source, SourceState, type Events } from "./source";

export type SourceBase<T> = {
  /**
   * Begin a load operation, causing the source to set `loading`
   * to `true`. If the provided promise resolves, the source will
   * be updated to use its result as the latest data. Otherwise
   * if it rejects, the source will be put in an error state.
   *
   * @param data - A promise which will resolve with the loaded
   * data, or reject with an error.
   *
   * @param signal - Signal to indicate that this load event was
   * cancelled.
   */
  load: (data: Promise<T>, signal?: AbortSignal) => void;

  /**
   * Signal to indicate when the data source is complete, and can
   * be cleaned up.
   */
  sourceDone: AbortSignal;
};

export type SourceHooks = {
  /**
   * Callback when the data should be re-fetched.
   */
  refetch: () => void;
};

class SourceIteratorStopped extends Error {
  constructor() {
    super(`This error was used to stop a source`);
  }
}

export function createSource<T>(
  setup: (base: SourceBase<T>) => SourceHooks,
): Source<T> {
  // Abort controller to cleanup source when it is no longer in use.
  const sourceDone = new AbortController();

  // Hooks provided from setup function.
  let hooks: null | SourceHooks = null;

  // Collection of event listeners.
  const events: {
    [Name in keyof Events<T>]: ((...data: Events<T>[Name]) => void)[];
  } = {
    data: [],
    error: [],
    errorCleared: [],
    load: [],
    loadEnd: [],
  };

  const source: Source<T> = {
    invalidate: (): void => {
      hooks?.refetch();
      source.state = SourceState.Stale;
    },
    done: (): void => {
      sourceDone.abort();
    },
    state: SourceState.Unknown,
    loading: false,
    data: null,
    error: null,
    on: (event, handler) => {
      // Wrap the handler in a try/catch so that any thrown errors don't crash the source.
      const safeHandler: typeof handler = (...args) => {
        try {
          handler(...args);
        } catch (error) {
          // Ignore any errors thrown by the callback function.
          logger.error("Uncaught error thrown by source event handler:");
          logger.error(error);
          return;
        }
      };

      // Capture the callback function.
      events[event].push(safeHandler);

      // Unsubscribe callback.
      return () => {
        // Find the index of the callback.
        const index = events[event].indexOf(safeHandler);
        // Remove it.
        events[event].splice(index, 1);
      };
    },
    async *[Symbol.asyncIterator]() {
      // Create the stop error here to capture the stacktrace.
      const sourceStoppedError = new SourceIteratorStopped();

      let promise = Promise.withResolvers<T>();
      // Capture incoming data, and resolve the current promise.
      const unsubscribe = this.on("data", (data) => {
        promise.resolve(data);
      });
      let running = true;
      // When the source is complete, reject the existing promise.
      sourceDone.signal.addEventListener(
        "abort",
        () => {
          if (running) {
            promise.reject(sourceStoppedError);
          }
        },
        { once: true },
      );
      try {
        // Constantly await the next value, and yield it.
        while (!sourceDone.signal.aborted) {
          const value = await promise.promise;
          // Immediately replace the promise to ensure it doesn't get missed.
          promise = Promise.withResolvers();
          yield value;
        }
      } catch (error) {
        // Ignore the specific error used to stop the source.
        if (error !== sourceStoppedError) {
          throw error;
        }
      } finally {
        // Ensure the event listener is unsubscribed.
        unsubscribe();
        running = false;
      }
    },
  };

  // ID of the next load to begin.
  let nextLoadId = 0;
  // ID of the most recently completed load.
  let latestCompletedLoad = -1;
  // ID of the most recently successful completed load.
  let latestSuccessfulLoad = -1;

  /**
   * Helper to selectively update `source`, ensuring that some fields can only be updated by the
   * most recent load. This prevents data races.
   */
  function modifySource(
    loadId: number,
    modifications: Partial<Source<T>>,
  ): void {
    let dataChanged = false;
    let errorChanged = false;
    let loadingChanged = false;

    // This load is the latest one to have completed.
    if (loadId >= latestCompletedLoad) {
      if (
        modifications.error !== undefined &&
        modifications.error !== source.error
      ) {
        source.error = modifications.error;
        errorChanged = true;
      }

      source.state = modifications.state ?? source.state;
    }

    // This load is the latest one to complete successfully.
    if (loadId >= latestSuccessfulLoad) {
      if (
        modifications.data !== undefined &&
        modifications.data !== source.data
      ) {
        source.data = modifications.data;
        dataChanged = true;
      }
    }

    // This load was the last one to begin, so it can change the loading status.
    if (loadId >= nextLoadId - 1) {
      loadingChanged =
        modifications.loading !== undefined &&
        modifications.loading !== source.loading;
      source.loading = modifications.loading ?? source.loading;
    }

    // Run event handlers for data, if required.
    if (dataChanged && source.data) {
      for (const handler of events.data) {
        handler(source.data);
      }
    }

    // Run event handlers for error, if required.
    if (errorChanged) {
      if (source.error) {
        for (const handler of events.error) {
          handler(source.error.message, source.error.source);
        }
      } else {
        for (const handler of events.errorCleared) {
          handler();
        }
      }
    }

    if (loadingChanged && !source.loading) {
      for (const handler of events.loadEnd) {
        handler();
      }
    }
  }

  /**
   * Helper to correctly format an error.
   */
  function handleError(error: unknown): NonNullable<Source<unknown>["error"]> {
    // Extract the message of the error.
    let message = "An unknown error occurred";
    if (error instanceof Error) {
      ({ message } = error);
    }

    return { source: error, message };
  }

  // `SourceBase` to pass to the source setup.
  const base: SourceBase<T> = {
    load: (dataPromise: Promise<T>, signal?: AbortSignal) => {
      if (sourceDone.signal.aborted) {
        throw new Error("cannot load after source done");
      }

      // Get the next load ID.
      const loadId = nextLoadId++;

      // Always mark the source as loading.
      source.loading = true;

      // If the signal aborts, try mark this load as incomplete.
      signal?.addEventListener("abort", () => {
        modifySource(loadId, { loading: false });
      });

      // Trigger all of the `load` event listeners.
      for (const handler of events.load) {
        handler(dataPromise);
      }

      void (async (): Promise<void> => {
        try {
          const data = await dataPromise;

          if (signal?.aborted) {
            return;
          }

          modifySource(loadId, {
            loading: false,
            data,
            error: null,
            state: SourceState.Valid,
          });

          // Track this as the last successful load.
          latestSuccessfulLoad = Math.max(loadId, latestSuccessfulLoad);

          return;
        } catch (error) {
          if (signal?.aborted) {
            return;
          }

          modifySource(loadId, {
            loading: false,
            error: handleError(error),
            state: SourceState.Error,
          });

          return;
        } finally {
          // Track the latest load to complete, favouring the latest one.
          latestCompletedLoad = Math.max(loadId, latestCompletedLoad);
        }
      })();
    },
    sourceDone: sourceDone.signal,
  };

  // Run the setup function, to produce hooks into the source.
  try {
    hooks = setup(base);
  } catch (error) {
    // Handle an error that occurs during setup.
    modifySource(Infinity, {
      error: handleError(error),
      state: SourceState.Error,
      loading: false,
    });
  }

  return source;
}
