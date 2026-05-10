import type { Source } from "data";

import createSourceRaceIterator from "./sourceRaceIterator";

describe("createSourceRaceIterator", () => {
  let source1: Source<string>;
  let source2: Source<string>;

  beforeEach(() => {
    source1 = {
      done: vi.fn(),
      [Symbol.asyncIterator]: async function* () {
        await Promise.resolve();
        yield "source1-1";
        yield "source1-2";
      },
    } as unknown as Source<string>;
    source2 = {
      done: vi.fn(),
      [Symbol.asyncIterator]: async function* () {
        yield "source2-1";
        await Promise.resolve();
        yield "source2-2";
      },
    } as unknown as Source<string>;
  });

  it("returns source responses", async () => {
    const sourceRace = createSourceRaceIterator([source1, source2]);
    for (const value of [
      "source2-1",
      "source1-1",
      "source1-2",
      "source2-2",
      // Done
      true,
      // Done
      true,
    ]) {
      const isDone = value === true;
      await expect(sourceRace.next()).resolves.toEqual({
        done: isDone,
        value: isDone ? undefined : value,
      });
    }
  });
});
