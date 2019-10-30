import React from "react";
import { useSelector } from "react-redux";
import PrimaryNav from "components/PrimaryNav/PrimaryNav";
import classNames from "classnames";

import { isSidebarCollapsible } from "app/selectors";

import "./_layout.scss";

const Layout = ({ children }) => {
  const sidebarCollapsible = useSelector(isSidebarCollapsible);
  return (
    <div className="l-container">
      <div
        className={classNames("l-side", {
          "is-collapsible": sidebarCollapsible
        })}
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
