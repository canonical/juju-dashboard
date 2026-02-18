/**
 * Interface of a data source for type `T`.
 */
export type Source<T> = {
  /**
   * Invalidate the current data.
   */
  invalidate: () => void;
  /**
   * Source is no longer required and can be cleaned up.
   */
  done: () => void;
  /**
   * Current state of the data.
   *
   * - `unknown`: State of data is not currently known.
   *
   * - `error`: An error occurred while fetching the data.
   *
   * - `valid`: The data is up-to-date.
   *
   * - `stale`: The data has been invalidated, and is waiting to be
   *   re-fetched.
   */
  state: "error" | "stale" | "unknown" | "valid";
  /**
   * Loading state of the source.
   */
  loading: boolean;
  /**
   * Latest version of the data. If the source hasn't provided any
   * data yet, then it will be `null`.
   *
   * @note This will always have the latest value, even if it has been
   * invalidated or is currently being fetched.
   */
  data: null | T;
  /**
   * Current error of the source, if present.
   */
  error: {
    /**
     * User-friendly description of the error.
     */
    message: string;
    /**
     * Underlying error object.
     */
    source: unknown;
  } | null;
  /**
   * Callback subscription for source events.
   *
   * - `data`: called when new data is available.
   *
   * - `error`: called when an error has occurred.
   *
   * - `load`: called when a load begins, and is provided promise
   *   which will resolve with the loaded data, or reject with an
   *   error.
   */
  on: <Name extends keyof Events<T>>(
    event: Name,
    cb: (...data: Events<T>[Name]) => void,
  ) => UnsubscribeCallback;
};

/**
 * Map of all event types available on a source.
 */
export type Events<T> = {
  data: [data: T];
  error: [message: string, source: unknown];
  load: [result: Promise<T>];
};

/**
 * A callback function to unsubscribe from some event.
 */
type UnsubscribeCallback = () => void;
