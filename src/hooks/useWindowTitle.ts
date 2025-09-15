import { useEffect } from "react";

/**
 * Set the browser window title.
 * @param title - The title to set.
 */
export default function useWindowTitle(title?: null | string): void {
  const titlePart = title ? `${title} | ` : "";
  useEffect(() => {
    document.title = `${titlePart}Juju Dashboard`;
  }, [titlePart]);
}
