import type { Source, Events } from "./source";

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
    load: [],
  };

  const source: Source<T> = {
    invalidate: (): void => {
      hooks?.refetch();
      source.state = "stale";
    },
    done: (): void => {
      sourceDone.abort();
    },
    state: "unknown",
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

    // This load is the latest one to have completed.
    if (loadId >= latestCompletedLoad) {
      if (
        modifications.error != undefined &&
        modifications.error != source.error
      ) {
        source.error = modifications.error;
        errorChanged = true;
      }

      source.state = modifications.state ?? source.state;
    }

    // This load is the latest one to complete successfully.
    if (loadId >= latestSuccessfulLoad) {
      if (
        modifications.data != undefined &&
        modifications.data != source.data
      ) {
        source.data = modifications.data;
        dataChanged = true;
      }
    }

    // This load was the last one to begin, so it can change the loading status.
    if (loadId >= nextLoadId - 1) {
      source.loading = modifications.loading ?? source.loading;
    }

    // Run event handlers for data, if required.
    if (dataChanged && source.data) {
      for (const handler of events.data) {
        handler(source.data);
      }
    }

    // Run event handlers for error, if required.
    if (errorChanged && source.error) {
      for (const handler of events.error) {
        handler(source.error.message, source.error.source);
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

      void dataPromise
        .then((data) => {
          if (signal?.aborted) {
            return;
          }

          modifySource(loadId, { loading: false, data, state: "valid" });

          // Track this as the last successful load.
          latestSuccessfulLoad = Math.max(loadId, latestSuccessfulLoad);

          return;
        })
        .catch((error) => {
          if (signal?.aborted) {
            return;
          }

          modifySource(loadId, {
            loading: false,
            error: handleError(error),
            state: "error",
          });

          return;
        })
        .finally(() => {
          // Track the latest load to complete, favouring the latest one.
          latestCompletedLoad = Math.max(loadId, latestCompletedLoad);
        });
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
      state: "error",
      loading: false,
    });
  }

  return source;
}
