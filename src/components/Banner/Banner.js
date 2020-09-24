import React from "react";

import "./_banner.scss";

export default function Banner({ isActive, children, type }) {
  return (
    <div className="banner" data-active={isActive} data-type={type}>
      {children}
    </div>
  );
}
