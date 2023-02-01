import { useEffect } from "react";

/**
 * Set the browser window title.
 * @param {String} title - The title to set.
 */
export default function useWindowTitle(title: string) {
  const titlePart = title ? `${title} | ` : "";
  useEffect(() => {
    document.title = `${titlePart}Juju Dashboard`;
  }, [titlePart]);
}
