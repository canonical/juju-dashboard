import { getAllByRole, queryHelpers } from "@testing-library/dom";

export const getCellByHeader = (
  container: HTMLElement,
  header: string,
): HTMLElement => {
  const table = container.closest("table");
  if (!table) {
    throw queryHelpers.getElementError(
      "This row doesn't appear within a table.",
      container,
    );
  }
  const th = getAllByRole(table, "columnheader", { name: header });
  if (th.length > 1) {
    throw queryHelpers.getElementError(
      `Found multiple elements with columnheader "${header}".`,
      container,
    );
  }
  const index = getAllByRole(table, "columnheader").indexOf(th[0]);
  const result = getAllByRole(container, "cell");
  return result[index];
};
