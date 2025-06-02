import { ApplicationLayout } from "@canonical/react-components";
import { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { Link, Outlet, useLocation } from "react-router";

import Banner from "components/Banner";
import Logo from "components/Logo";
import PrimaryNav from "components/PrimaryNav";
import { DARK_THEME } from "consts";
import useAnalytics from "hooks/useAnalytics";
import useFeatureFlags from "hooks/useFeatureFlags";
import useOffline from "hooks/useOffline";
import type { StatusView } from "layout/Status";
import Status from "layout/Status";
import Panels from "panels";
import { getIsJuju } from "store/general/selectors";
import { useAppSelector } from "store/store";
import urls from "urls";

import { Label } from "./types";

const BaseLayout = () => {
  const location = useLocation();
  const isOffline = useOffline();
  const isJuju = useAppSelector(getIsJuju);
  const [status, setStatus] = useState<StatusView | null>(null);
  const sendAnalytics = useAnalytics();

  useFeatureFlags();

  useEffect(() => {
    // Send an analytics event when the URL changes.
    sendAnalytics({
      path: window.location.href.replace(window.location.origin, ""),
    });
  }, [location, sendAnalytics]);

  return (
    <>
      <a className="p-link--skip" href="#main-content">
        Skip to main content
      </a>
      <Banner
        isActive={isOffline !== null}
        variant={isOffline === false ? "positive" : "caution"}
      >
        {isOffline ? (
          <p>{Label.OFFLINE}</p>
        ) : (
          <p>
            Your dashboard is now back online - please{" "}
            <a href={location.pathname}>refresh your browser.</a>
          </p>
        )}
      </Banner>
      <div id="confirmation-modal-container"></div>
      <ApplicationLayout
        aside={<Panels />}
        dark={DARK_THEME}
        id="app-layout"
        logo={
          <Logo
            component={Link}
            isJuju={isJuju}
            to={isJuju ? "https://juju.is" : urls.index}
          />
        }
        sideNavigation={<PrimaryNav />}
        status={<Status status={status} />}
      >
        <Outlet context={{ setStatus }} />
      </ApplicationLayout>
      <Toaster
        position="bottom-right"
        containerClassName="toast-container"
        toastOptions={{
          duration: 5000,
        }}
        reverseOrder={true}
      />
    </>
  );
};

export default BaseLayout;
