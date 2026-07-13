import type { ComponentProps } from "react";
import { useMemo, type ReactNode } from "react";

import Table from "components/Table";

import type { FlatTableColumn } from "./types";

/**
 * Render all headers, ensuring that the `groupBy` header is moved to `prefix`.
 */
export default function useHeaders<TRow, TValues>({
  columns,
  groupBy,
  sort,
  toggleSort,
}: {
  columns: FlatTableColumn<keyof TValues, TRow, TValues[keyof TValues]>[];
  groupBy?: keyof TValues;
  sort: { key: keyof TValues; direction: "ascending" | "descending" } | null;
  toggleSort: (column: keyof TValues) => void;
}): {
  prefix: null | ReactNode;
  headers: ReactNode[];
} {
  // Render each header. This decouples rendering the individual cells from column re-ordering,
  // preventing unnecessary re-renders.
  // TODO: This isn't strictly correct yet, as `groupBy` should not be a dependency for this memo.
  const renderedHeaders = useMemo(
    () =>
      columns.map((column) => {
        let props: ComponentProps<typeof Table.Header.Cell> = {
          sortable: false,
        };

        // Add sorting controls if header is marked as sortable.
        if (column.sortable && groupBy !== column.key) {
          props = {
            sortable: true,
            onClick: (): void => {
              toggleSort(column.key);
            },
            sortDirection: sort?.key === column.key ? sort.direction : null,
          };
        }

        return {
          column,
          rendered: (
            <Table.Header.Cell
              // NOTE: TypeScript cannot track that `column.key` comes from an object with `string`-only keys.
              key={column.key as string}
              collapse={column.collapse}
              className={column.className}
              {...props}
            >
              {column.header}
            </Table.Header.Cell>
          ),
        };
      }),
    [columns, sort, toggleSort, groupBy],
  );

  // Sort the headers, moving the grouped header to the prefix if required.
  const { prefix, headers } = useMemo(() => {
    if (groupBy === undefined) {
      return {
        prefixHeader: null,
        headers: renderedHeaders.map(({ rendered }) => rendered),
      };
    }

    let prefixHeader = null;
    const orderedHeaders = [];
    for (const { rendered, column } of renderedHeaders) {
      if (column.key === groupBy) {
        prefixHeader = rendered;
      } else {
        orderedHeaders.push(rendered);
      }
    }
    return { prefix: prefixHeader, headers: orderedHeaders };
  }, [renderedHeaders, groupBy]);

  return { prefix, headers };
}
