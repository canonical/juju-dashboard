import { Spinner, useListener } from "@canonical/react-components";
import classnames from "classnames";

import "./_slide-panel.scss";

function SlidePanel({
  children,
  onClose,
  isActive,
  isLoading = false,
  className,
}) {
  // Close panel if Escape key is pressed when panel active
  const closeOnEscape = (e) => {
    if (isActive && e.code === "Escape") {
      onClose();
    }
  };
  useListener(window, closeOnEscape, "keydown");

  // Close panel if click is detected outside when panel is active
  const closeOnClickOutside = (e) => {
    if (
      isActive &&
      !e.target.closest(".p-modal") &&
      !e.target.closest(".slide-panel") &&
      !e.target.closest('[role="row"]') &&
      !e.target.closest(".webcli")
    ) {
      onClose();
    }
  };
  useListener(window, closeOnClickOutside, "click");

  return (
    <div
      className={classnames("slide-panel", className)}
      aria-hidden={!isActive}
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

export default SlidePanel;
