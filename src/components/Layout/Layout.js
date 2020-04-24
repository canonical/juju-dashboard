import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import Notification from "@canonical/react-components/dist/components/Notification/Notification";
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
  let isMounted = useRef(false);

  const handleScreenResize = () => {
    if (isMounted.current) {
      setScreenWidth(getViewportWidth());
    }
  };

  useEffect(() => {
    isMounted.current = true;
    window.addEventListener("resize", debounce(handleScreenResize, 250));
    return () => {
      isMounted.current = false;
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
        <div data-test="main-children">{children}</div>
        {!localStorage.getItem("release20_04") && (
          <Notification
            type="information"
            close={() => {
              localStorage.setItem("release20_04", true);
            }}
          >
            Welcome the new JAAS Dashboard! This dashboard is the replacement
            for the Juju GUI in JAAS and individual Juju Controllers from Juju
            2.8.{" "}
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
              We would love to hear your feedback!
            </span>
          </Notification>
        )}
      </main>
    </div>
  );
};

export default Layout;
