import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useParams } from "react-router-dom";
import { TSFixMe } from "types";

import Banner from "components/Banner/Banner";
import Logo from "components/Logo/Logo";
import PrimaryNav from "components/PrimaryNav/PrimaryNav";

import Panels from "panels/panels";

import useOffline from "hooks/useOffline";

import type { EntityDetailsRoute } from "components/Routes/Routes";

import { actions } from "store/ui";
import { isSideNavCollapsed } from "store/ui/selectors";

import classNames from "classnames";
import "./_base-layout.scss";

export enum TestId {
  MAIN = "main-children",
}

type Props = {
  children: JSX.Element;
};

const BaseLayout = ({ children }: Props) => {
  const [mobileMenuCollapsed, setMobileMenuCollapsed] = useState(true);
  const location = useLocation();
  const dispatch = useDispatch();

  // Check if pathname includes a model name - and then always collapse sidebar
  const { modelName } = useParams<EntityDetailsRoute>();

  const collapseSidebar = useSelector<TSFixMe>(isSideNavCollapsed) || false;

  useEffect(() => {
    dispatch(actions.sideNavCollapsed(!!modelName));

    return () => {
      dispatch(actions.sideNavCollapsed(false));
    };
  }, [modelName, dispatch]);

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
            Your dashboard is now back online - please{" "}
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
              setMobileMenuCollapsed(!mobileMenuCollapsed);
            }}
          >
            {mobileMenuCollapsed ? "Open menu" : "Close menu"}
          </button>
        </div>
        <header
          className={classNames("l-navigation", {
            "is-pinned": !collapseSidebar,
          })}
          data-collapsed={mobileMenuCollapsed}
          data-sidenav-initially-collapsed={collapseSidebar}
        >
          <div className="l-navigation__drawer">
            <PrimaryNav />
          </div>
        </header>
        <main className="l-main" id="main-content">
          <div data-testid={TestId.MAIN}>{children}</div>
        </main>
        <Panels />
        <Toaster
          position="bottom-right"
          containerClassName="toast-container"
          toastOptions={{
            duration: 5000,
          }}
          reverseOrder={true}
        />
      </div>
    </>
  );
};

export default BaseLayout;
