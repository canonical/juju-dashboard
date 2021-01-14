import { cloneElement } from "react";
import classnames from "classnames";
import Spinner from "@canonical/react-components/dist/components/Spinner";

import useEventListener from "hooks/useEventListener";

import "./_slide-panel.scss";

function generatePanelContent(isLoading, children, onClose) {
  if (isLoading) {
    return <Spinner />;
  }
  if (children) {
    return cloneElement(children, {
      _closePanel: onClose,
    });
  }
}

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
  useEventListener("keydown", closeOnEscape);

  // Close panel if click is detected outside when panel is active
  const closeOnClickOutside = (e) => {
    if (
      isActive &&
      !e.target.closest(".slide-panel") &&
      !e.target.closest(".webcli")
    ) {
      onClose();
    }
  };
  useEventListener("click", closeOnClickOutside);

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
        {generatePanelContent(isLoading, children, onClose)}
      </div>
    </div>
  );
}

export default SlidePanel;
