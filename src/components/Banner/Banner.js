import React from "react";

import "./_banner.scss";

export default function Banner({ isActive, children }) {
  return (
    <div className="banner" data-active={isActive}>
      {children}
    </div>
  );
}
