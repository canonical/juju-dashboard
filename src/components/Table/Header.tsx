import type { HTMLProps, JSX, ReactNode } from "react";

/**
 * Header section of a table.
 */
export default function Header({
  children,
  ...props
}: { children?: ReactNode } & HTMLProps<HTMLTableSectionElement>): JSX.Element {
  return (
    <thead {...props}>
      <tr>{children}</tr>
    </thead>
  );
}
