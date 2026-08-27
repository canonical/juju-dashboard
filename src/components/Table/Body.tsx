import type { HTMLProps, JSX, ReactNode } from "react";

/**
 * Body of a table, containing the data.
 */
export default function TableBody({
  children,
  ...props
}: { children?: ReactNode } & HTMLProps<HTMLTableSectionElement>): JSX.Element {
  return <tbody {...props}>{children}</tbody>;
}
