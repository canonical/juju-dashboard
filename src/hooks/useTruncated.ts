import type { RefObject } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

export function checkTruncated<T extends HTMLElement>(element: T): boolean {
  // Check to see if the content is larger than the frame, in which case the
  // CSS will be truncating the element.
  return element.offsetWidth < element.scrollWidth;
}

/**
 * Hook that tracks whether a DOM element is visually truncated.
 * @param enabled - Whether truncation checks should actively run.
 * @returns The element ref and whether its content is truncated.
 */
export default function useTruncated<T extends HTMLElement>(
  enabled = true,
): { ref: RefObject<null | T>; truncated: boolean } {
  const ref = useRef<T>(null);
  const [truncated, setTruncated] = useState(false);

  const resizeObserver = useMemo(
    () =>
      new ResizeObserver(() => {
        setTruncated(ref.current ? checkTruncated(ref.current) : false);
      }),
    [],
  );

  useEffect(() => {
    const element = ref.current;
    if (!element || !enabled) {
      return;
    }
    // Do an initial check for whether the content is truncated.
    setTruncated(checkTruncated(element));
    // Watch the content for resizes to check if the truncation changes.
    resizeObserver.observe(element);
    return (): void => {
      resizeObserver.unobserve(element);
    };
  }, [enabled, resizeObserver]);

  return { ref, truncated };
}
