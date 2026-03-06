import type { Source } from "./source";
import { createSource } from "./sourceBase";
import {
  type MaybePromise,
  type Duration,
  type OptionalFields,
  promisify,
  waitFor,
  AbortError,
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

export class PollControllerManager {
  private aborted = false;
  private controllers: AbortController[] = [];

  /**
   * Return the number of controllers currently in the manager.
   */
  get length(): number {
    return this.controllers.length;
  }

  /**
   * Produce a signal that will abort when any of the contained controllers abort.
   */
  get signal(): AbortSignal {
    return AbortSignal.any(
      this.controllers.map((controller) => controller.signal),
    );
  }

  /**
   * Abort all controllers.
   */
  abortAll(): void {
    this.aborted = true;
    this.tail(0);
  }

  /**
   * Create a new abort controller.
   */
  create(): AbortController {
    const controller = new AbortController();
    if (this.aborted) {
      // Manager has already been aborted, so abort this new controller.
      controller.abort();
    } else {
      // Save the controller.
      this.controllers.push(controller);
    }
    return controller;
  }

  /**
   * Abort all but the last `count` controllers.
   */
  tail(count: number): void {
    this.tailToIndex(this.controllers.length - count - 1);
  }

  /**
   * Tail all controllers up to and including the provided controller.
   */
  tailTo(controller: AbortController): void {
    const i = this.controllers.indexOf(controller);
    this.tailToIndex(i);
  }

  /**
   * Tail all controllers up to and including the provided index.
   */
  tailToIndex(i: number): void {
    const old = this.controllers.splice(0, i + 1);
    for (const controller of old) {
      controller.abort();
    }
  }
}

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
    const pollControllers = new PollControllerManager();
    let iterationController = new AbortController();

    // If the source is done, abort all controllers.
    sourceDone.addEventListener(
      "abort",
      () => {
        pollControllers.abortAll();
      },
      { once: true },
    );

    void (async (): Promise<void> => {
      while (!sourceDone.aborted) {
        // If `tailRequests` is full, then wait for one of the requests to finish.
        if (pollControllers.length > fullConfig.tailRequests) {
          await new Promise((resolve) => {
            pollControllers.signal.addEventListener("abort", resolve);
          });
          continue;
        }

        // Create a fresh abort controller for this request.
        const controller = pollControllers.create();

        // Queue up the data loading and tick.
        const dataPromise = promisify(
          // NOTE: Adding `async` here will require an additional tick for the `pollFn` to resolve.
          // eslint-disable-next-line @typescript-eslint/promise-function-async
          () => pollFn(controller.signal),
        );

        const timeoutSignal = AbortSignal.any([
          sourceDone,
          iterationController.signal,
        ]);
        const pollTimeout = waitFor(fullConfig.interval, timeoutSignal);

        // Indicate that the data is loading.
        load(dataPromise, controller.signal);

        // Clear old controllers once this poll is complete.
        void dataPromise
          .then(() => {
            pollControllers.tailTo(controller);
            return;
          })
          // Ignore any errors that are thrown.
          .catch(() => {
            return;
          });

        try {
          // Wait for either the tick to complete, or the source to be completed.
          await pollTimeout;
        } catch (error) {
          if (!(error instanceof AbortError)) {
            // Some other error occurred, re-throw the error.
            throw error;
          }
        }
      }
    })();

    return {
      refetch: (): void => {
        if (fullConfig.ignoreRefetch) {
          return;
        }

        const controller = iterationController;
        iterationController = new AbortController();
        controller.abort();
      },
    };
  });
}
