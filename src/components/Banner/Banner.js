import React, { useState, useEffect } from "react";
import classnames from "classnames";

import "./_banner.scss";

export default function Banner({ isActive = false, children, type }) {
  const [bannerClosed, setBannerClosed] = useState(false);

  // Open banner every time banner type changes
  useEffect(() => {
    setBannerClosed(false);
  }, [type]);

  return (
    <div
      className="banner"
      data-active={isActive && !bannerClosed}
      data-type={type}
    >
      {children}
      <button
        className="banner__close"
        onClick={() => {
          setBannerClosed(true);
        }}
      >
        <i
          className={classnames("p-icon--close", {
            "is-light": type === "positive",
          })}
        >
          Close banner
        </i>
      </button>
    </div>
  );
}
