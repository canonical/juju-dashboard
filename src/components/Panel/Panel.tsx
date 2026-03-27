import type { PropsWithSpread } from "@canonical/react-components";
import { Button, Icon, useListener } from "@canonical/react-components";
import VanillaPanel from "@canonical/react-components/dist/components/Panel";
import classNames from "classnames";
import type { ReactNode } from "react";
import { forwardRef, useId } from "react";

import Aside from "components/Aside";
import type { AsideProps } from "components/Aside";

export type PanelProps = {
  checkCanClose?: (e: React.KeyboardEvent | React.MouseEvent) => boolean;
  drawer?: ReactNode;
  panelClassName?: string;
  splitContent?: ReactNode;
  title?: ReactNode;
  titleId?: string;
  header?: ReactNode;
  onRemovePanelQueryParams: () => void;
};

type Props = PropsWithSpread<PanelProps, AsideProps>;

const close = {
  // Close panel if Escape key is pressed when panel active
  onEscape: (
    ev: React.KeyboardEvent,
    onRemovePanelQueryParams: () => void,
    checkCanClose?: Props["checkCanClose"],
  ): void => {
    if (ev.code === "Escape") {
      if (checkCanClose && !checkCanClose?.(ev)) {
        return;
      }
      onRemovePanelQueryParams();
    }
  },
  onClickOutside: (
    ev: React.MouseEvent,
    onRemovePanelQueryParams: () => void,
    checkCanClose?: Props["checkCanClose"],
  ): void => {
    if (checkCanClose && !checkCanClose?.(ev)) {
      return;
    }
    const target = ev.target as HTMLElement;
    if (!target.closest(".p-panel")) {
      onRemovePanelQueryParams();
    }
  },
};

const Panel = forwardRef<HTMLDivElement, Props>(
  (
    {
      checkCanClose,
      children,
      drawer,
      panelClassName,
      splitContent,
      title,
      titleId,
      header,
      onRemovePanelQueryParams,
      width = "narrow",
      ...props
    }: Props,
    ref,
  ) => {
    useListener(
      window,
      (ev: React.KeyboardEvent) => {
        close.onEscape(ev, onRemovePanelQueryParams, checkCanClose);
      },
      "keydown",
    );
    useListener(
      window,
      (ev: React.MouseEvent) => {
        close.onClickOutside(ev, onRemovePanelQueryParams, checkCanClose);
      },
      "click",
    );

    const defaultTitleId = useId();
    const content = (
      <>
        <div className="side-panel__content-scrolling">{children}</div>
        {drawer ? <div className="side-panel__drawer">{drawer}</div> : null}
      </>
    );
    const headerProps = title
      ? {
          title: <span id={titleId ?? defaultTitleId}>{title}</span>,
          controls: (
            <Button
              appearance="base"
              className="u-no-margin--bottom"
              hasIcon
              onClick={onRemovePanelQueryParams}
            >
              <Icon name="close">Close</Icon>
            </Button>
          ),
        }
      : { header };
    return (
      <Aside
        {...props}
        width={width}
        aria-labelledby={titleId ?? defaultTitleId}
        role="dialog"
      >
        <VanillaPanel
          className={classNames("side-panel", panelClassName)}
          contentClassName={props.isSplit ? "aside-split-wrapper" : null}
          forwardRef={ref}
          {...headerProps}
        >
          {props.isSplit ? (
            <div className="aside-split-col aside-split-col--left">
              {content}
            </div>
          ) : (
            content
          )}
          {props.isSplit && splitContent ? (
            <div className="aside-split-col aside-split-col--right">
              <div className="side-panel__split-content">{splitContent}</div>
            </div>
          ) : null}
        </VanillaPanel>
      </Aside>
    );
  },
);

export default Panel;
