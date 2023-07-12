import type { PropsWithSpread } from "@canonical/react-components";
import { useListener } from "@canonical/react-components";
import classNames from "classnames";
import type { PropsWithChildren, ReactNode, MouseEvent } from "react";
import { forwardRef, useId } from "react";

import Aside from "components/Aside/Aside";
import type { Props as AsideProps } from "components/Aside/Aside";
import PanelHeader from "components/PanelHeader/PanelHeader";

type Props = PropsWithSpread<
  {
    checkCanClose?: (e: KeyboardEvent | MouseEvent) => boolean;
    panelClassName: string;
    title: ReactNode;
    onRemovePanelQueryParams?: () => void;
  },
  PropsWithChildren & AsideProps
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
      panelClassName,
      title,
      onRemovePanelQueryParams,
      ...props
    }: Props,
    ref
  ) => {
    // TODO: Make onRemovePanelQueryParams a required prop,
    // remove handleRemovePanelQueryParams and modify tests.
    const handleRemovePanelQueryParams =
      onRemovePanelQueryParams === undefined
        ? () => {}
        : onRemovePanelQueryParams;

    useListener(
      window,
      (e: KeyboardEvent) =>
        close.onEscape(e, handleRemovePanelQueryParams, checkCanClose),
      "keydown"
    );
    useListener(
      window,
      (e: MouseEvent) =>
        close.onClickOutside(e, handleRemovePanelQueryParams, checkCanClose),
      "click"
    );

    const titleId = useId();
    return (
      <Aside {...props} aria-labelledby={titleId} role="dialog">
        <div className={classNames("p-panel", panelClassName)} ref={ref}>
          <PanelHeader
            id={titleId}
            title={title}
            onRemovePanelQueryParams={handleRemovePanelQueryParams}
          />
          {children}
        </div>
      </Aside>
    );
  }
);

export default Panel;
