import type { Store } from "store/store";

import { createProcess } from "./createProcess";
import type { ProcessActions } from "./types";

describe("start", () => {
  let processActions: ProcessActions<{ value: number }, boolean, string>;
  let dispatch: Store["dispatch"];

  async function* runProcess(_payload: {
    value: number;
    meta: Record<string, unknown>;
  }): AsyncIterator<boolean> {
    yield false;
    yield true;
    return "result";
  }
  beforeEach(() => {
    vi.useFakeTimers();
    processActions = {
      setStatus: vi.fn(),
      setRunning: vi.fn(),
      setOutcome: vi.fn(),
    };
    dispatch = vi.fn();
  });

  it("runs process function with payload", async ({ expect }) => {
    const runner = vi.fn(runProcess);
    const process = createProcess("myProcess", runner, processActions);
    await process.start({ value: 123, meta: {} }, dispatch);
    expect(runner).toHaveBeenCalledExactlyOnceWith({ value: 123, meta: {} });
  });

  it("calls setStatus", async ({ expect }) => {
    const process = createProcess("myProcess", runProcess, processActions);
    await process.start({ value: 123, meta: {} }, dispatch);
    expect(processActions.setStatus).toHaveBeenCalledTimes(2);
    expect(processActions.setStatus).toHaveBeenNthCalledWith(
      1,
      { value: 123, meta: {} },
      false,
    );
    expect(processActions.setStatus).toHaveBeenNthCalledWith(
      2,
      { value: 123, meta: {} },
      true,
    );
  });

  it("calls setRunning", async ({ expect }) => {
    const promise = Promise.withResolvers<void>();
    const process = createProcess(
      "myProcess",
      // eslint-disable-next-line require-yield
      async function* () {
        await promise.promise;
        return "result";
      },
      processActions,
    );
    const run = process.start({ value: 123, meta: {} }, dispatch);

    await vi.runOnlyPendingTimersAsync();
    expect(processActions.setRunning).toHaveBeenCalledTimes(1);
    expect(processActions.setRunning).toHaveBeenNthCalledWith(
      1,
      { value: 123, meta: {} },
      true,
    );

    promise.resolve();
    await vi.runOnlyPendingTimersAsync();
    expect(processActions.setRunning).toHaveBeenCalledTimes(2);
    expect(processActions.setRunning).toHaveBeenNthCalledWith(
      2,
      { value: 123, meta: {} },
      false,
    );

    await run;
  });

  it("calls setOutcome", async ({ expect }) => {
    const process = createProcess("myProcess", runProcess, processActions);
    await process.start({ value: 123, meta: {} }, dispatch);
    expect(processActions.setOutcome).toHaveBeenCalledTimes(1);
    expect(processActions.setOutcome).toHaveBeenNthCalledWith(
      1,
      { value: 123, meta: {} },
      {
        result: "result",
      },
    );
  });

  it("only resolves when process complete", async ({ expect }) => {
    const promise = Promise.withResolvers<void>();
    const process = createProcess(
      "myProcess",
      // eslint-disable-next-line require-yield
      async function* () {
        await promise.promise;
        return "result";
      },
      processActions,
    );
    let resolved = false;
    const run = process.start({ value: 123, meta: {} }, dispatch).then(() => {
      resolved = true;
      return;
    });

    await vi.runOnlyPendingTimersAsync();
    expect(resolved).toBe(false);

    promise.resolve();
    await vi.runOnlyPendingTimersAsync();
    expect(resolved).toBe(true);

    await run;
  });

  it("handles error within process", async ({ expect }) => {
    const someError = new Error("something");
    const process = createProcess(
      "myProcess",
      // eslint-disable-next-line require-yield
      async function* () {
        throw someError;
      },
      processActions,
    );
    await process.start({ value: 123, meta: {} }, dispatch);
    expect(processActions.setOutcome).toHaveBeenCalledTimes(1);
    expect(processActions.setOutcome).toHaveBeenNthCalledWith(
      1,
      { value: 123, meta: {} },
      {
        error: {
          message: "something",
          source: someError,
        },
      },
    );
  });
});
