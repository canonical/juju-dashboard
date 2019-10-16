import React from "react";
import PrimaryNav from "components/PrimaryNav/PrimaryNav";

import "./_layout.scss";

const Layout = ({ children }) => {
  return (
    <div className="l-container">
      <div className="l-side">
        <PrimaryNav />
      </div>
      <div className="l-main">
        <main id="main-content">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
