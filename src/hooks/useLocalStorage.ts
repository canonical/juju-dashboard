import { useState } from "react";

function useLocalStorage<V>(
  key: string,
  initialValue: V
): [V, (value: V) => void] {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<V>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error("Unable to parse local storage:", error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the
  // new value to localStorage.
  const setValue = (value: V) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue];
}

export default useLocalStorage;
