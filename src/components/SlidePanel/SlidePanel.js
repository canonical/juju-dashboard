import React, { useEffect, useState } from "react";
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
  const [render, setRender] = useState(false);

  useEffect(() => {
    isActive && setRender(true);
  }, [isActive]);

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

  const onAnimationEnd = () => {
    !isActive && setRender(false);
  };

  return (
    <>
      {render && (
        <div
          className={classnames("slide-panel", className)}
          aria-hidden={!isActive}
          onAnimationEnd={onAnimationEnd}
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
      )}
    </>
  );
}

export default SlidePanel;
