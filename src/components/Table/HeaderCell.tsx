import classNames from "classnames";
import type { HTMLProps, JSX, ReactNode } from "react";

type SortProps =
  | {
      /**
       * Indicates this header is sortable.
       */
      sortable: true;
      /**
       * Direction in which this header is currently being sorted.
       */
      sortDirection: null | React.AriaAttributes["aria-sort"];
    }
  | {
      sortable?: false;
      sortDirection?: undefined;
    };

type HeaderCellProps = {
  children?: ReactNode;
  /**
   * If `true`, collapse the width of this column to it's content.
   */
  collapse?: boolean;
  align?: "center" | "left" | "right";
  className?: string;
} & Omit<HTMLProps<HTMLTableCellElement>, "onClick"> &
  // Use a generic `onClick` handler, since the event may be emitted from a `button` or the `th`.
  Pick<HTMLProps<HTMLElement>, "onClick"> &
  SortProps;

/**
 * Header cell within a table.
 *
 * `sortable` and `sortDirection` can be used to indicate that the column is being used for
 * sorting.
 */
export default function HeaderCell({
  align,
  children,
  sortable,
  sortDirection,
  collapse,
  className,
  ...props
}: HeaderCellProps): JSX.Element {
  let ariaSort: React.AriaAttributes["aria-sort"] = undefined;

  // If this column is sortable, render it in a button so that it can receive `onClick` events.
  if (sortable) {
    children = (
      <button className="p-table__sort-button" onClick={props.onClick}>
        {children}
      </button>
    );
    ariaSort = sortDirection ?? "none";
    delete props.onClick;
  }

  return (
    <th
      {...props}
      aria-sort={ariaSort}
      className={classNames(
        className,
        align !== undefined ? `u-align--${align}` : undefined,
      )}
      style={{ width: collapse ? "min-content" : undefined }}
    >
      {children}
    </th>
  );
}
