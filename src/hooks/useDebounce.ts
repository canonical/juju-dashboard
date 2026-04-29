import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Hook that debounces state updates.
 * @param initialValue - The initial value
 * @param delay - The debounce delay in milliseconds
 * @returns Tuple of debounced value and setter
 */
export default function useDebounce<T>(
  initialValue: T,
  delay: number,
): [T, (value: T, options?: { immediate?: boolean }) => void] {
  const [debouncedValue, setDebouncedValue] = useState(() => initialValue);
  const pendingValueRef = useRef(initialValue);
  const timeoutRef = useRef<null | ReturnType<typeof setTimeout>>(null);

  const clearPendingTimeout = useCallback((): void => {
    if (timeoutRef.current !== null && timeoutRef.current !== undefined) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const setValue = useCallback(
    (value: T, options?: { immediate?: boolean }): void => {
      pendingValueRef.current = value;

      clearPendingTimeout();

      if (options?.immediate) {
        setDebouncedValue(() => value);
        return;
      }

      timeoutRef.current = setTimeout(() => {
        setDebouncedValue(() => pendingValueRef.current);
        timeoutRef.current = null;
      }, delay);
    },
    [clearPendingTimeout, delay],
  );

  useEffect(() => {
    return (): void => {
      clearPendingTimeout();
    };
  }, [clearPendingTimeout]);

  return [debouncedValue, setValue];
}
