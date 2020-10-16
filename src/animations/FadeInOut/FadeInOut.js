import React, { useState, useEffect } from "react";

import "./FadeInOut.scss";

export default function FadeInOut({ isActive, children }) {
  const [render, setRender] = useState(false);

  useEffect(() => {
    isActive && setRender(true);
  }, [isActive]);

  return (
    <>
      {render && (
        <div
          className={isActive ? "fade-in" : "fade-out"}
          onAnimationEnd={() => {
            !isActive && setRender(false);
          }}
        >
          {children}
        </div>
      )}
    </>
  );
}
