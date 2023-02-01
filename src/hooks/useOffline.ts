import { useState, useEffect, useCallback } from "react";

/**
 * Returns offline status
 *
 * @returns Whether the browser is offline.
 */
export default function useOffline() {
  const [isOffline, setIsOffline] = useState<boolean | null>(null);

  const setOffline = useCallback(() => {
    setIsOffline(true);
  }, []);

  const setOnline = useCallback(() => {
    setIsOffline(false);
  }, []);

  useEffect(() => {
    window.addEventListener("offline", setOffline, false);
    window.addEventListener("online", setOnline, false);
    return () => {
      window.removeEventListener("offline", setOffline);
      window.removeEventListener("online", setOnline);
    };
  }, [setOffline, setOnline]);

  return isOffline;
}
