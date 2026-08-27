import fastDeepEquals from "fast-deep-equal/es6";

import type { Cell } from "./types";

/**
 * Compare two rows using a target column `key`.
 *
 * Values will be compared with `fastDeepEquals`, so objects will only be checked for equality. If
 * they aren't equal, `-1` will be returned.
 *
 * @param key - Key to sort by.
 * @param rowA - First value of comparison.
 * @param rowB - Second value of comparison.
 */
export function compareRow<C, T>(
  key: C,
  rowA: Cell<C, T>[],
  rowB: Cell<C, T>[],
): -1 | 0 | 1 {
  const cellA = rowA.find(({ column }) => column === key)?.value;
  const cellB = rowB.find(({ column }) => column === key)?.value;

  if (fastDeepEquals(cellA, cellB)) {
    return 0;
  }

  // Handle if ether value is missing.
  if (cellA === undefined || cellB === undefined) {
    return -1;
  }

  // NOTE: For some reason, TS decides to infer `null` as an option for `cellA` and `cellB`.
  // Comparison operations can still take place on `null`, so it's fine to accept them here.
  return (cellA as T) < (cellB as T) ? 1 : -1;
}

/**
 * Calculate the size of a span, where a span is a sequence of the same value.
 *
 * @param values - Values to search.
 * @param start - Start index of span.
 * @returns Length of the end of the span, inclusive of the start.
 */
export function calculateSpanSize<T>(values: T[], start: number): number {
  for (let i = start; i < values.length; i++) {
    if (!fastDeepEquals(values[i], values[start])) {
      return i - start;
    }
  }

  return Math.max(values.length - start, 0);
}
