import React, { useEffect } from "react";

import "./_slide-panel.scss";

function SlidePanel({ children, onClose, isActive }) {
  // If Escape key is pressed when slide panel is open, close it
  useEffect(() => {
    const closeOnEscape = document.addEventListener("keydown", (e) => {
      if (isActive && e.code === "Escape") {
        onClose();
      }
    });
    const closeOnClickOutside = document.addEventListener("click", (e) => {
      console.log(e.target.closest('[role="row"]'));
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
