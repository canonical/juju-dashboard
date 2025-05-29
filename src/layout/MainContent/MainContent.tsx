import { Panel } from "@canonical/react-components";
import classNames from "classnames";

import FadeIn from "animations/FadeIn";
import LoadingSpinner from "components/LoadingSpinner";
import SecondaryNavigation from "components/SecondaryNavigation";

import type { Props } from "./types";
import { TestId } from "./types";

const MainContent = ({
  children,
  loading,
  secondaryNav,
  title,
  titleClassName,
  titleComponent,
  ...props
}: Props) => {
  const hasSecondaryNav = !!secondaryNav?.items.length;
  return (
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
  );
};

export default MainContent;
