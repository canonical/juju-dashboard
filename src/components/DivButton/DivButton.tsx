import type { PropsWithSpread } from "@canonical/react-components";
import classnames from "classnames";
import type { FC, HTMLProps, PropsWithChildren } from "react";
import { useRef } from "react";

type Props = PropsWithChildren &
  PropsWithSpread<
    {
      onClick: (event: React.KeyboardEvent | React.MouseEvent) => void;
    },
    HTMLProps<HTMLDivElement>
  >;

/**
 This component can be used where a button can't be, e.g. when an interactive
 element wraps another interactive element.
 */
const DivButton: FC<Props> = ({
  children,
  onClick,
  className,
  ...props
}: Props) => {
  const ref = useRef(null);
  return (
    <div
      className={classnames("p-div-button", className)}
      onClick={(event) => {
        onClick(event);
      }}
      onKeyDown={(event) => {
        if (
          // Check that this element has focus so that this doesn't fire when
          // interacting with children.
          document.activeElement === ref.current &&
          (event.key === " " || event.key === "Enter")
        ) {
          onClick(event);
        }
      }}
      ref={ref}
      role="button"
      tabIndex={0}
      {...props}
    >
      {children}
    </div>
  );
};

export default DivButton;
