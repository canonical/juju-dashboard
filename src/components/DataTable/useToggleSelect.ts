import { useCallback, useEffect, useMemo, useState } from "react";

/**
 * Return value of `useToggleSelect`.
 */
export type ToggleSelectReturn<T> = {
  /**
   * Currently selected keys.
   */
  selected: T[];
  /**
   * Aggregated state of the selection.
   * - `all`: every key is selected
   * - `none`: no keys are selected
   * - `partial`: some keys are selected
   */
  state: "all" | "none" | "partial";
  /**
   * Toggle the provided key. If it's selected it will be deselected, and vice-versa.
   */
  toggle: (key: T) => void;
  /**
   * Toggle the entire selection.
   * - if none are selected, all will be selected
   * - if some are selected, all will be selected
   * - if all are selected, none will be selected
   */
  toggleAll: () => void;
};

/**
 * Track selection over a collection of `keys`.
 *
 * @param onChange - Optional callback fired synchronously whenever the
 * selection changes, receiving the new selected keys array.
 */
export default function useToggleSelect<T>(
  keys: readonly T[],
  onChange?: (selected: T[]) => void,
): ToggleSelectReturn<T> {
  const [selected, setSelected] = useState<T[]>([]);

  // If `keys` changes, ensure previous values are removed.
  useEffect(() => {
    setSelected((previous) => {
      const filtered = previous.filter((key) => keys.includes(key));
      // Retain the same object identity if nothing was actually changed.
      return filtered.length === previous.length ? previous : filtered;
    });
  }, [keys]);

  const state = useMemo(() => {
    if (selected.length === 0) {
      return "none";
    } else if (selected.length === keys.length) {
      return "all";
    } else {
      return "partial";
    }
  }, [selected, keys]);

  const toggle = useCallback(
    (key: T) => {
      if (!keys.includes(key)) {
        return;
      }

      setSelected((previous) => {
        // Try to remove the value.
        const filtered = previous.filter((value) => key !== value);
        // If nothing was removed, then the key needs to be added.
        if (filtered.length === previous.length) {
          filtered.push(key);
        }
        return filtered;
      });
      onChange?.(
        selected.includes(key)
          ? selected.filter((value) => key !== value)
          : [...selected, key],
      );
    },
    [keys, onChange, selected],
  );

  const toggleAll = useCallback(() => {
    if (keys.length === 0) {
      return;
    }

    const next = selected.length === keys.length ? [] : [...keys];
    setSelected(next);
    onChange?.(next);
  }, [keys, onChange, selected]);

  return { selected, state, toggle, toggleAll };
}
