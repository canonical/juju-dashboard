import React, { useEffect, useState, useRef } from "react";
import { useSelector, useStore, useDispatch } from "react-redux";
import { isLoggedIn, getWSControllerURL } from "app/selectors";
import Notification from "@canonical/react-components/dist/components/Notification/Notification";
import PrimaryNav from "components/PrimaryNav/PrimaryNav";
import classNames from "classnames";
import useHover from "hooks/useHover";
import useLocalStorage from "hooks/useLocalStorage";
import { getViewportWidth, debounce } from "app/utils";

import { userMenuActive, externalNavActive } from "ui/actions";
import { isSidebarCollapsible } from "ui/selectors";

import "./_layout.scss";

const Layout = ({ children }) => {
  const [sidebarRef, isSidebarHovered] = useHover();
  const [sidebarInFocus, setSidebarInFocus] = useState(false);
  const [screenWidth, setScreenWidth] = useState(getViewportWidth());
  const [releaseNotification, setReleaseNotification] = useLocalStorage(
    "releaseNotification",
    false
  );
  const containerRef = useRef(null);
  const dispatch = useDispatch();

  const store = useStore();
  const userIsLoggedIn = isLoggedIn(
    useSelector(getWSControllerURL),
    store.getState()
  );
  const sidebarCollapsible = useSelector(isSidebarCollapsible);
  const smallScreenBreakpoint = 1400;
  const isSmallScreen = screenWidth <= smallScreenBreakpoint ? true : false;
  let isMounted = useRef(false);

  const handleScreenResize = () => {
    if (isMounted.current) {
      setScreenWidth(getViewportWidth());
    }
  };

  // If any item in the primary nav receives focus, the primary nav should expand
  useEffect(() => {
    const container = containerRef.current;
    const containerInFocus = container.addEventListener("focusin", (e) => {
      const inPrimaryNav = e.target.closest(".p-primary-nav");
      if (inPrimaryNav && !sidebarInFocus) {
        setSidebarInFocus(true);
        if (e.target.closest(".user-menu")) {
          dispatch(userMenuActive(true));
        }
        if (e.target.closest(".p-list.is-external")) {
          dispatch(externalNavActive(true));
        } else {
          dispatch(externalNavActive(false));
        }
      } else if (!inPrimaryNav) {
        setSidebarInFocus(false);
        dispatch(userMenuActive(false));
      }
    });

    return container.removeEventListener("focusin", containerInFocus);
  }, [sidebarInFocus, dispatch]);

  useEffect(() => {
    isMounted.current = true;
    window.addEventListener("resize", debounce(handleScreenResize, 250));
    return () => {
      isMounted.current = false;
      window.removeEventListener("resize", debounce(handleScreenResize, 250));
    };
  }, []);

  return (
    <>
      <a className="skip-main" href="#main-content">
        Skip to main content
      </a>

      <div
        className={classNames("l-container", {
          "has-collapsible-sidebar": sidebarCollapsible || isSmallScreen,
        })}
        ref={containerRef}
      >
        <div
          className={classNames("l-side", {
            "is-collapsed":
              (sidebarCollapsible && !isSidebarHovered && !sidebarInFocus) ||
              (isSmallScreen && !isSidebarHovered && !sidebarInFocus),
          })}
          ref={sidebarRef}
        >
          <PrimaryNav />
        </div>
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
