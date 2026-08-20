import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderComponent } from "testing/utils";

import DataTable from "./DataTable";
import type { DataTableProps } from "./types";

describe("DataTable", () => {
  let initialProps: DataTableProps<
    { id: string; name: string; age: number },
    string,
    Record<string, number | string>
  >;

  beforeEach(() => {
    initialProps = {
      getKey: ({ id }): string => id,
      columns: {
        name: { header: "Name", map: ({ name }): string => name },
        age: { header: "Age", map: ({ age }): number => age },
      },
      data: [
        { id: "1", name: "Alice", age: 30 },
        { id: "2", name: "Bob", age: 25 },
      ],
    };
  });

  it("renders properly with column headers and row data", () => {
    renderComponent(<DataTable {...initialProps} />);
    expect(
      screen.getByRole("columnheader", { name: "Name" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Age" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "Alice" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "Bob" })).toBeInTheDocument();
  });

  it("renders the no rows message when data is empty", () => {
    renderComponent(<DataTable {...initialProps} data={[]} />);
    expect(screen.getByText("No rows")).toBeInTheDocument();
  });

  it("renders a custom no rows message", () => {
    renderComponent(
      <DataTable {...initialProps} data={[]} noRowsMessage="Nothing here" />,
    );
    expect(screen.getByText("Nothing here")).toBeInTheDocument();
  });

  describe("selectable", () => {
    it("renders the select-all checkbox when the rows are selectable", () => {
      renderComponent(<DataTable {...initialProps} />);
      expect(
        screen.getByRole("checkbox", { name: "Select all" }),
      ).toBeInTheDocument();
    });

    it("does not render the select-all checkbox when selectable=false", () => {
      renderComponent(<DataTable {...initialProps} selectable={false} />);
      expect(
        screen.queryByRole("checkbox", { name: "Select all" }),
      ).not.toBeInTheDocument();
    });

    it("shows 'Deselect all' label when all rows are selected", async () => {
      renderComponent(<DataTable {...initialProps} />);
      await userEvent.click(
        screen.getByRole("checkbox", { name: "Select all" }),
      );
      expect(
        screen.getByRole("checkbox", { name: "Deselect all" }),
      ).toBeInTheDocument();
    });

    it("shows indeterminate state when some rows are selected", async () => {
      renderComponent(<DataTable {...initialProps} />);
      // Click a single row checkbox — initially unchecked rows have "Deselect <key>" label.
      await userEvent.click(
        screen.getByRole("checkbox", { name: "Deselect 1" }),
      );
      const selectAll = screen.getByRole("checkbox", { name: "Select all" });
      expect((selectAll as HTMLInputElement).indeterminate).toBe(true);
    });

    it("clearing select-all does not affect a disabled row's checkbox", async () => {
      renderComponent(
        <DataTable {...initialProps} isRowDisabled={(row) => row.id === "1"} />,
      );
      // Select all selectable rows (only row 2).
      await userEvent.click(
        screen.getByRole("checkbox", { name: "Select all" }),
      );
      expect(screen.getByRole("checkbox", { name: "Select 2" })).toBeChecked();

      // Now deselect all — row 1's checkbox should still be unchecked, unchanged.
      await userEvent.click(
        screen.getByRole("checkbox", { name: "Deselect all" }),
      );
      expect(
        screen.getByRole("checkbox", { name: "Deselect 2" }),
      ).not.toBeChecked();
      expect(
        screen.getByRole("checkbox", { name: "Deselect 1" }),
      ).not.toBeChecked();
    });

    it("'Select all' does nothing when all rows are disabled", async () => {
      renderComponent(
        <DataTable {...initialProps} isRowDisabled={() => true} />,
      );
      // Clicking it does nothing — both row checkboxes remain unchecked.
      await userEvent.click(
        screen.getByRole("checkbox", {
          name: "Select all",
        }),
      );
      expect(
        screen.getByRole("checkbox", { name: "Select all" }),
      ).toBeInTheDocument();
      const rowCheckboxes = screen.getAllByRole("checkbox", {
        name: /Deselect [^a]/,
      });
      rowCheckboxes.forEach((checkbox) => expect(checkbox).not.toBeChecked());
    });

    it("deselects a previously selected row when it becomes disabled", async () => {
      const { rerender } = render(
        <DataTable {...initialProps} isRowDisabled={() => false} />,
      );
      // Select row 1.
      await userEvent.click(
        screen.getByRole("checkbox", { name: "Deselect 1" }),
      );
      expect(screen.getByRole("checkbox", { name: "Select 1" })).toBeChecked();

      // Now disable row 1 — it should be removed from the selection.
      rerender(
        <DataTable {...initialProps} isRowDisabled={(row) => row.id === "1"} />,
      );
      expect(
        screen.getByRole("checkbox", { name: "Deselect 1" }),
      ).not.toBeChecked();
    });
  });

  describe("isRowDisabled", () => {
    it("marks a row as disabled", () => {
      renderComponent(
        <DataTable {...initialProps} isRowDisabled={(row) => row.id === "1"} />,
      );
      const tableRows = screen.getAllByRole("row");
      const aliceRow = tableRows.find((row) =>
        row.textContent?.includes("Alice"),
      );
      const bobRow = tableRows.find((row) => row.textContent?.includes("Bob"));
      expect(aliceRow).toHaveAttribute("aria-disabled", "true");
      expect(bobRow).not.toHaveAttribute("aria-disabled", "true");
    });

    it("excludes disabled rows from select all", async () => {
      renderComponent(
        <DataTable {...initialProps} isRowDisabled={(row) => row.id === "1"} />,
      );
      const selectAll = screen.getByRole("checkbox", { name: "Select all" });
      await userEvent.click(selectAll);
      expect(screen.getByRole("checkbox", { name: "Select 2" })).toBeChecked();
      expect(
        screen.queryByRole("checkbox", { name: "Select 1" }),
      ).not.toBeInTheDocument();
    });
  });

  describe("isRowLoading", () => {
    it("excludes loading rows from select all", async () => {
      renderComponent(
        <DataTable {...initialProps} isRowLoading={(row) => row.id === "1"} />,
      );
      const selectAll = screen.getByRole("checkbox", { name: "Select all" });
      await userEvent.click(selectAll);
      expect(screen.getByRole("checkbox", { name: "Select 2" })).toBeChecked();
      // Loading rows show a spinner instead of a checkbox, so no checkbox exists for row 1.
      expect(
        screen.queryByRole("checkbox", { name: /1$/ }),
      ).not.toBeInTheDocument();
    });
  });
});

describe("DataTable.columnBuilder", () => {
  it("returns a column definition unchanged", () => {
    const builder = DataTable.columnBuilder<{
      id: string;
      name: string;
      age: number;
    }>();
    const colRaw = {
      header: "Name",
      map: (row: { id: string; name: string; age: number }): string => row.name,
    };
    const col = builder(colRaw);
    expect(col).toBe(colRaw);
  });
});
