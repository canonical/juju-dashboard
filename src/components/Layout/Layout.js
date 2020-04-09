import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import PrimaryNav from "components/PrimaryNav/PrimaryNav";
import classNames from "classnames";
import useHover from "hooks/useHover";
import { getViewportWidth, debounce } from "app/utils";

import { isSidebarCollapsible } from "ui/selectors";

import "./_layout.scss";

const Layout = ({ children }) => {
  const [sidebarRef, isSidebarHovered] = useHover();
  const [screenWidth, setScreenWidth] = useState(getViewportWidth());
  const sidebarCollapsible = useSelector(isSidebarCollapsible);
  const smallScreenBreakpoint = 1400;
  const isSmallScreen = screenWidth <= smallScreenBreakpoint ? true : false;

  const handleScreenResize = () => {
    setScreenWidth(getViewportWidth());
  };

  useEffect(() => {
    window.addEventListener("resize", debounce(handleScreenResize, 250));
    return () => {
      window.removeEventListener("resize", debounce(handleScreenResize, 250));
    };
  }, []);

  return (
    <div
      className={classNames("l-container", {
        "has-collapsible-sidebar": sidebarCollapsible || isSmallScreen,
      })}
    >
      <div
        className={classNames("l-side", {
          "is-collapsed":
            (sidebarCollapsible && !isSidebarHovered) ||
            (isSmallScreen && !isSidebarHovered),
        })}
        ref={sidebarRef}
      >
        <PrimaryNav />
      </div>
      <main className="l-main" id="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;
