import type { JujuCLI } from "./juju-cli";

/**
 * An action is a reversible side-effect executed within the test environment. Action
 * implementations are free to capture any required state as member properties, and use them for
 * execution in the `run` and `rollback` methods.
 *
 * Actions are free to expose additional data via `result`. This should contain any information
 * that is useful for interacting with any potential side effects of the action. For example, if
 * action creates a resource `result` can contain it's identifier before the action has run.
 */
export abstract class Action<T> {
  /**
   * Perform the action. The returned value will be provided to the `rollback` method when it's
   * called.
   */
  abstract run(jujuCLI: JujuCLI): Promise<void>;

  /**
   * Rollback this action, using the provided state from when the action was run.
   */
  abstract rollback(jujuCLI: JujuCLI): Promise<void>;

  /**
   * Produce a debug message for this action.
   */
  abstract debug(): string;

  /**
   * Return the resulting value of this action.
   */
  abstract result(): T;
}

export class ActionStack {
  private actions: Action<unknown>[] = [];

  constructor(private jujuCLI: JujuCLI) {}

  public async prepare<T = void>(
    prepare_fn: (add: <S>(action: Action<S>) => S) => T,
  ) {
    const actions: Action<unknown>[] = [];

    // Let the user function queue actions
    const value = prepare_fn((action) => {
      actions.push(action);
      console.time("prepare action");
      const result = action.result();
      console.timeEnd("prepare action");
      return result;
    });

    // Run each action
    console.log("---------------------");
    console.log("Beginning action run.", new Date().toLocaleString());
    for (const action of actions) {
      console.log(`Action: ${action.debug()}`, new Date().toLocaleString());

      // Push the action, so that it can be cleaned up if it fails
      this.actions.push(action);
      console.time("run action");
      await action.run(this.jujuCLI).catch((error) => {
        console.error("Error encountered during action, aborting:", error);
        throw error;
      });
      console.timeEnd("run action");

      console.log();
    }
    console.log("Action run complete.", new Date().toLocaleString());
    console.log("--------------------");

    return value;
  }

  public async rollback(): Promise<void> {
    console.log("--------------------------------");
    console.log(
      "Beginning action stack rollback.",
      new Date().toLocaleString(),
    );

    let action: Action<unknown> | undefined;
    while ((action = this.actions.pop())) {
      console.log(`Action: ${action.debug()}`, new Date().toLocaleString());
      console.time("rollback action");

      await action.rollback(this.jujuCLI);
      console.timeEnd("rollback action");

      console.log();
    }

    console.log("Action stack rollback complete.", new Date().toLocaleString());
    console.log("-------------------------------");
  }
}
