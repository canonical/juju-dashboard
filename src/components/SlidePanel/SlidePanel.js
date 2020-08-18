import React from "react";

import "./_slide-panel.scss";

function SlidePanel({ children, onClose, isActive }) {
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
