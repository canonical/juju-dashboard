import React from "react";
import { useSelector } from "react-redux";
import PrimaryNav from "components/PrimaryNav/PrimaryNav";
import classNames from "classnames";
import useHover from "hooks/useHover";

import { isSidebarCollapsible } from "app/selectors";

import "./_layout.scss";

const Layout = ({ children }) => {
  const [sidebarRef, isSidebarHovered] = useHover();
  const sidebarCollapsible = useSelector(isSidebarCollapsible);
  return (
    <div
      className={classNames("l-container", {
        "has-collapsible-sidebar": sidebarCollapsible
      })}
    >
      <div
        className={classNames("l-side", {
          "is-collapsed": sidebarCollapsible && !isSidebarHovered
        })}
        ref={sidebarRef}
      >
        <PrimaryNav />
      </div>
      <div className="l-main">
        <main id="main-content">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
