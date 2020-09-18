import { useState, useEffect } from "react";

export default function useOffline() {
  const [offline, setOffline] = useState(false);

  // Offline notification
  useEffect(() => {
    const offline = window.addEventListener(
      "offline",
      function () {
        setOffline(true);
      },
      false
    );
    const online = window.addEventListener(
      "online",
      function () {
        setOffline(false);
      },
      false
    );
    return () => {
      window.removeEventListener("offline", offline);
      window.removeEventListener("online", online);
    };
  }, []);

  return offline;
}
