import { useCallback, useRef } from "react";

/**
 * Scroll an element into view on render.
 */
export const useScrollOnRender = <T extends HTMLElement>(
  scrollArea?: HTMLElement | null,
): ((targetNode: T | null) => void) => {
  const htmlRef = useRef<HTMLElement>(document.querySelector("html"));
  const onRenderRef = useCallback(
    (targetNode: T | null) => {
      if (targetNode && htmlRef?.current) {
        const { height: targetHeight, y: targetTop } =
          targetNode.getBoundingClientRect();
        const windowTop = htmlRef.current.scrollTop;
        const windowBottom = windowTop + window.innerHeight;
        const targetBottom = targetTop + targetHeight;
        // Whether the top of the target is below the bottom of the screen.
        const topOffBottom = targetTop > windowBottom;
        // Whether the top of the target is above the top of the screen.
        const topOffTop = targetTop < windowTop;
        // Whether the top of the target is on the screen.
        const topOnScreen = !topOffTop && !topOffBottom;
        // Whether the bottom of the target is below the bottom of the screen.
        const bottomOffBottom = targetBottom > windowBottom;
        // Whether the target top is on the screen but the bottom is below the bottom.
        const targetPartiallyOffBottom = topOnScreen && bottomOffBottom;
        if (topOffBottom || topOffTop || targetPartiallyOffBottom) {
          (scrollArea ?? window).scrollTo({
            top: targetTop,
            left: 0,
            behavior: "smooth",
          });
        }
      }
    },
    [scrollArea],
  );
  return onRenderRef;
};
