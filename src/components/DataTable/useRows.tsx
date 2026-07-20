import fastDeepEqual from "fast-deep-equal/es6";
import type { ReactNode } from "react";
import React, { useMemo } from "react";

import InlineCheckbox from "components/InlineCheckbox";
import Table from "components/Table";

import type { Cell, FlatTableColumn, Sort } from "./types";
import type { ToggleSelectReturn } from "./useToggleSelect";
import { calculateSpanSize, compareRow } from "./util";

export default function useRows<TRow, TKey extends React.Key, TValues>({
  rows,
  columns,
  groupBy,
  sort,
  select,
  selectable,
}: {
  rows: {
    key: TKey;
    values: Cell<keyof TValues, TValues[keyof TValues]>[];
    data: TRow;
  }[];
  columns: FlatTableColumn<keyof TValues, TRow, TValues[keyof TValues]>[];
  groupBy?: keyof TValues;
  sort: Sort<keyof TValues>;
  select: ToggleSelectReturn<TKey>;
  selectable: boolean;
}): ReactNode[] {
  // Render cells individually.
  const renderedRows = useMemo(() => {
    return rows.map((row) => ({
      key: row.key,
      cells: columns.map((column, columnI) => {
        const { value } = row.values[columnI];

        return {
          column: column.key,
          collapse: column.collapse,
          className: column.className,
          align: column.align,
          value,
          rendered:
            column.renderCell === undefined
              ? (value as ReactNode)
              : column.renderCell(value, row.data),
        };
      }),
    }));
  }, [columns, rows]);

  // Sort rows.
  const sortedRows = useMemo(() => {
    if (sort === null && groupBy === undefined) {
      return renderedRows;
    }

    return renderedRows.toSorted((rowA, rowB) => {
      if (groupBy !== undefined) {
        const result = compareRow(groupBy, rowA.cells, rowB.cells);
        if (result !== 0) {
          return result;
        }
      }

      if (sort === null) {
        return 0;
      }

      const direction = sort.direction === "ascending" ? 1 : -1;
      return compareRow(sort.key, rowA.cells, rowB.cells) * direction;
    });
  }, [sort, renderedRows, groupBy]);

  // Track the column index used for grouping rows.
  const groupByColumnIndex = useMemo(() => {
    if (groupBy === undefined) {
      return null;
    }

    return columns.findIndex(({ key }) => key === groupBy);
  }, [groupBy, columns]);

  // Values of the rows according to the group by column.
  const groupByValues = useMemo(() => {
    if (groupByColumnIndex === null) {
      return null;
    }

    return sortedRows.map(({ cells }) => cells[groupByColumnIndex].value);
  }, [sortedRows, groupByColumnIndex]);

  // Render out full rows.
  const fullRows = useMemo(
    () =>
      sortedRows.map((row, i) => {
        const checked = select.selected.includes(row.key);

        let prefixColumn = null;

        // Prefix column will be filled with the 'group by' value.
        if (groupByColumnIndex !== null && groupByValues !== null) {
          // This row will be the first of it's group if it's the first row, or if it's group by
          // value differs from the previous row.
          const firstOfGroup =
            i === 0 ||
            !fastDeepEqual(groupByValues.at(i - 1), groupByValues[i]);

          if (firstOfGroup) {
            const spanSize = calculateSpanSize(groupByValues, i);
            const cell = row.cells[groupByColumnIndex];

            prefixColumn = (
              <Table.Cell
                rowSpan={spanSize}
                collapse={cell.collapse}
                className={cell.className}
              >
                {cell.rendered}
              </Table.Cell>
            );
          }
        }

        const label = checked ? `Select ${row.key}` : `Deselect ${row.key}`;

        return (
          <Table.Row key={row.key}>
            {prefixColumn}
            {selectable ? (
              <Table.Cell>
                <InlineCheckbox
                  label={label}
                  checked={checked}
                  onChange={() => {
                    select.toggle(row.key);
                  }}
                />
              </Table.Cell>
            ) : null}
            {row.cells
              .filter(({ column }) => groupBy !== column)
              .map(({ column, collapse, className, rendered, align }) => (
                <Table.Cell
                  // NOTE: TypeScript cannot track that `column` comes from an object with `string`-only keys.
                  key={column as string}
                  className={className}
                  collapse={collapse}
                  align={align}
                >
                  {rendered}
                </Table.Cell>
              ))}
          </Table.Row>
        );
      }),
    [
      sortedRows,
      selectable,
      groupBy,
      select,
      groupByColumnIndex,
      groupByValues,
    ],
  );

  return fullRows;
}
