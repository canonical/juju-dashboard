import { useEffect } from "react";

/**
 * Set the browser window title.
 * @param title - The title to set.
 */
export default function useWindowTitle(title: string | null = null) {
  const titlePart = title !== null && title ? `${title} | ` : "";
  useEffect(() => {
    document.title = `${titlePart}Juju Dashboard`;
  }, [titlePart]);
}
