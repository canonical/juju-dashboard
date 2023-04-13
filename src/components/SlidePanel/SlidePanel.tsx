import { Spinner, useListener } from "@canonical/react-components";
import classnames from "classnames";
import type { MouseEvent, PropsWithChildren, Ref } from "react";
import { forwardRef } from "react";

import "./_slide-panel.scss";

type Props = {
  onClose: () => void;
  isActive?: boolean;
  isLoading?: boolean;
  className: string;
} & PropsWithChildren;

const SlidePanel = forwardRef(
  (
    { children, onClose, isActive, isLoading = false, className }: Props,
    ref: Ref<HTMLDivElement>
  ) => {
    // Close panel if Escape key is pressed when panel active
    const closeOnEscape = (e: KeyboardEvent) => {
      if (isActive && e.code === "Escape") {
        onClose();
      }
    };
    useListener(window, closeOnEscape, "keydown");

    // Close panel if click is detected outside when panel is active
    const closeOnClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        isActive &&
        !target.closest(".p-modal") &&
        !target.closest(".slide-panel") &&
        !target.closest('[role="row"]') &&
        !target.closest(".webcli")
      ) {
        onClose();
      }
    };
    useListener(window, closeOnClickOutside, "click");

    return (
      <div
        className={classnames("slide-panel", className)}
        aria-hidden={!isActive}
        ref={ref}
      >
        <button
          className="p-modal__close"
          aria-label="Close active modal"
          aria-controls="modal"
          onClick={onClose}
          onKeyPress={onClose}
        >
          Close
        </button>
        <div className="slide-panel__content" data-loading={isLoading}>
          {isLoading ? <Spinner /> : children}
        </div>
      </div>
    );
  }
);

export default SlidePanel;
