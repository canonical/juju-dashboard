import React from "react";
import classNames from "classnames";
import ErrorBoundary from "components/ErrorBoundary/ErrorBoundary";
import PrimaryNav from "components/PrimaryNav/PrimaryNav";
import SecondaryNav from "components/SecondaryNav/SecondaryNav";
import Login from "components/Login/Login";

import "./_layout.scss";

const Layout = ({ sidebar, children }) => {
  // Temp circumvent this step until login solution is implemented
  const isLoggedIn = true;

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
          <ErrorBoundary>
            {isLoggedIn ? (
              <main className="main-content" id="main-content">
                {children}
              </main>
            ) : (
              <Login />
            )}
          </ErrorBoundary>
        </div>
      </div>
    </>
  );
};

Layout.defaultProps = {
  sidebar: true
};

export default Layout;
