import type { PropsWithSpread } from "@canonical/react-components";
import { useListener } from "@canonical/react-components";
import classNames from "classnames";
import type { PropsWithChildren, ReactNode, MouseEvent } from "react";
import { forwardRef, useId } from "react";

import Aside from "components/Aside/Aside";
import type { Props as AsideProps } from "components/Aside/Aside";
import PanelHeader from "components/PanelHeader/PanelHeader";
import { useQueryParams } from "hooks/useQueryParams";

type Props = PropsWithSpread<
  {
    checkCanClose?: (e: KeyboardEvent | MouseEvent) => boolean;
    panelClassName: string;
    title: ReactNode;
  },
  PropsWithChildren & AsideProps
>;

export const close = {
  // Close panel if Escape key is pressed when panel active
  onEscape: (
    e: KeyboardEvent,
    queryStringSetter: (qs?: string | null) => void,
    checkCanClose?: Props["checkCanClose"]
  ) => {
    if (e.code === "Escape") {
      if (checkCanClose && !checkCanClose?.(e)) {
        return;
      }
      queryStringSetter(undefined);
    }
  },
  onClickOutside: (
    e: MouseEvent,
    queryStringSetter: (qs?: string | null) => void,
    checkCanClose?: Props["checkCanClose"]
  ) => {
    if (checkCanClose && !checkCanClose?.(e)) {
      return;
    }
    const target = e.target as HTMLElement;
    if (!target.closest(".p-panel")) {
      queryStringSetter(undefined);
    }
  },
};

export const Panel = forwardRef<HTMLDivElement, Props>(
  (
    { checkCanClose, children, panelClassName, title, ...props }: Props,
    ref
  ) => {
    const [, setPanelQs] = useQueryParams<{ panel: string | null }>({
      panel: null,
    });

    useListener(
      window,
      (e: KeyboardEvent) =>
        close.onEscape(
          e,
          () => setPanelQs(null, { replace: true }),
          checkCanClose
        ),
      "keydown"
    );
    useListener(
      window,
      (e: MouseEvent) =>
        close.onClickOutside(
          e,
          () => setPanelQs(null, { replace: true }),
          checkCanClose
        ),
      "click"
    );

    const titleId = useId();
    return (
      <Aside {...props} aria-labelledby={titleId} role="dialog">
        <div className={classNames("p-panel", panelClassName)} ref={ref}>
          <PanelHeader id={titleId} title={title} />
          {children}
        </div>
      </Aside>
    );
  }
);

export default Panel;
