import type { HTMLProps, JSX, ReactNode } from "react";

/**
 * Root table element.
 */
export default function Table({
  children,
  ...props
}: {
  children?: ReactNode;
} & HTMLProps<HTMLTableElement>): JSX.Element {
  return <table {...props}>{children}</table>;
}
