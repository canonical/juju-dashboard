import { useState, useEffect } from "react";

export default function useOffline() {
  const [isOffline, setIsOffline] = useState(null);

  // Offline notification
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
