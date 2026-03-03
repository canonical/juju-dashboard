const SECONDS_TO_MILLISECONDS = 1000;
const MINUTES_TO_SECONDS = 60;

/**
 * A value which may or may not be a promise. Use `promisify` to normalise this value into a
 * promise.
 */
export type MaybePromise<T> = Promise<T> | T;

/**
 * A duration in time.
 */
export type Duration =
  | { milliseconds: number }
  | { minutes: number }
  | { seconds: number };

/**
 * Determine if `K` is an optional key within `T`.
 */
export type IsOptional<
  T extends object,
  K extends keyof T,
> = undefined extends T[K] ? K : never;

/**
 * Produce all optional fields from a type.
 */
export type OptionalFields<T> = T extends object
  ? { [K in keyof T as IsOptional<T, K>]-?: T[K] }
  : never;

/**
 * Immediately runs the provided callback. If the returned value is a promise, it will be returned.
 * Otherwise, the returned value will be returned in a promise that will immediately resolve. If the
 * callback throws an error, then it will be returned in a promise that will immediately reject.
 */
// NOTE: Adding `async` to this function signature leads to an extra tick in order to resolve to
// the value, even when `maybePromise` is a `Promise`.
// eslint-disable-next-line @typescript-eslint/promise-function-async
export function promisify<T>(
  maybePromiseCb: () => MaybePromise<T>,
): Promise<T> {
  try {
    const maybePromise = maybePromiseCb();
    if (maybePromise instanceof Promise) {
      return maybePromise;
    } else {
      return Promise.resolve(maybePromise);
    }
  } catch (error) {
    return Promise.reject(error);
  }
}

/**
 * Create a promise that will resolve after the specified duration.
 */
export async function waitFor(duration: Duration): Promise<void> {
  let timeout = Infinity;
  if ("milliseconds" in duration) {
    timeout = duration.milliseconds;
  } else if ("seconds" in duration) {
    timeout = duration.seconds * SECONDS_TO_MILLISECONDS;
  } else if ("minutes" in duration) {
    timeout = duration.minutes * MINUTES_TO_SECONDS * SECONDS_TO_MILLISECONDS;
  }

  if (timeout <= 0) {
    return;
  }

  return new Promise((resolve) => setTimeout(resolve, timeout));
}

/**
 * Return a promise that will resolve when the provided signal aborts.
 */
// NOTE: Adding `async` to this function signature leads to an extra tick in order to resolve to
// the once the signal aborts.
// eslint-disable-next-line @typescript-eslint/promise-function-async
export function signalAsPromise(signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    signal.addEventListener("abort", () => {
      resolve();
    });
  });
}
