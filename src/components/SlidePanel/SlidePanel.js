import React, { useEffect } from "react";
import classnames from "classnames";
import Spinner from "@canonical/react-components/dist/components/Spinner";

import "./_slide-panel.scss";

function SlidePanel({
  children,
  onClose,
  isActive,
  isLoading = false,
  className,
}) {
  // If Escape key is pressed when slide panel is open, close it
  useEffect(() => {
    if (!isActive) return;
    const closeOnEscape = (e) => {
      if (isActive && e.code === "Escape") {
        onClose();
      }
    };
    const closeOnClickOutside = (e) => {
      if (
        isActive &&
        !e.target.closest(".slide-panel") &&
        !e.target.closest('[role="row"]')
      ) {
        onClose();
      }
    };
    document.body.addEventListener("keydown", closeOnEscape);
    document.body.addEventListener("click", closeOnClickOutside);
    return () => {
      document.body.removeEventListener("keydown", closeOnEscape);
      document.body.removeEventListener("click", closeOnClickOutside);
    };
  }, [isActive, onClose]);

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
        {isLoading ? <Spinner /> : <>{children}</>}
      </div>
    </div>
  );
}

export default SlidePanel;
