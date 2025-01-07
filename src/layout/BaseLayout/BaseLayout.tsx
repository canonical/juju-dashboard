import { ApplicationLayout, Panel } from "@canonical/react-components";
import type { PanelProps } from "@canonical/react-components";
import type { PropsWithChildren, ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import { useSelector } from "react-redux";
import { Link, useLocation } from "react-router";

import FadeIn from "animations/FadeIn";
import Banner from "components/Banner";
import Logo from "components/Logo";
import PrimaryNav from "components/PrimaryNav";
import { DARK_THEME } from "consts";
import useOffline from "hooks/useOffline";
import Panels from "panels";
import { getIsJuju } from "store/general/selectors";
import urls from "urls";

import "./_base-layout.scss";
import { Label, TestId } from "./types";

type Props = {
  status?: ReactNode;
  title?: ReactNode;
  titleClassName?: PanelProps["titleClassName"];
  titleComponent?: PanelProps["titleComponent"];
} & PropsWithChildren;

const BaseLayout = ({
  children,
  status,
  title,
  titleClassName,
  titleComponent,
}: Props) => {
  const location = useLocation();
  const isOffline = useOffline();
  const isJuju = useSelector(getIsJuju);

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
        <div id="main-content">
          <Panel
            data-testid={TestId.MAIN}
            titleClassName={titleClassName}
            titleComponent={titleComponent}
            stickyHeader
            title={title}
          >
            <div className="l-content">
              <FadeIn isActive={true}>{children}</FadeIn>
            </div>
          </Panel>
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
