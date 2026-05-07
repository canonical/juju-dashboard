import type { Source } from "./source";

/**
 * Monitor multiple sources for responses.
 * Usage:
 *   const source1 = createSource1();
 *   const source2 = createSource1();
 *   const sources = createSourceRaceIterator<Result1 | Result2>([source1, source2]);
 *   for await (const response of sources) {
 *     ...
 *   }
 * @param endOnFirstDone Whether the iterator should finish when the first iterator is done.
 */
async function* createSourceRaceIterator<T>(
  sources: Source<T>[],
  endOnFirstDone = false,
): AsyncGenerator<T, void, unknown> {
  const iterators = sources.map((source) => source[Symbol.asyncIterator]());
  const next = iterators.map(async (iterator) => iterator.next());
  while (iterators.length) {
    const { value, position, done } = await Promise.race(
      next.map(async (iteratorNext, index) =>
        iteratorNext.then((result) => ({
          ...result,
          position: index,
        })),
      ),
    );
    if (done) {
      if (endOnFirstDone) {
        return;
      }
      // This iterator is done so remove it from the race.
      iterators.splice(position, 1);
      void next.splice(position, 1);
      continue;
    }
    next[position] = iterators[position].next();
    yield value;
  }
}

export default createSourceRaceIterator;
