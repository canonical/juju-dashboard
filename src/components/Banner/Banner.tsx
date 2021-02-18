import { useState, useEffect } from "react";
import classnames from "classnames";

import "./_banner.scss";

type Props = {
  isActive: boolean;
  children: any;
  variant: "positive" | "caution" | "negative";
};

export default function Banner({
  isActive,
  children,
  variant,
}: Props): JSX.Element {
  const [bannerClosed, setBannerClosed] = useState(false);

  // Open banner every time banner variant changes
  useEffect(() => {
    setBannerClosed(false);
  }, [variant]);

  return (
    <div
      className="banner"
      data-active={isActive && !bannerClosed}
      data-variant={variant}
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
            "is-light": variant === "positive",
          })}
        >
          Close banner
        </i>
      </button>
    </div>
  );
}
