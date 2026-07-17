import type { ReactNode } from "react";

type RequiredIf<Condition, Value> = true extends Condition
  ? Value
  : Partial<Value>;
type Not<Condition> = true extends Condition ? false : true;
type Extends<A, B> = A extends B ? true : false;

export type TableColumn<TRow, TValue> = {
  /**
   * Component to render as this column's header.
   */
  header: ReactNode;
  /**
   * If `true`, the table can be sorted by this column on click.
   */
  sortable?: boolean;
  /**
   * Collapse this column's width to match the content.
   */
  collapse?: boolean;
  /**
   * Alignment of the cells in this column.
   */
  align?: "center" | "left" | "right";
  /**
   * Class name to apply to all cells within this column.
   */
  className?: string;
  /**
   * Map operation to extract data for this column from the row.
   */
  map: (row: NoInfer<TRow>) => TValue;
} &
  // If the data value is a react node, then the `renderCell` callback is optional.
  RequiredIf<
    Not<Extends<ReactNode, TValue>>,
    {
      /**
       * Custom render implementation for the cell.
       */
      renderCell: (data: NoInfer<TValue>, row: TRow) => ReactNode;
    }
  >;

export type DataTableProps<
  TRow,
  TKeyValue extends React.Key,
  TValues extends Record<string, unknown>,
> = {
  /**
   * Function to generate a key which will identify each row.
   */
  getKey: (row: TRow) => TKeyValue;
  /**
   * If `true`, a column of checkboxes will be rendered for each row.
   */
  selectable?: boolean;
  /**
   * If present, group by the given key.
   *
   * Grouped rows will have the group column moved to the start of the table, and span all grouped
   * rows.
   */
  groupBy?: keyof TValues;
  /**
   * Configuration of each column.
   *
   * Columns keys must be present in the T.
   */
  columns: {
    [U in keyof TValues]: TableColumn<TRow, TValues[U]>;
  };
  /**
   * Data to fill table with.
   */
  data: TRow[];
  /**
   * Optional message to display when there are no rows.
   */
  noRowsMessage?: string;
};

/**
 * An extension of `TableColumn` which includes its `key`.
 */
export type FlatTableColumn<TKey, TRow, TValue> = { key: TKey } & TableColumn<
  TRow,
  TValue
>;

/**
 * A cell item, with its `column` and associated `value`.
 */
export type Cell<C, T> = { column: C; value: T };

/**
 * Sort configuration.
 */
export type Sort<K> = { key: K; direction: "ascending" | "descending" } | null;
