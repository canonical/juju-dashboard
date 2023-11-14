import type { PropsWithSpread } from "@canonical/react-components";
import { useListener } from "@canonical/react-components";
import classNames from "classnames";
import type { ReactNode, MouseEvent } from "react";
import { forwardRef, useId } from "react";

import Aside from "components/Aside/Aside";
import type { Props as AsideProps } from "components/Aside/Aside";

import "./_panel.scss";

type Props = PropsWithSpread<
  {
    checkCanClose?: (e: KeyboardEvent | MouseEvent) => boolean;
    drawer?: ReactNode;
    panelClassName?: string;
    splitContent?: ReactNode;
    title: ReactNode;
    onRemovePanelQueryParams: () => void;
  },
  AsideProps
>;

const close = {
  // Close panel if Escape key is pressed when panel active
  onEscape: (
    e: KeyboardEvent,
    onRemovePanelQueryParams: () => void,
    checkCanClose?: Props["checkCanClose"]
  ) => {
    if (e.code === "Escape") {
      if (checkCanClose && !checkCanClose?.(e)) {
        return;
      }
      onRemovePanelQueryParams();
    }
  },
  onClickOutside: (
    e: MouseEvent,
    onRemovePanelQueryParams: () => void,
    checkCanClose?: Props["checkCanClose"]
  ) => {
    if (checkCanClose && !checkCanClose?.(e)) {
      return;
    }
    const target = e.target as HTMLElement;
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
      onRemovePanelQueryParams,
      ...props
    }: Props,
    ref
  ) => {
    useListener(
      window,
      (e: KeyboardEvent) =>
        close.onEscape(e, onRemovePanelQueryParams, checkCanClose),
      "keydown"
    );
    useListener(
      window,
      (e: MouseEvent) =>
        close.onClickOutside(e, onRemovePanelQueryParams, checkCanClose),
      "click"
    );

    const titleId = useId();
    const content = (
      <>
        <div className="side-panel__content-scrolling">{children}</div>
        {drawer ? <div className="side-panel__drawer">{drawer}</div> : null}
      </>
    );
    return (
      <Aside
        {...props}
        aria-labelledby={titleId}
        role="dialog"
        onClose={onRemovePanelQueryParams}
        panelProps={{
          className: classNames("side-panel", panelClassName),
          contentClassName: props.isSplit ? "aside-split-wrapper" : null,
          forwardRef: ref,
          title: <span id={titleId}>{title}</span>,
        }}
      >
        {props.isSplit ? (
          <div className="aside-split-col aside-split-col--left">{content}</div>
        ) : (
          content
        )}
        {props.isSplit && splitContent ? (
          <div className="aside-split-col aside-split-col--right">
            <div className="side-panel__split-content">{splitContent}</div>
          </div>
        ) : null}
      </Aside>
    );
  }
);

export default Panel;
