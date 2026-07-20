import { useCallback, useState } from "react";

import type { Sort } from "./types";

/**
 * Managed state for sorting.
 */
type SortState<K> = {
  /**
   * Currently selected sort column and direction, or `null` if no sort is active.
   */
  sort: Sort<K>;
  /**
   * Toggle sorting on the provided key.
   */
  toggleSort: (key: K) => void;
};

/**
 * Track sort state, using `toggle` to switch between ascending/descending sorts on given keys.
 */
export default function useSortState<K>(): SortState<K> {
  const [sort, setSort] = useState<Sort<K>>(null);

  const toggleSort = useCallback((key: K) => {
    setSort((existing) => {
      if (existing?.key === key) {
        if (existing.direction === "ascending") {
          return { key: existing.key, direction: "descending" };
        } else {
          return null;
        }
      }

      return { key, direction: "ascending" };
    });
  }, []);

  return { sort, toggleSort };
}
