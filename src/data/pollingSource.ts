import type { Source } from "./source";
import { createSource } from "./sourceBase";
import {
  type MaybePromise,
  type Duration,
  type OptionalFields,
  promisify,
  waitFor,
  signalAsPromise,
} from "./util";

export type PollFn<T> = (abortSignal: AbortSignal) => MaybePromise<T>;

export type PollConfig = {
  /**
   * Interval at which poll function should be called.
   */
  interval: Duration;
  /**
   * Ignore any attempts to refetch the data outside of the prescribed interval.
   *
   * @default false
   */
  ignoreRefetch?: boolean;
  /**
   * Number of pending requests to retain once a newer request finishes.
   *
   * @default 3
   */
  tailRequests?: number;
};

/**
 * Default configuration options for optional fields.
 */
const DEFAULT_CONFIG: OptionalFields<PollConfig> = {
  ignoreRefetch: false,
  tailRequests: 3,
};

export function createPollingSource<T>(
  pollFn: PollFn<T>,
  config: PollConfig,
): Source<T> {
  // Create a full configuration by merging the default configuration with the user's
  // configuration.
  const fullConfig: Required<PollConfig> = Object.assign(
    {},
    DEFAULT_CONFIG,
    config,
  );

  return createSource(({ load, sourceDone }) => {
    // Create a single promise which will resolve when the `sourceDone` signal aborts.
    const sourceDonePromise = signalAsPromise(sourceDone);

    void (async (): Promise<void> => {
      while (!sourceDone.aborted) {
        // Create a fresh abort controller for this request.
        const controller = new AbortController();
        const signal = AbortSignal.any([controller.signal, sourceDone]);

        // Queue up the data loading and tick.
        const dataPromise = promisify(
          // NOTE: Adding `async` here will require an additional tick for the `pollFn` to resolve.
          // eslint-disable-next-line @typescript-eslint/promise-function-async
          () => pollFn(signal),
        );
        const nextTick = waitFor(fullConfig.interval);

        // Indicate that the data is loading.
        load(dataPromise, controller.signal);

        // Wait for either the tick to complete, or the source to be completed.
        await Promise.race([nextTick, sourceDonePromise]);

        // Abort the controller, in case it's not already done.
        controller.abort();
      }
    })();

    return {
      refetch: (): void => {
        if (fullConfig.ignoreRefetch) {
          return;
        }
      },
    };
  });
}
