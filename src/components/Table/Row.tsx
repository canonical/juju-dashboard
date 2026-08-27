import type { HTMLProps, JSX, ReactNode } from "react";

/**
 * A row within a table.
 */
export default function Row({
  children,
  ...props
}: { children?: ReactNode } & HTMLProps<HTMLTableRowElement>): JSX.Element {
  return <tr {...props}>{children}</tr>;
}
