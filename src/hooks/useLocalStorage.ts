import { useState } from "react";

function useLocalStorage<V>(
  key: string,
  initialValue: V,
): [V, (value: V) => void] {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<V>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // Not shown in UI. Logged for debugging purposes.
      console.error("Unable to parse local storage:", error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the
  // new value to localStorage.
  const setValue = (value: V) => {
    try {
      const stringified = JSON.stringify(value);
      setStoredValue(value);
      window.localStorage.setItem(key, stringified);
    } catch (error) {
      // Not shown in UI. Logged for debugging purposes.
      console.error(error);
    }
  };

  return [storedValue, setValue];
}

export default useLocalStorage;
