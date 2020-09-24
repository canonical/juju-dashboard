import { useState, useEffect } from "react";

/**
 * Returns offline status
 *
 * @returns {Boolean} isOffline
 */
export default function useOffline() {
  const [isOffline, setIsOffline] = useState(null);

  useEffect(() => {
    const offlineEvent = window.addEventListener(
      "offline",
      function () {
        setIsOffline(true);
      },
      false
    );
    const onlineEvent = window.addEventListener(
      "online",
      function () {
        setIsOffline(false);
      },
      false
    );
    return () => {
      window.removeEventListener("offline", offlineEvent);
      window.removeEventListener("online", onlineEvent);
    };
  }, []);

  return isOffline;
}
