import React from "react";
import classNames from "classnames";
import PrimaryNav from "components/PrimaryNav/PrimaryNav";
import SecondaryNav from "components/SecondaryNav/SecondaryNav";

import "./_layout.scss";

const Layout = ({ sidebar, children }) => {
  return (
    <>
      <PrimaryNav />
      <div
        className={classNames({
          "l-container--sidebar": sidebar
        })}
      >
        {sidebar && (
          <div className="l-side">
            <SecondaryNav />
          </div>
        )}
        <div className="l-main">
          <main id="main-content">{children}</main>
        </div>
      </div>
    </>
  );
};

export default Layout;
