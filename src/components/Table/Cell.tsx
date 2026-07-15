import classNames from "classnames";
import type { HTMLProps, JSX, ReactNode } from "react";

/**
 * A cell within the table body.
 */
export default function Cell({
  children,
  collapse,
  align,
  className,
  ...props
}: {
  children?: ReactNode;
  collapse?: boolean;
  align?: "center" | "left" | "right";
  className?: string;
} & HTMLProps<HTMLTableCellElement>): JSX.Element {
  return (
    <td
      {...props}
      className={classNames(
        className,
        align !== undefined ? `u-align--${align}` : undefined,
      )}
      style={{ width: collapse ? "min-content" : undefined }}
    >
      {children}
    </td>
  );
}
