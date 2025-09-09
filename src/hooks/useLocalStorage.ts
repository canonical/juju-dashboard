import fastDeepEqual from "fast-deep-equal/es6";
import { useState } from "react";

import { logger } from "utils/logger";

function useLocalStorage<V>(
  key: string,
  initialValue: V,
): [V, (value: V) => void] {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<V>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item !== null && item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // Not shown in UI. Logged for debugging purposes.
      logger.error("Unable to parse local storage:", error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the
  // new value to localStorage.
  const setValue = (value: V) => {
    try {
      if (!fastDeepEqual(storedValue, value)) {
        const stringified = JSON.stringify(value);
        setStoredValue(value);
        window.localStorage.setItem(key, stringified);
      }
    } catch (error) {
      // Not shown in UI. Logged for debugging purposes.
      logger.error(error);
    }
  };

  return [storedValue, setValue];
}

export default useLocalStorage;
