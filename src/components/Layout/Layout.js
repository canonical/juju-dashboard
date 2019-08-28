import React from "react";
import classNames from "classnames";
import PrimaryNav from "../PrimaryNav/PrimaryNav";
import SecondaryNav from "../SecondaryNav/SecondaryNav";

import "./_layout.scss";

const Layout = props => {
  const { sidebar, children } = props;
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
