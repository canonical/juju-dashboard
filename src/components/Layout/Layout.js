import { useState } from "react";
import { useSelector, useStore } from "react-redux";
import { isLoggedIn, getWSControllerURL } from "app/selectors";
import Notification from "@canonical/react-components/dist/components/Notification/Notification";
import Logo from "components/Logo/Logo";
import Banner from "components/Banner/Banner";
import PrimaryNav from "components/PrimaryNav/PrimaryNav";

import useLocalStorage from "hooks/useLocalStorage";
import useOffline from "hooks/useOffline";

import "./_layout.scss";

const Layout = ({ children }) => {
  const [releaseNotification, setReleaseNotification] = useLocalStorage(
    "releaseNotification",
    false
  );

  const isOffline = useOffline();

  const store = useStore();
  const userIsLoggedIn = isLoggedIn(
    useSelector(getWSControllerURL),
    store.getState()
  );

  const [menuCollapsed, setMenuCollapsed] = useState(true);

  return (
    <>
      <a className="skip-main" href="#main-content">
        Skip to main content
      </a>

      <Banner
        isActive={isOffline !== null}
        variant={isOffline === false ? "positive" : "caution"}
      >
        {isOffline ? (
          <p>Your dashboard is offline.</p>
        ) : (
          <p>
            The dashboard is now online - please{" "}
            <a href={window.location}>refresh your browser.</a>
          </p>
        )}
      </Banner>

      <div className="l-application">
        <div className="l-navigation-bar">
          <Logo />
          <button
            className="is-dense toggle-menu"
            onClick={() => {
              setMenuCollapsed(!menuCollapsed);
            }}
          >
            {menuCollapsed ? "Open menu" : "Close menu"}
          </button>
        </div>
        <header className="l-navigation" data-collapsed={menuCollapsed}>
          <div className="l-navigation__drawer">
            <PrimaryNav />
          </div>
        </header>
        <main className="l-main" id="main-content">
          <div data-test="main-children">{children}</div>
          {userIsLoggedIn && !releaseNotification && (
            <Notification
              type="information"
              close={() => {
                setReleaseNotification(true);
              }}
            >
              Welcome to the new Juju Dashboard! This dashboard is the
              replacement for the Juju GUI in JAAS and individual Juju
              Controllers from Juju 2.8.{" "}
              <span className="u-hide--small">
                Read more and join the discussion about this new dashboard{" "}
                <a
                  className="p-link--external"
                  target="_blank"
                  rel="noreferrer noopener"
                  href="https://discourse.juju.is/t/jaas-dashboard-the-new-juju-gui/2978"
                >
                  on Discourse
                </a>
                . We would love to hear your feedback.
              </span>
            </Notification>
          )}
        </main>
      </div>
    </>
  );
};

export default Layout;
