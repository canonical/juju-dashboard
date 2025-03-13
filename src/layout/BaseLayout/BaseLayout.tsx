import { ApplicationLayout, Panel } from "@canonical/react-components";
import classNames from "classnames";
import { Toaster } from "react-hot-toast";
import { Link, useLocation } from "react-router";

import FadeIn from "animations/FadeIn";
import Banner from "components/Banner";
import LoadingSpinner from "components/LoadingSpinner";
import Logo from "components/Logo";
import PrimaryNav from "components/PrimaryNav";
import SecondaryNavigation from "components/SecondaryNavigation";
import { DARK_THEME } from "consts";
import useOffline from "hooks/useOffline";
import Panels from "panels";
import { getIsJuju } from "store/general/selectors";
import { useAppSelector } from "store/store";
import urls from "urls";

import type { Props } from "./types";
import { Label, TestId } from "./types";

const BaseLayout = ({
  children,
  loading,
  secondaryNav,
  status,
  title,
  titleClassName,
  titleComponent,
  ...props
}: Props) => {
  const location = useLocation();
  const isOffline = useOffline();
  const isJuju = useAppSelector(getIsJuju);
  const hasSecondaryNav = !!secondaryNav?.items.length;

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
        status={status}
      >
        <div
          id="main-content"
          className={classNames("l-main__content", {
            "l-main__content--has-secondary-nav": hasSecondaryNav,
          })}
        >
          <>
            {hasSecondaryNav && !loading ? (
              <SecondaryNavigation
                items={secondaryNav.items}
                title={secondaryNav.title}
              />
            ) : null}
            <Panel
              className="l-main__panel"
              data-testid={TestId.MAIN}
              titleClassName={titleClassName}
              titleComponent={titleComponent}
              stickyHeader
              title={title}
            >
              <div className="l-content" {...props}>
                <FadeIn isActive={true}>
                  {loading ? <LoadingSpinner /> : children}
                </FadeIn>
              </div>
            </Panel>
          </>
        </div>
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
