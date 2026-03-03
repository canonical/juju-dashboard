/**
 * Helper to push task into next tick.
 */
export async function tick(): Promise<void> {}

/**
 * A promise with a flag to indicate when it's complete.
 */
export type WrappedPromise<T> = { done: boolean } & Promise<T>;

/**
 * Turn a promise into a `WrappedPromise`.
 */
export function wrapPromise<T>(promise: Promise<T>): WrappedPromise<T> {
  const wrapped = promise as WrappedPromise<T>;
  wrapped.done = false;
  void wrapped.then(() => {
    wrapped.done = true;
    return;
  });
  return wrapped;
}
