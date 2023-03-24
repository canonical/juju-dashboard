import type { PropsWithSpread } from "@canonical/react-components";
import { HTMLProps, KeyboardEvent, MouseEvent, PropsWithChildren } from "react";
import classnames from "classnames";

import "./_div-button.scss";

type Props = PropsWithSpread<
  {
    onClick: (event: MouseEvent | KeyboardEvent) => void;
  },
  HTMLProps<HTMLDivElement>
> &
  PropsWithChildren;

/**
 This component can be used where a button can't be, e.g. when an interactive
 element wraps another interactive element.
 */
const DivButton = ({ children, onClick, className, ...props }: Props) => {
  return (
    <div
      className={classnames("p-div-button", className)}
      onClick={(event) => onClick(event)}
      onKeyDown={(event) => {
        if (event.key === " " || event.key === "Enter") {
          onClick(event);
        }
      }}
      role="button"
      tabIndex={0}
      {...props}
    >
      {children}
    </div>
  );
};

export default DivButton;
