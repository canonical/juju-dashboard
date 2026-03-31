import type { PropsWithSpread } from "@canonical/react-components";
import { Button, Icon, useListener } from "@canonical/react-components";
import VanillaPanel from "@canonical/react-components/dist/components/Panel";
import classNames from "classnames";
import type { ReactNode } from "react";
import { forwardRef, useId, useRef } from "react";

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
    panelId: string,
    onRemovePanelQueryParams: () => void,
    startedInsidePanel: boolean,
    checkCanClose?: Props["checkCanClose"],
  ): void => {
    if (startedInsidePanel) {
      // If the click started inside the panel and then was dragged outside the panel then don't close it.
      return;
    }
    if (checkCanClose && !checkCanClose?.(ev)) {
      return;
    }
    const target = ev.target as HTMLElement;
    if (!target.closest(`#${panelId}`)) {
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
    const startedInsidePanel = useRef(false);
    const panelId = useId();
    useListener(
      window,
      (ev: React.KeyboardEvent) => {
        close.onEscape(ev, onRemovePanelQueryParams, checkCanClose);
      },
      "keydown",
    );
    useListener(
      window,
      (event: React.MouseEvent) => {
        const target = event.target as HTMLElement;
        startedInsidePanel.current = !!target.closest(`#${panelId}`);
      },
      "mousedown",
    );
    useListener(
      window,
      (ev: React.MouseEvent) => {
        close.onClickOutside(
          ev,
          panelId,
          onRemovePanelQueryParams,
          startedInsidePanel.current,
          checkCanClose,
        );
        startedInsidePanel.current = false;
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
        id={panelId}
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
