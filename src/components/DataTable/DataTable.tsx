import type { JSX } from "react";
import { useMemo } from "react";

import InlineCheckbox from "components/InlineCheckbox";
import Table from "components/Table";

import type { DataTableProps, FlatTableColumn, TableColumn } from "./types";
import useHeaders from "./useHeaders";
import useRows from "./useRows";
import useSortState from "./useSortState";
import useToggleSelect from "./useToggleSelect";

/**
 * @template TRow - Shape of the row data provided to the table.
 * @template TKeyValue - Type of the value used as the row key, returned by `getKey`.
 * @template TValues - Accumulator for all the column types, should never be directly instantiated.
 *
 * Some other useful types:
 * - `keyof TValues`: all column keys
 * - `TValues[keyof TValues]`: all column values
 */
export default function DataTable<
  TRow,
  TKeyValue extends React.Key,
  TValues extends Record<string, unknown>,
>({
  getKey,
  columns,
  data,
  selectable = true,
  groupBy,
  noRowsMessage = "No rows",
}: DataTableProps<TRow, TKeyValue, TValues>): JSX.Element {
  const { sort, toggleSort } = useSortState<keyof TValues>();

  // Flatten out columns, for easy accessing.
  const flatColumns = useMemo(() => {
    return Object.entries(columns).map(
      ([key, column]) =>
        ({
          ...column,
          key,
        }) as FlatTableColumn<keyof TValues, TRow, TValues[keyof TValues]>,
    );
  }, [columns]);

  // Render and order headers, including prefix column for grouping.
  const { prefix: prefixHeader, headers: orderedHeaders } = useHeaders({
    columns: flatColumns,
    groupBy,
    sort,
    toggleSort,
  });

  // For each row, generate its key and all of the column values.
  const keyedRows = useMemo(() => {
    return data.map((row) => ({
      key: getKey(row),
      values: flatColumns.map((column) => ({
        column: column.key,
        value: column.map(row),
      })),
      data: row,
    }));
  }, [data, flatColumns, getKey]);

  // Build selection state off of the rows.
  const rowKeys = useMemo(() => keyedRows.map(({ key }) => key), [keyedRows]);
  const select = useToggleSelect(rowKeys);

  // Render rows.
  const fullRows = useRows({
    rows: keyedRows,
    columns: flatColumns,
    groupBy,
    sort,
    select,
    selectable,
  });

  const columnCount = useMemo(
    () =>
      orderedHeaders.length +
      (prefixHeader !== null ? 1 : 0) +
      (selectable ? 1 : 0),
    [orderedHeaders, prefixHeader, selectable],
  );

  return (
    <Table>
      <Table.Header>
        {prefixHeader}
        {selectable ? (
          <Table.Header.Cell collapse>
            <InlineCheckbox
              label={select.state === "all" ? "Deselect all" : "Select all"}
              checked={select.state === "all"}
              indeterminate={select.state === "partial"}
              onChange={select.toggleAll}
            />
          </Table.Header.Cell>
        ) : null}
        {orderedHeaders}
      </Table.Header>
      <Table.Body>
        {fullRows.length > 0 ? (
          fullRows
        ) : (
          <Table.Row>
            <Table.Cell
              colSpan={columnCount}
              className="u-text--muted u-align--center"
            >
              {noRowsMessage}
            </Table.Cell>
          </Table.Row>
        )}
      </Table.Body>
    </Table>
  );
}

/**
 * Create a function to create columns with the correct types.
 *
 * This function is to work around a limitation in TypeScript's inference engine, where inferred
 * generics cannot be correctly solved. By providing the solver with some hints (specifically, the
 * type of the row `TRow`), and constraining the inference context of the value `TValue`, the
 * solver can find a solution. Normally, this would require the user to heavily annotate their
 * column definitions with duplicated type information, so this function effectively allows the
 * `TRow` generic to be curried.
 */
DataTable.columnBuilder = <TRow,>(): (<TValue>(
  column: TableColumn<NoInfer<TRow>, TValue>,
) => TableColumn<NoInfer<TRow>, NoInfer<TValue>>) => {
  return (column) => column;
};
