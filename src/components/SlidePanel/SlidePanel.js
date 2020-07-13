import React from "react";

import "./_slide-panel.scss";

function SlidePanel({ children, onClose }) {
  return (
    <div className="slide-panel">
      <div className="slide-panel--close">
        <span
          className="p-icon--close"
          onClick={onClose}
          onKeyPress={onClose}
          role="button"
          tabIndex="0"
        ></span>
      </div>
      <div className="slide-panel--content">{children}</div>
    </div>
  );
}

export default SlidePanel;
