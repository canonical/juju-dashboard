import type { PropsWithSpread } from "@canonical/react-components";
import { HTMLProps, PropsWithChildren } from "react";
import classnames from "classnames";

import "./_div-button.scss";

type Props = PropsWithSpread<
  {
    onClick: () => void;
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
      onClick={() => onClick()}
      onKeyDown={(event) => {
        if (event.key === " " || event.key === "Enter") {
          onClick();
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
