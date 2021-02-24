import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";

import Logo from "components/Logo/Logo";
import Banner from "components/Banner/Banner";
import PrimaryNav from "components/PrimaryNav/PrimaryNav";

import Panels from "panels/panels";

import useOffline from "hooks/useOffline";

import type { EntityDetailsRoute } from "components/Routes/Routes";

import "./_base-layout.scss";

type Props = {
  children: JSX.Element;
};

const BaseLayout = ({ children }: Props) => {
  const [menuCollapsed, setMenuCollapsed] = useState(true);
  const [sideNavCollapsed, setSideNavCollapsed] = useState(false);
  const location = useLocation();

  // Check if pathname includes a model name - and then always collapse sidebar
  const { modelName } = useParams<EntityDetailsRoute>();

  useEffect(() => {
    if (modelName) {
      setSideNavCollapsed(true);
    }
    return () => {
      setSideNavCollapsed(false);
    };
  }, [modelName]);

  const isOffline = useOffline();

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
            <a href={location.pathname}>refresh your browser.</a>
          </p>
        )}
      </Banner>

      <div id="confirmation-modal-container"></div>

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
        <header
          className="l-navigation"
          data-collapsed={menuCollapsed}
          data-side-nav-collapsed={sideNavCollapsed}
        >
          <div className="l-navigation__drawer">
            <PrimaryNav />
          </div>
        </header>
        <main className="l-main" id="main-content">
          <div data-test="main-children">{children}</div>
        </main>
        <Panels />
      </div>
    </>
  );
};

export default BaseLayout;
