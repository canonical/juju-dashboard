import React, { useEffect } from "react";

import "./_slide-panel.scss";

function SlidePanel({ children, onClose, isActive }) {
  // If Escape key is pressed when slide panel is open, close it
  useEffect(() => {
    const closeOnEscape = document.body.addEventListener("keydown", (e) => {
      if (isActive && e.code === "Escape") {
        onClose();
      }
    });
    const closeOnClickOutside = document.body.addEventListener("click", (e) => {
      if (
        isActive &&
        !e.target.closest(".slide-panel") &&
        !e.target.closest('[role="row"]')
      ) {
        onClose();
      }
    });
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("click", closeOnClickOutside);
    };
  }, [isActive, onClose]);

  return (
    <div className="slide-panel" aria-hidden={!isActive}>
      <button
        className="p-modal__close"
        aria-label="Close active modal"
        aria-controls="modal"
        onClick={onClose}
        onKeyPress={onClose}
      >
        Close
      </button>
      <div className="slide-panel__content">{children}</div>
    </div>
  );
}

export default SlidePanel;
